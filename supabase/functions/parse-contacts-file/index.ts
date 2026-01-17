import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Country to capital mapping with coordinates
const COUNTRY_CAPITALS: Record<string, { city: string; lat: number; lng: number }> = {
  "usa": { city: "Washington D.C.", lat: 38.9072, lng: -77.0369 },
  "united states": { city: "Washington D.C.", lat: 38.9072, lng: -77.0369 },
  "us": { city: "Washington D.C.", lat: 38.9072, lng: -77.0369 },
  "uk": { city: "London", lat: 51.5074, lng: -0.1278 },
  "united kingdom": { city: "London", lat: 51.5074, lng: -0.1278 },
  "france": { city: "Paris", lat: 48.8566, lng: 2.3522 },
  "germany": { city: "Berlin", lat: 52.5200, lng: 13.4050 },
  "spain": { city: "Madrid", lat: 40.4168, lng: -3.7038 },
  "italy": { city: "Rome", lat: 41.9028, lng: 12.4964 },
  "netherlands": { city: "Amsterdam", lat: 52.3676, lng: 4.9041 },
  "belgium": { city: "Brussels", lat: 50.8503, lng: 4.3517 },
  "switzerland": { city: "Bern", lat: 46.9480, lng: 7.4474 },
  "austria": { city: "Vienna", lat: 48.2082, lng: 16.3738 },
  "sweden": { city: "Stockholm", lat: 59.3293, lng: 18.0686 },
  "norway": { city: "Oslo", lat: 59.9139, lng: 10.7522 },
  "denmark": { city: "Copenhagen", lat: 55.6761, lng: 12.5683 },
  "finland": { city: "Helsinki", lat: 60.1699, lng: 24.9384 },
  "poland": { city: "Warsaw", lat: 52.2297, lng: 21.0122 },
  "portugal": { city: "Lisbon", lat: 38.7223, lng: -9.1393 },
  "ireland": { city: "Dublin", lat: 53.3498, lng: -6.2603 },
  "canada": { city: "Ottawa", lat: 45.4215, lng: -75.6972 },
  "mexico": { city: "Mexico City", lat: 19.4326, lng: -99.1332 },
  "brazil": { city: "Brasília", lat: -15.7975, lng: -47.8919 },
  "argentina": { city: "Buenos Aires", lat: -34.6037, lng: -58.3816 },
  "chile": { city: "Santiago", lat: -33.4489, lng: -70.6693 },
  "colombia": { city: "Bogotá", lat: 4.7110, lng: -74.0721 },
  "australia": { city: "Canberra", lat: -35.2809, lng: 149.1300 },
  "new zealand": { city: "Wellington", lat: -41.2865, lng: 174.7762 },
  "japan": { city: "Tokyo", lat: 35.6762, lng: 139.6503 },
  "china": { city: "Beijing", lat: 39.9042, lng: 116.4074 },
  "south korea": { city: "Seoul", lat: 37.5665, lng: 126.9780 },
  "korea": { city: "Seoul", lat: 37.5665, lng: 126.9780 },
  "india": { city: "New Delhi", lat: 28.6139, lng: 77.2090 },
  "singapore": { city: "Singapore", lat: 1.3521, lng: 103.8198 },
  "hong kong": { city: "Hong Kong", lat: 22.3193, lng: 114.1694 },
  "taiwan": { city: "Taipei", lat: 25.0330, lng: 121.5654 },
  "thailand": { city: "Bangkok", lat: 13.7563, lng: 100.5018 },
  "vietnam": { city: "Hanoi", lat: 21.0285, lng: 105.8542 },
  "indonesia": { city: "Jakarta", lat: -6.2088, lng: 106.8456 },
  "malaysia": { city: "Kuala Lumpur", lat: 3.1390, lng: 101.6869 },
  "philippines": { city: "Manila", lat: 14.5995, lng: 120.9842 },
  "israel": { city: "Tel Aviv", lat: 32.0853, lng: 34.7818 },
  "uae": { city: "Abu Dhabi", lat: 24.4539, lng: 54.3773 },
  "united arab emirates": { city: "Abu Dhabi", lat: 24.4539, lng: 54.3773 },
  "saudi arabia": { city: "Riyadh", lat: 24.7136, lng: 46.6753 },
  "qatar": { city: "Doha", lat: 25.2854, lng: 51.5310 },
  "egypt": { city: "Cairo", lat: 30.0444, lng: 31.2357 },
  "south africa": { city: "Pretoria", lat: -25.7479, lng: 28.2293 },
  "nigeria": { city: "Abuja", lat: 9.0765, lng: 7.3986 },
  "kenya": { city: "Nairobi", lat: -1.2921, lng: 36.8219 },
  "morocco": { city: "Rabat", lat: 34.0209, lng: -6.8416 },
  "russia": { city: "Moscow", lat: 55.7558, lng: 37.6173 },
  "turkey": { city: "Ankara", lat: 39.9334, lng: 32.8597 },
  "greece": { city: "Athens", lat: 37.9838, lng: 23.7275 },
  "czech republic": { city: "Prague", lat: 50.0755, lng: 14.4378 },
  "czechia": { city: "Prague", lat: 50.0755, lng: 14.4378 },
  "hungary": { city: "Budapest", lat: 47.4979, lng: 19.0402 },
  "romania": { city: "Bucharest", lat: 44.4268, lng: 26.1025 },
  "ukraine": { city: "Kyiv", lat: 50.4501, lng: 30.5234 },
  "estonia": { city: "Tallinn", lat: 59.4370, lng: 24.7536 },
  "latvia": { city: "Riga", lat: 56.9496, lng: 24.1052 },
  "lithuania": { city: "Vilnius", lat: 54.6872, lng: 25.2797 },
  "luxembourg": { city: "Luxembourg City", lat: 49.6116, lng: 6.1319 },
};

// Major cities for direct matching
const MAJOR_CITIES: Record<string, { lat: number; lng: number; country: string }> = {
  "san francisco": { lat: 37.7749, lng: -122.4194, country: "USA" },
  "new york": { lat: 40.7128, lng: -74.0060, country: "USA" },
  "new york city": { lat: 40.7128, lng: -74.0060, country: "USA" },
  "nyc": { lat: 40.7128, lng: -74.0060, country: "USA" },
  "london": { lat: 51.5074, lng: -0.1278, country: "UK" },
  "paris": { lat: 48.8566, lng: 2.3522, country: "France" },
  "berlin": { lat: 52.5200, lng: 13.4050, country: "Germany" },
  "singapore": { lat: 1.3521, lng: 103.8198, country: "Singapore" },
  "tokyo": { lat: 35.6762, lng: 139.6503, country: "Japan" },
  "tel aviv": { lat: 32.0853, lng: 34.7818, country: "Israel" },
  "dubai": { lat: 25.2048, lng: 55.2708, country: "UAE" },
  "sydney": { lat: -33.8688, lng: 151.2093, country: "Australia" },
  "toronto": { lat: 43.6532, lng: -79.3832, country: "Canada" },
  "boston": { lat: 42.3601, lng: -71.0589, country: "USA" },
  "los angeles": { lat: 34.0522, lng: -118.2437, country: "USA" },
  "la": { lat: 34.0522, lng: -118.2437, country: "USA" },
  "miami": { lat: 25.7617, lng: -80.1918, country: "USA" },
  "austin": { lat: 30.2672, lng: -97.7431, country: "USA" },
  "seattle": { lat: 47.6062, lng: -122.3321, country: "USA" },
  "chicago": { lat: 41.8781, lng: -87.6298, country: "USA" },
  "amsterdam": { lat: 52.3676, lng: 4.9041, country: "Netherlands" },
  "stockholm": { lat: 59.3293, lng: 18.0686, country: "Sweden" },
  "mumbai": { lat: 19.0760, lng: 72.8777, country: "India" },
  "bangalore": { lat: 12.9716, lng: 77.5946, country: "India" },
  "bengaluru": { lat: 12.9716, lng: 77.5946, country: "India" },
  "hong kong": { lat: 22.3193, lng: 114.1694, country: "China" },
  "shanghai": { lat: 31.2304, lng: 121.4737, country: "China" },
  "beijing": { lat: 39.9042, lng: 116.4074, country: "China" },
  "denver": { lat: 39.7392, lng: -104.9903, country: "USA" },
  "atlanta": { lat: 33.7490, lng: -84.3880, country: "USA" },
  "munich": { lat: 48.1351, lng: 11.5820, country: "Germany" },
  "frankfurt": { lat: 50.1109, lng: 8.6821, country: "Germany" },
  "zurich": { lat: 47.3769, lng: 8.5417, country: "Switzerland" },
  "geneva": { lat: 46.2044, lng: 6.1432, country: "Switzerland" },
  "brussels": { lat: 50.8503, lng: 4.3517, country: "Belgium" },
  "madrid": { lat: 40.4168, lng: -3.7038, country: "Spain" },
  "barcelona": { lat: 41.3851, lng: 2.1734, country: "Spain" },
  "lisbon": { lat: 38.7223, lng: -9.1393, country: "Portugal" },
  "dublin": { lat: 53.3498, lng: -6.2603, country: "Ireland" },
  "vienna": { lat: 48.2082, lng: 16.3738, country: "Austria" },
  "copenhagen": { lat: 55.6761, lng: 12.5683, country: "Denmark" },
  "oslo": { lat: 59.9139, lng: 10.7522, country: "Norway" },
  "helsinki": { lat: 60.1699, lng: 24.9384, country: "Finland" },
  "tallinn": { lat: 59.4370, lng: 24.7536, country: "Estonia" },
  "warsaw": { lat: 52.2297, lng: 21.0122, country: "Poland" },
  "prague": { lat: 50.0755, lng: 14.4378, country: "Czech Republic" },
  "budapest": { lat: 47.4979, lng: 19.0402, country: "Hungary" },
  "seoul": { lat: 37.5665, lng: 126.9780, country: "South Korea" },
  "taipei": { lat: 25.0330, lng: 121.5654, country: "Taiwan" },
  "bangkok": { lat: 13.7563, lng: 100.5018, country: "Thailand" },
  "jakarta": { lat: -6.2088, lng: 106.8456, country: "Indonesia" },
  "kuala lumpur": { lat: 3.1390, lng: 101.6869, country: "Malaysia" },
  "manila": { lat: 14.5995, lng: 120.9842, country: "Philippines" },
  "delhi": { lat: 28.6139, lng: 77.2090, country: "India" },
  "new delhi": { lat: 28.6139, lng: 77.2090, country: "India" },
  "mexico city": { lat: 19.4326, lng: -99.1332, country: "Mexico" },
  "são paulo": { lat: -23.5505, lng: -46.6333, country: "Brazil" },
  "sao paulo": { lat: -23.5505, lng: -46.6333, country: "Brazil" },
  "buenos aires": { lat: -34.6037, lng: -58.3816, country: "Argentina" },
  "santiago": { lat: -33.4489, lng: -70.6693, country: "Chile" },
  "bogota": { lat: 4.7110, lng: -74.0721, country: "Colombia" },
  "bogotá": { lat: 4.7110, lng: -74.0721, country: "Colombia" },
  "cairo": { lat: 30.0444, lng: 31.2357, country: "Egypt" },
  "johannesburg": { lat: -26.2041, lng: 28.0473, country: "South Africa" },
  "cape town": { lat: -33.9249, lng: 18.4241, country: "South Africa" },
  "nairobi": { lat: -1.2921, lng: 36.8219, country: "Kenya" },
  "lagos": { lat: 6.5244, lng: 3.3792, country: "Nigeria" },
  "moscow": { lat: 55.7558, lng: 37.6173, country: "Russia" },
  "istanbul": { lat: 41.0082, lng: 28.9784, country: "Turkey" },
  "athens": { lat: 37.9838, lng: 23.7275, country: "Greece" },
  "rome": { lat: 41.9028, lng: 12.4964, country: "Italy" },
  "milan": { lat: 45.4642, lng: 9.1900, country: "Italy" },
  // Baltic states
  "vilnius": { lat: 54.6872, lng: 25.2797, country: "Lithuania" },
  "kaunas": { lat: 54.8985, lng: 23.9036, country: "Lithuania" },
  "riga": { lat: 56.9496, lng: 24.1052, country: "Latvia" },
  // Eastern Europe
  "bucharest": { lat: 44.4268, lng: 26.1025, country: "Romania" },
  "kyiv": { lat: 50.4501, lng: 30.5234, country: "Ukraine" },
  "kiev": { lat: 50.4501, lng: 30.5234, country: "Ukraine" },
  "krakow": { lat: 50.0647, lng: 19.9450, country: "Poland" },
  "wroclaw": { lat: 51.1079, lng: 17.0385, country: "Poland" },
  "sofia": { lat: 42.6977, lng: 23.3219, country: "Bulgaria" },
  "belgrade": { lat: 44.7866, lng: 20.4489, country: "Serbia" },
  "zagreb": { lat: 45.8150, lng: 15.9819, country: "Croatia" },
  "ljubljana": { lat: 46.0569, lng: 14.5058, country: "Slovenia" },
  "bratislava": { lat: 48.1486, lng: 17.1077, country: "Slovakia" },
  "minsk": { lat: 53.9006, lng: 27.5590, country: "Belarus" },
  "chisinau": { lat: 47.0105, lng: 28.8638, country: "Moldova" },
  // Balkans
  "sarajevo": { lat: 43.8563, lng: 18.4131, country: "Bosnia and Herzegovina" },
  "skopje": { lat: 41.9973, lng: 21.4280, country: "North Macedonia" },
  "tirana": { lat: 41.3275, lng: 19.8187, country: "Albania" },
  "podgorica": { lat: 42.4304, lng: 19.2594, country: "Montenegro" },
  "pristina": { lat: 42.6629, lng: 21.1655, country: "Kosovo" },
  // Scandinavia (already have Stockholm, Oslo, Helsinki, Copenhagen)
  "reykjavik": { lat: 64.1466, lng: -21.9426, country: "Iceland" },
  "gothenburg": { lat: 57.7089, lng: 11.9746, country: "Sweden" },
  "malmo": { lat: 55.6050, lng: 13.0038, country: "Sweden" },
  "bergen": { lat: 60.3913, lng: 5.3221, country: "Norway" },
  "turku": { lat: 60.4518, lng: 22.2666, country: "Finland" },
  // Western Europe extras
  "lyon": { lat: 45.7640, lng: 4.8357, country: "France" },
  "marseille": { lat: 43.2965, lng: 5.3698, country: "France" },
  "nice": { lat: 43.7102, lng: 7.2620, country: "France" },
  "hamburg": { lat: 53.5511, lng: 9.9937, country: "Germany" },
  "cologne": { lat: 50.9375, lng: 6.9603, country: "Germany" },
  "dusseldorf": { lat: 51.2277, lng: 6.7735, country: "Germany" },
  "stuttgart": { lat: 48.7758, lng: 9.1829, country: "Germany" },
  "antwerp": { lat: 51.2194, lng: 4.4025, country: "Belgium" },
  "rotterdam": { lat: 51.9244, lng: 4.4777, country: "Netherlands" },
  "the hague": { lat: 52.0705, lng: 4.3007, country: "Netherlands" },
  "edinburgh": { lat: 55.9533, lng: -3.1883, country: "UK" },
  "manchester": { lat: 53.4808, lng: -2.2426, country: "UK" },
  "birmingham": { lat: 52.4862, lng: -1.8904, country: "UK" },
  // Southern Europe
  "valencia": { lat: 39.4699, lng: -0.3763, country: "Spain" },
  "seville": { lat: 37.3891, lng: -5.9845, country: "Spain" },
  "porto": { lat: 41.1579, lng: -8.6291, country: "Portugal" },
  "florence": { lat: 43.7696, lng: 11.2558, country: "Italy" },
  "naples": { lat: 40.8518, lng: 14.2681, country: "Italy" },
  "turin": { lat: 45.0703, lng: 7.6869, country: "Italy" },
  "venice": { lat: 45.4408, lng: 12.3155, country: "Italy" },
  "valletta": { lat: 35.8989, lng: 14.5146, country: "Malta" },
  "nicosia": { lat: 35.1856, lng: 33.3823, country: "Cyprus" },
  // Microstates
  "luxembourg": { lat: 49.6116, lng: 6.1319, country: "Luxembourg" },
  "luxembourg city": { lat: 49.6116, lng: 6.1319, country: "Luxembourg" },
  "monaco": { lat: 43.7384, lng: 7.4246, country: "Monaco" },
  "andorra la vella": { lat: 42.5063, lng: 1.5218, country: "Andorra" },
  "vaduz": { lat: 47.1410, lng: 9.5209, country: "Liechtenstein" },
  "san marino": { lat: 43.9424, lng: 12.4578, country: "San Marino" },
  // Caucasus (sometimes considered Europe)
  "tbilisi": { lat: 41.7151, lng: 44.8271, country: "Georgia" },
  "yerevan": { lat: 40.1792, lng: 44.4991, country: "Armenia" },
  "baku": { lat: 40.4093, lng: 49.8671, country: "Azerbaijan" },
};

const normalizeCityKey = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .split(",")[0]
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’'`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const normalizeCountryKey = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

function parseExcelToText(base64Data: string): string {
  try {
    // Decode base64 to binary
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Parse the workbook
    const workbook = XLSX.read(bytes, { type: 'array' });
    
    // Get all sheet data as text
    let textContent = '';
    
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      
      // Convert sheet to JSON for better structure
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      
      if (jsonData.length > 0) {
        textContent += `\n=== Sheet: ${sheetName} ===\n`;
        
        // Get headers from first row
        const headers = jsonData[0] as string[];
        textContent += `Headers: ${headers.join(' | ')}\n\n`;
        
        // Process data rows
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row.some(cell => cell !== '')) {
            const rowData = headers.map((header, idx) => `${header}: ${row[idx] || 'N/A'}`).join(', ');
            textContent += `Row ${i}: ${rowData}\n`;
          }
        }
      }
    }
    
    return textContent;
  } catch (error) {
    console.error('Error parsing Excel:', error);
    throw new Error('Failed to parse Excel file');
  }
}

function parseCSVToText(base64Data: string): string {
  try {
    const textContent = atob(base64Data);
    return textContent;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    throw new Error('Failed to parse CSV file');
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileBase64, fileName, fileType } = await req.json();

    if (!fileBase64 || !fileName) {
      return new Response(
        JSON.stringify({ error: 'No file data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing file: ${fileName}, type: ${fileType}, base64 length: ${fileBase64.length}`);

    // Parse the file to text based on type
    let textContent: string;
    const lowerFileName = fileName.toLowerCase();
    
    if (lowerFileName.endsWith('.xlsx') || lowerFileName.endsWith('.xls')) {
      console.log('Parsing Excel file...');
      textContent = parseExcelToText(fileBase64);
    } else if (lowerFileName.endsWith('.csv')) {
      console.log('Parsing CSV file...');
      textContent = parseCSVToText(fileBase64);
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported file type. Please upload .xlsx, .xls, or .csv files.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Parsed text content length: ${textContent.length}`);
    console.log(`First 500 chars: ${textContent.substring(0, 500)}`);

    // Build the AI prompt
    const systemPrompt = `You are an expert at extracting investor contact information from spreadsheet data.
Your task is to analyze the provided spreadsheet content and extract a list of investor contacts.

For each contact found, extract the following fields:
- name: The person's full name (required)
- organization_name: The fund, firm, or company name
- email: Email address
- phone: Phone number
- city: City location (if only a country is provided, leave city empty but set the country)
- country: Country
- stages: Array of investment stages they focus on (e.g., ["Pre-Seed", "Seed", "Series A"])
- linkedin_url: LinkedIn profile URL
- fund_size: Fund size in millions (just the number, e.g., 100 for $100M)
- ticket_min: Minimum ticket size in thousands (just the number, e.g., 50 for $50K)
- ticket_max: Maximum ticket size in thousands (just the number, e.g., 500 for $500K)
- notes: Any additional relevant information

Return ONLY valid JSON in this exact format:
{
  "contacts": [
    {
      "name": "John Smith",
      "organization_name": "Acme Ventures",
      "email": "john@acme.vc",
      "phone": "+1 555 123 4567",
      "city": "San Francisco",
      "country": "USA",
      "stages": ["Seed", "Series A"],
      "linkedin_url": "https://linkedin.com/in/johnsmith",
      "fund_size": 100,
      "ticket_min": 50,
      "ticket_max": 500,
      "notes": "Focus on B2B SaaS"
    }
  ],
  "total_found": 1,
  "confidence": 0.9
}

Important rules:
- Only include contacts that appear to be investors, VCs, angels, or fund representatives
- Skip rows that are clearly headers or metadata
- If a field is not available, omit it or set to null
- For stages, normalize to: "Pre-Seed", "Seed", "Series A", "Series B", "Series C", "Growth"
- Be thorough - extract ALL investor contacts you can find
- If the location appears to be just a country name (e.g., "France", "Germany"), set it as country and leave city null
- Extract as much information as possible from the data`;

    const userPrompt = `Please analyze this spreadsheet data and extract all investor contact information.\n\n${textContent}`;

    // Call AI API with authorization
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Calling AI API with text content...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 32000, // Increased for larger files
        response_format: { type: 'json_object' }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content returned from AI');
    }

    console.log('AI response received, parsing...');

    // Parse the JSON response
    let parsed;
    try {
      // Clean up potential markdown code blocks
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      
      cleanContent = cleanContent.trim();
      
      // Try to parse the JSON
      try {
        parsed = JSON.parse(cleanContent);
      } catch (firstAttempt) {
        // If parsing fails, try to repair truncated JSON
        console.log('First parse attempt failed, trying to repair JSON...');
        
        // Check if the JSON appears truncated (missing closing braces/brackets)
        let repairedContent = cleanContent;
        
        // Count open/close brackets and braces
        const openBraces = (repairedContent.match(/{/g) || []).length;
        const closeBraces = (repairedContent.match(/}/g) || []).length;
        const openBrackets = (repairedContent.match(/\[/g) || []).length;
        const closeBrackets = (repairedContent.match(/]/g) || []).length;
        
        // If we have more opening than closing, the JSON is likely truncated
        if (openBrackets > closeBrackets || openBraces > closeBraces) {
          console.log(`Detected truncated JSON: ${openBraces} { vs ${closeBraces} }, ${openBrackets} [ vs ${closeBrackets} ]`);
          
          // Try to find the last complete object in the contacts array
          // Look for the last complete contact object (ends with })
          const lastCompleteObjectMatch = repairedContent.match(/^([\s\S]*\})\s*,?\s*(\{[^}]*)?$/);
          if (lastCompleteObjectMatch) {
            repairedContent = lastCompleteObjectMatch[1];
          }
          
          // Add missing brackets and braces
          const missingBrackets = openBrackets - closeBrackets;
          const missingBraces = openBraces - closeBraces;
          
          // Close any open arrays first, then objects
          for (let i = 0; i < missingBrackets; i++) {
            repairedContent += ']';
          }
          for (let i = 0; i < missingBraces; i++) {
            repairedContent += '}';
          }
          
          console.log('Attempting to parse repaired JSON...');
        }
        
        parsed = JSON.parse(repairedContent);
        console.log(`Successfully parsed repaired JSON with ${parsed.contacts?.length || 0} contacts`);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content.substring(0, 500) + '...');
      throw new Error('Failed to parse AI response as JSON. The file may be too large - try splitting it into smaller files.');
    }

    // Enrich contacts with location data
    if (parsed.contacts && Array.isArray(parsed.contacts)) {
      parsed.contacts = parsed.contacts.map((contact: any) => {
        let enrichedCity = contact.city;
        let enrichedCountry = contact.country;
        let cityLat = null;
        let cityLng = null;

        // First try to match city directly
        if (contact.city) {
          const cityKey = normalizeCityKey(contact.city);
          if (MAJOR_CITIES[cityKey]) {
            cityLat = MAJOR_CITIES[cityKey].lat;
            cityLng = MAJOR_CITIES[cityKey].lng;
            enrichedCountry = enrichedCountry || MAJOR_CITIES[cityKey].country;
          }
        }

        // If no city but has country, use capital
        if (!contact.city && contact.country) {
          const countryKey = normalizeCountryKey(contact.country);
          if (COUNTRY_CAPITALS[countryKey]) {
            enrichedCity = COUNTRY_CAPITALS[countryKey].city;
            cityLat = COUNTRY_CAPITALS[countryKey].lat;
            cityLng = COUNTRY_CAPITALS[countryKey].lng;
            contact.location_note = `Location set to capital city (${enrichedCity}) - please update if different`;
          }
        }

        // Check if city field is actually a country
        if (contact.city && cityLat == null) {
          const cityAsCountry = normalizeCountryKey(contact.city);
          if (COUNTRY_CAPITALS[cityAsCountry]) {
            enrichedCity = COUNTRY_CAPITALS[cityAsCountry].city;
            enrichedCountry = contact.city; // The "city" was actually a country
            cityLat = COUNTRY_CAPITALS[cityAsCountry].lat;
            cityLng = COUNTRY_CAPITALS[cityAsCountry].lng;
            contact.location_note = `Location set to capital city (${enrichedCity}) - please update if different`;
          }
        }

        // Fallback: if city exists and country exists but no coordinates, use country capital
        if (contact.city && contact.country && cityLat == null) {
          const countryKey = normalizeCountryKey(contact.country);
          if (COUNTRY_CAPITALS[countryKey]) {
            // Keep the original city name but use country capital coordinates as approximation
            cityLat = COUNTRY_CAPITALS[countryKey].lat;
            cityLng = COUNTRY_CAPITALS[countryKey].lng;
            contact.location_note = `Using country capital coordinates as approximation for ${contact.city}`;
          }
        }

        return {
          ...contact,
          city: enrichedCity,
          country: enrichedCountry,
          city_lat: cityLat,
          city_lng: cityLng,
          needs_location: !cityLat && !contact.city && !contact.country,
        };
      });
    }

    console.log(`Extracted ${parsed.contacts?.length || 0} contacts`);

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error processing file:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process file' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
