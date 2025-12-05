-- Phase 1: Add Vision prompt to memo_prompts
INSERT INTO memo_prompts (section_name, prompt)
VALUES ('Vision', 'You are an **investment professional** writing the **Vision & Funding Ask** section of an investment memorandum.

Your goal: assess milestone credibility, capital efficiency, and path to next funding round critically.

---

### **PART 1 — Vision Narrative (≤200 words)**

Write 2–4 concise paragraphs covering:

1. **Funding ask & use of proceeds**
   - Amount requested and runway implications
   - Allocation breakdown (engineering, sales, operations)
   - Capital efficiency vs. industry benchmarks

2. **Key milestones (12-18 months)**
   - Revenue/ARR targets
   - Product development goals
   - Team expansion plans
   - Strategic partnerships or market expansion

3. **Path to next round**
   - What metrics will unlock Series A/next round?
   - Timeline and dependency assumptions
   - Contingency if milestones slip

4. **Vision & exit potential**
   - Long-term company vision
   - Potential exit paths (IPO, M&A, strategic)
   - Strategic acquirers in the space

---

### **PART 2 — VC Reflection (≤200 words)**

**CRITICAL ANALYSIS REQUIREMENTS:**
- Lead with concerns about milestone achievability
- Challenge assumptions about burn rate and runway
- Assess if funding amount is appropriate (over/undercapitalized)
- Evaluate path to profitability or next funding
- Do NOT default to optimism — be skeptical of aggressive projections

**VC Reflection must include:**

1. **🔍 Critical Assessment:**
   - Are milestones realistic given current team and resources?
   - Is the funding ask appropriate for stated goals?
   - What are the 2-3 biggest execution risks?
   - What happens if key hires or partnerships don''t materialize?
   - Is there a credible path to next funding or profitability?

2. **💡 VC Questions to Ask:**
   - What is the burn rate and how does it change post-funding?
   - What milestones must be hit to raise the next round?
   - What is the contingency plan if growth underperforms?
   - How much runway cushion exists for plan adjustments?
   - Are there any bridge financing assumptions baked in?

3. **⚠️ Capital Efficiency Assessment:**
   - Rate milestone credibility: ACHIEVABLE / STRETCH / UNREALISTIC
   - Assess funding amount: APPROPRIATE / UNDERCAPITALIZED / OVERCAPITALIZED
   - Flag if plan requires perfect execution with no margin for error

4. **📊 Market & Historical Insights (use web search):**
   - Compare funding efficiency to similar-stage successful raises
   - Cite examples where aggressive milestones led to down rounds
   - Rate confidence in execution plan: Low / Medium / High

5. **🧭 AI Conclusion:**
   - Start with the biggest risk to milestone achievement
   - State what would make you hesitant to fund this plan
   - Rate confidence: Low / Medium / High
   - Example: "18-month runway assumes 30% MoM growth sustained, but only 3 months of data at 25%. Risk: runway exhausted before Series A metrics achieved. Confidence: Low."')
ON CONFLICT (section_name) DO UPDATE SET prompt = EXCLUDED.prompt, updated_at = now();

-- Phase 2: Update problem_core question to ask for workarounds
UPDATE questionnaire_questions
SET question = 'Describe the core problem your target customers face. What keeps them up at night?
• What evidence shows this problem is real and urgent?
• How do customers currently cope with this problem? (e.g., spreadsheets, manual processes, expensive consultants)
• Why are current workarounds inadequate?',
    placeholder = 'Example: Mid-market CFOs waste 15+ hours/month reconciling data across 5+ systems. Current workarounds include hiring temps ($8K/month) or using error-prone spreadsheets (avg 3 material errors/quarter). Neither scales.',
    updated_at = now()
WHERE question_key = 'problem_core';

-- Phase 3: Update target_customer question to hint at market size
UPDATE questionnaire_questions
SET question = 'Describe your target customer in detail:
• Who are they? (industry, company size, job title)
• What do they do and why do they need your solution?
• How many of these potential customers exist? (estimated number of companies or buyers)
• What triggers them to actively search for a solution like yours?',
    placeholder = 'Example: Series A-C B2B SaaS companies (50-500 employees) with 3+ salespeople. ~15,000 companies in NA + EU fit this profile. They typically search when they miss quota 2+ quarters or when new sales VP joins and wants better tooling.',
    updated_at = now()
WHERE question_key = 'target_customer';

-- Phase 4: Update answer_quality_criteria for problem_core
UPDATE answer_quality_criteria
SET required_elements = '["specific_pain_point", "evidence_of_urgency", "current_workarounds", "workaround_costs", "target_customer_segment"]'::jsonb,
    nice_to_have = '["quantified_time_waste", "quotes_from_customers", "failed_solutions_tried"]'::jsonb,
    vc_context = 'VCs assess problem severity by whether customers are actively trying to solve it (vs. tolerating it). Strong signals: paying for workarounds, dedicated headcount, visible frustration in sales calls. Weak signals: customers "would like" a solution but aren''t actively searching.',
    example_good_answer = 'Mid-market CFOs (500-2000 employees) waste 15+ hours/month reconciling data across 5+ disconnected systems. Current workarounds: 40% hire temp staff ($8K/month), 35% use error-prone spreadsheets (avg 3 material errors/quarter leading to $50K+ audit costs), 25% delay reporting (risking compliance issues). We''ve validated this with 47 CFO interviews - 89% said this is their #1 operational pain point.',
    updated_at = now()
WHERE question_key = 'problem_core';

-- Phase 4: Update answer_quality_criteria for target_customer
UPDATE answer_quality_criteria
SET required_elements = '["specific_buyer_persona", "company_characteristics", "why_they_need_solution", "purchase_triggers", "market_size_estimate"]'::jsonb,
    nice_to_have = '["decision_maker_vs_user", "budget_authority", "buying_process_timeline", "existing_vendor_relationships"]'::jsonb,
    vc_context = 'VCs want to see you deeply understand WHO buys (not just who uses). Strong ICP definitions include: clear company size/stage, specific job title with budget authority, identifiable trigger events (new hire, missed target, funding round). Weak: broad descriptions like "SMBs" or "marketers".',
    example_good_answer = 'Primary buyer: VP Sales at Series A-C B2B SaaS companies (50-500 employees, $5-50M ARR) with 3+ AEs. ~15,000 companies in NA + EU fit this profile. Purchase triggers: (1) miss quota 2+ consecutive quarters, (2) new sales leader joins and audits stack, (3) board pressure on CAC efficiency. They typically have $50-150K annual budget for sales tools. Decision cycle: 4-6 weeks, requires sign-off from VP Sales + CFO.',
    updated_at = now()
WHERE question_key = 'target_customer';

-- Add unique constraint to memo_prompts section_name if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'memo_prompts_section_name_key'
    ) THEN
        ALTER TABLE memo_prompts ADD CONSTRAINT memo_prompts_section_name_key UNIQUE (section_name);
    END IF;
END $$;