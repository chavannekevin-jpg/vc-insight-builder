import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

// Safe base64 encoding that doesn't cause stack overflow
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000; // 32KB chunks
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(binary);
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Parse Excel file and extract all data as structured text
function parseExcelToText(buffer: ArrayBuffer, fileName: string): string {
  try {
    const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
    let fullText = `=== Excel File: ${fileName} ===\n\n`;
    
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      fullText += `### Sheet: ${sheetName}\n\n`;
      
      // Get range of used cells
      const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
      
      // Convert to array of arrays for better formatting
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as any[][];
      
      if (data.length === 0) {
        fullText += "(Empty sheet)\n\n";
        continue;
      }
      
      // Format as a simple table
      for (let rowIdx = 0; rowIdx < data.length; rowIdx++) {
        const row = data[rowIdx];
        if (row.every((cell: any) => cell === '' || cell === null || cell === undefined)) {
          continue; // Skip empty rows
        }
        
        // Format cells with proper spacing
        const formattedRow = row.map((cell: any, colIdx: number) => {
          if (cell === null || cell === undefined || cell === '') return '';
          // Format numbers nicely
          if (typeof cell === 'number') {
            if (Math.abs(cell) >= 1000000) {
              return `${(cell / 1000000).toFixed(2)}M`;
            } else if (Math.abs(cell) >= 1000) {
              return `${(cell / 1000).toFixed(1)}K`;
            }
            return cell.toLocaleString();
          }
          return String(cell).trim();
        }).filter((c: string) => c !== '');
        
        if (formattedRow.length > 0) {
          // For first few rows, they're likely headers
          if (rowIdx === 0) {
            fullText += `**${formattedRow.join(' | ')}**\n`;
          } else {
            fullText += `${formattedRow.join(' | ')}\n`;
          }
        }
      }
      
      fullText += "\n";
    }
    
    // Also include raw values for financial analysis
    fullText += "\n### Raw Data Summary\n\n";
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: null });
      
      if (jsonData.length > 0) {
        fullText += `#### ${sheetName}\n`;
        // Include first row as reference for column names
        const keys = Object.keys(jsonData[0] as object);
        fullText += `Columns: ${keys.join(', ')}\n`;
        fullText += `Rows: ${jsonData.length}\n`;
        
        // Include key financial figures if detected
        const financialKeywords = ['revenue', 'arr', 'mrr', 'burn', 'runway', 'cac', 'ltv', 'ebitda', 'profit', 'loss', 'expense', 'cost', 'salary', 'total', 'cash', 'balance'];
        
        for (const row of jsonData) {
          const rowObj = row as Record<string, any>;
          for (const [key, value] of Object.entries(rowObj)) {
            const keyLower = key.toLowerCase();
            if (financialKeywords.some(kw => keyLower.includes(kw)) && value !== null && value !== '') {
              fullText += `- ${key}: ${typeof value === 'number' ? value.toLocaleString() : value}\n`;
            }
          }
        }
        fullText += "\n";
      }
    }
    
    return fullText;
  } catch (error) {
    console.error("Excel parsing error:", error);
    return `[Excel file: ${fileName}]\nError parsing file: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

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
        console.log(`Processing file: ${file.file_name}, type: ${file.file_type}`);
        
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
          // Convert PDF to base64 safely (no stack overflow)
          const buffer = await fileData.arrayBuffer();
          const base64 = arrayBufferToBase64(buffer);
          const dataUrl = `data:application/pdf;base64,${base64}`;

          console.log(`PDF size: ${buffer.byteLength} bytes, base64 length: ${base64.length}`);

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
          pageCount = 1;

        } else if (file.file_type.includes("spreadsheet") || file.file_type.includes("excel") || file.file_type.includes("sheet")) {
          // Parse Excel using xlsx library
          const buffer = await fileData.arrayBuffer();
          console.log(`Excel file size: ${buffer.byteLength} bytes`);
          
          extractedText = parseExcelToText(buffer, file.file_name);
          console.log(`Excel extracted ${extractedText.length} characters`);
          pageCount = 1;

        } else if (file.file_type === "text/csv") {
          // CSV files - read as text
          extractedText = await fileData.text();
          pageCount = 1;

        } else if (file.file_type.startsWith("image/")) {
          // Extract text from image
          const buffer = await fileData.arrayBuffer();
          const base64 = arrayBufferToBase64(buffer);
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
                      text: "Extract and transcribe ALL text visible in this image. Include numbers, labels, and any data shown. If this is a chart or table, describe the data in detail.",
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

        console.log(`Extracted ${extractedText.length} characters from ${file.file_name}`);

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
