import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Social media crawler User-Agent patterns
const CRAWLER_PATTERNS = [
  'LinkedInBot',
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'WhatsApp',
  'Slackbot',
  'TelegramBot',
  'Discordbot',
  'Pinterest',
  'Google-InspectionTool',
  'Googlebot',
];

function isCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return CRAWLER_PATTERNS.some(pattern => 
    userAgent.toLowerCase().includes(pattern.toLowerCase())
  );
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userAgent = req.headers.get('user-agent');
    const path = url.searchParams.get('path') || '/sample-memo';
    
    console.log(`OG Meta Handler - Path: ${path}, User-Agent: ${userAgent?.substring(0, 50)}...`);
    
    // Check if request is from a social crawler
    if (!isCrawler(userAgent)) {
      console.log('Not a crawler, returning redirect instructions');
      return new Response(JSON.stringify({ 
        isCrawler: false,
        message: 'Not a social media crawler'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Crawler detected, serving OG meta tags');
    
    // Base URL for the app
    const baseUrl = 'https://uglybaby.co';
    
    // Sample memo specific meta tags
    if (path.includes('sample-memo')) {
      const ogHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Sample VC Investment Memo - CarbonPrint | UglyBaby</title>
  
  <!-- Primary Meta Tags -->
  <meta name="title" content="Sample VC Investment Memo - CarbonPrint | UglyBaby">
  <meta name="description" content="See exactly what VCs write about startups after the partner meeting. Full investment memo example for a climate tech company raising pre-seed funding.">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${baseUrl}/sample-memo?view=full">
  <meta property="og:title" content="Sample VC Investment Memo - CarbonPrint">
  <meta property="og:description" content="See exactly what VCs write about startups after the partner meeting. Full investment memo example for a climate tech company raising pre-seed funding.">
  <meta property="og:image" content="${baseUrl}/sample-memo-og.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="UglyBaby">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${baseUrl}/sample-memo?view=full">
  <meta property="twitter:title" content="Sample VC Investment Memo - CarbonPrint">
  <meta property="twitter:description" content="See exactly what VCs write about startups after the partner meeting. Full investment memo example for a climate tech company.">
  <meta property="twitter:image" content="${baseUrl}/sample-memo-og.png">
  
  <!-- LinkedIn specific -->
  <meta name="author" content="UglyBaby">
  <meta property="article:author" content="UglyBaby">
</head>
<body>
  <h1>Sample VC Investment Memo - CarbonPrint</h1>
  <p>See exactly what VCs write about startups after the partner meeting.</p>
  <p>This full investment memo example shows how venture capitalists analyze climate tech companies raising pre-seed funding.</p>
  <a href="${baseUrl}/sample-memo?view=full">View the full memo</a>
</body>
</html>`;

      return new Response(ogHtml, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600'
        },
      });
    }

    // Default response for unknown paths
    return new Response(JSON.stringify({ 
      error: 'Unknown path',
      path 
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in og-meta-handler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
