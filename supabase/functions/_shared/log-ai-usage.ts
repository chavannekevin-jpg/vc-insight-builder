import { createClient } from "https://esm.sh/@supabase/supabase-js@2.84.0";

// Cost per 1M tokens (USD)
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  "google/gemini-2.5-pro": { input: 1.25, output: 10.0 },
  "google/gemini-2.5-flash": { input: 0.15, output: 0.6 },
  "google/gemini-2.5-flash-lite": { input: 0.075, output: 0.3 },
  "google/gemini-3-flash-preview": { input: 0.15, output: 0.6 },
  "google/gemini-3-pro-preview": { input: 1.25, output: 10.0 },
  "openai/gpt-5": { input: 5.0, output: 15.0 },
  "openai/gpt-5-mini": { input: 0.4, output: 1.6 },
  "openai/gpt-5-nano": { input: 0.1, output: 0.4 },
};

function estimateCost(model: string, promptTokens: number, completionTokens: number): number {
  const costs = MODEL_COSTS[model] || { input: 0.15, output: 0.6 }; // default to flash pricing
  return (promptTokens * costs.input + completionTokens * costs.output) / 1_000_000;
}

interface LogAIUsageOptions {
  functionName: string;
  model: string;
  companyId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

interface AICallResult {
  response: Response;
  data: any;
  durationMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

/**
 * Wraps a fetch call to the AI gateway and logs usage to ai_usage_logs.
 * Returns the parsed JSON data along with usage metrics.
 */
export async function callAIWithLogging(
  fetchFn: () => Promise<Response>,
  options: LogAIUsageOptions
): Promise<AICallResult> {
  const startTime = Date.now();
  let status = "success";
  let errorMessage: string | null = null;
  let promptTokens = 0;
  let completionTokens = 0;
  let totalTokens = 0;
  let data: any = null;
  let response: Response;

  try {
    response = await fetchFn();
    const durationMs = Date.now() - startTime;

    if (!response.ok) {
      status = "error";
      errorMessage = `HTTP ${response.status}`;
      // Clone response so caller can still read it
      const cloned = response.clone();
      try {
        const errText = await cloned.text();
        errorMessage = `HTTP ${response.status}: ${errText.slice(0, 500)}`;
      } catch {}

      // Log the error
      logToDatabase({
        ...options,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        estimatedCostUsd: 0,
        durationMs,
        status,
        errorMessage,
      });

      return { response, data: null, durationMs, promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCostUsd: 0 };
    }

    // Clone before reading so caller can also read if needed
    const cloned = response.clone();
    data = await cloned.json();

    // Extract token usage from response
    const usage = data.usage;
    if (usage) {
      promptTokens = usage.prompt_tokens || 0;
      completionTokens = usage.completion_tokens || 0;
      totalTokens = usage.total_tokens || promptTokens + completionTokens;
    }

    const estimatedCostUsd = estimateCost(options.model, promptTokens, completionTokens);

    // Log success asynchronously (fire-and-forget)
    logToDatabase({
      ...options,
      promptTokens,
      completionTokens,
      totalTokens,
      estimatedCostUsd,
      durationMs,
      status,
      errorMessage: null,
    });

    return { response, data, durationMs, promptTokens, completionTokens, totalTokens, estimatedCostUsd };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    status = "error";
    errorMessage = error instanceof Error ? error.message : "Unknown error";

    logToDatabase({
      ...options,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      estimatedCostUsd: 0,
      durationMs,
      status,
      errorMessage,
    });

    throw error;
  }
}

interface LogEntry {
  functionName: string;
  model: string;
  companyId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  durationMs: number;
  status: string;
  errorMessage: string | null;
}

function logToDatabase(entry: LogEntry): void {
  // Fire-and-forget: don't await, don't block the main flow
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceKey) {
    console.warn("[ai-usage-log] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY, skipping log");
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  supabase
    .from("ai_usage_logs")
    .insert({
      function_name: entry.functionName,
      model: entry.model,
      prompt_tokens: entry.promptTokens,
      completion_tokens: entry.completionTokens,
      total_tokens: entry.totalTokens,
      estimated_cost_usd: entry.estimatedCostUsd,
      company_id: entry.companyId || null,
      user_id: entry.userId || null,
      duration_ms: entry.durationMs,
      status: entry.status,
      error_message: entry.errorMessage,
      metadata: entry.metadata || {},
    })
    .then(({ error }) => {
      if (error) console.error("[ai-usage-log] Failed to log:", error.message);
    });
}
