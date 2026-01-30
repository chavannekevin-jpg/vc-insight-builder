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

    const { roomId, message, history = [] } = await req.json();
    if (!roomId || !message) throw new Error("Missing roomId or message");

    // Verify room ownership
    const { data: room, error: roomError } = await supabase
      .from("investor_data_rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (roomError || !room) throw new Error("Room not found");
    if (room.investor_id !== user.id) throw new Error("Not authorized");

    // Get all processed files
    const { data: files, error: filesError } = await supabase
      .from("investor_data_room_files")
      .select("file_name, extracted_text")
      .eq("room_id", roomId)
      .eq("extraction_status", "completed");

    if (filesError) throw filesError;
    if (!files || files.length === 0) throw new Error("No processed documents found");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Build document context
    const documentContext = files.map(f => 
      `=== ${f.file_name} ===\n${f.extracted_text || "[No content]"}\n`
    ).join("\n\n");

    // Build messages
    const messages = [
      {
        role: "system",
        content: `You are an AI analyst assistant helping an investor analyze a company called "${room.company_name}". You have access to the following documents from their data room:

${files.map(f => `- ${f.file_name}`).join('\n')}

When answering questions:
1. Search through the documents to find relevant information
2. Always cite which document you found the information in
3. If you can't find specific information, say so clearly
4. Be precise with numbers, dates, and financial figures
5. Note any inconsistencies you find

Document contents:
${documentContext}`,
      },
      ...history.map((h: { role: string; content: string }) => ({
        role: h.role,
        content: h.content,
      })),
      {
        role: "user",
        content: message,
      },
    ];

    // Stream response with source extraction
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        stream: true,
        tools: [
          {
            type: "function",
            function: {
              name: "cite_sources",
              description: "Cite the sources used to answer the question",
              parameters: {
                type: "object",
                properties: {
                  sources: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        file_name: { type: "string" },
                        excerpt: { type: "string", description: "Brief quote or paraphrase from the source" },
                      },
                      required: ["file_name", "excerpt"],
                    },
                  },
                },
                required: ["sources"],
              },
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const err = await response.text();
      console.error("AI chat error:", err);
      throw new Error("Failed to generate response");
    }

    // Stream the response
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Data room chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
