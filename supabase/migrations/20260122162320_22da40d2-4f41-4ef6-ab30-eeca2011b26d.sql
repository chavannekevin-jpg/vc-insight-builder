-- Add a new "Additional Context" question as the final question in the questionnaire
-- This will be a "dump all" field where users can provide any additional information

INSERT INTO questionnaire_questions (
  section_id,
  question_key,
  title,
  tldr,
  question,
  placeholder,
  icon,
  sort_order,
  is_active,
  is_required
)
SELECT 
  id as section_id,
  'additional_context' as question_key,
  'Anything Else?' as title,
  'Share any additional context that could help investors understand your company better' as tldr,
  'Is there anything else you''d like to share? This could include market research, competitive intelligence, technical details, regulatory considerations, team background, customer testimonials, or any other information that would help investors understand your company better.' as question,
  'Share any additional context, data points, insights, or information that you think is important for understanding your company. The more context you provide, the more comprehensive your analysis will be...' as placeholder,
  'MessageSquarePlus' as icon,
  99 as sort_order,  -- High sort order to ensure it's last
  true as is_active,
  false as is_required
FROM questionnaire_sections
WHERE name = 'Vision';