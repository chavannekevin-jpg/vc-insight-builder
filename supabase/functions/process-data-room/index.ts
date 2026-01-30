import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: { user } } = await createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    ).auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { roomId } = await req.json();
    if (!roomId) throw new Error("Missing roomId");

    // Verify room ownership
    const { data: room, error: roomError } = await supabase
      .from("investor_data_rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (roomError || !room) throw new Error("Room not found");
    if (room.investor_id !== user.id) throw new Error("Not authorized");

    // Get pending files
    const { data: files, error: filesError } = await supabase
      .from("investor_data_room_files")
      .select("*")
      .eq("room_id", roomId)
      .in("extraction_status", ["pending", "error"]);

    if (filesError) throw filesError;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Process each file
    for (const file of files || []) {
      try {
        // Update status to processing
        await supabase
          .from("investor_data_room_files")
          .update({ extraction_status: "processing" })
          .eq("id", file.id);

        // Download file from storage
        const { data: fileData, error: downloadError } = await supabase.storage
          .from("data-room-files")
          .download(file.storage_path);

        if (downloadError) throw downloadError;

        let extractedText = "";
        let pageCount = 0;

        if (file.file_type === "application/pdf") {
          // Convert PDF to base64 for vision extraction
          const bytes = await fileData.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));
          const dataUrl = `data:application/pdf;base64,${base64}`;

          // Use AI to extract text from PDF
          const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: `Extract ALL text content from this PDF document. Preserve structure, headings, bullet points, and tables as much as possible. Output the extracted text in a clean, readable format. Include all numbers, dates, and financial figures exactly as they appear.`,
                    },
                    {
                      type: "image_url",
                      image_url: { url: dataUrl },
                    },
                  ],
                },
              ],
              max_tokens: 16000,
            }),
          });

          if (!response.ok) {
            const err = await response.text();
            console.error("AI extraction error:", err);
            throw new Error("Failed to extract PDF content");
          }

          const result = await response.json();
          extractedText = result.choices?.[0]?.message?.content || "";
          pageCount = 1; // Estimate, could be improved

        } else if (file.file_type.includes("spreadsheet") || file.file_type.includes("excel") || file.file_type === "text/csv") {
          // For spreadsheets, read as text
          extractedText = await fileData.text();
          pageCount = 1;

        } else if (file.file_type.startsWith("image/")) {
          // Extract text from image
          const bytes = await fileData.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));
          const dataUrl = `data:${file.file_type};base64,${base64}`;

          const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: "Extract and transcribe ALL text visible in this image. Include numbers, labels, and any data shown.",
                    },
                    {
                      type: "image_url",
                      image_url: { url: dataUrl },
                    },
                  ],
                },
              ],
              max_tokens: 8000,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            extractedText = result.choices?.[0]?.message?.content || "";
          }
          pageCount = 1;

        } else {
          // Try to read as text
          try {
            extractedText = await fileData.text();
          } catch {
            extractedText = `[Binary file: ${file.file_name}]`;
          }
          pageCount = 1;
        }

        // Update file with extracted text
        await supabase
          .from("investor_data_room_files")
          .update({
            extracted_text: extractedText,
            extraction_status: "completed",
            page_count: pageCount,
          })
          .eq("id", file.id);

      } catch (err) {
        console.error(`Error processing file ${file.file_name}:`, err);
        await supabase
          .from("investor_data_room_files")
          .update({ extraction_status: "error" })
          .eq("id", file.id);
      }
    }

    // Check if all files are processed
    const { data: allFiles } = await supabase
      .from("investor_data_room_files")
      .select("extraction_status")
      .eq("room_id", roomId);

    const allDone = allFiles?.every(f => f.extraction_status === "completed" || f.extraction_status === "error");
    
    if (allDone) {
      await supabase
        .from("investor_data_rooms")
        .update({ status: "ready" })
        .eq("id", roomId);
    }

    return new Response(
      JSON.stringify({ success: true, processed: files?.length || 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Process data room error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
