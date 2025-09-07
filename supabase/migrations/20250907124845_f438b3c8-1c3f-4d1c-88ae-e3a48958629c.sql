-- Insert test assessment data for testing the assessor panel
INSERT INTO assessment_sessions (
  id,
  user_id, 
  session_type,
  status,
  overall_score,
  fluency_score,
  pronunciation_score,
  grammar_score,
  vocabulary_score,
  coherence_score,
  overall_cefr_level,
  student_info,
  metadata,
  created_at
) VALUES 
(
  gen_random_uuid(),
  'a9f401a1-50e5-42e1-a0c7-ff17b6cfbe23',
  'full_assessment',
  'completed',
  78,
  75,
  82,
  73,
  80,
  77,
  'B2',
  '{"name": "John Doe", "email": "john.doe@example.com"}',
  '{"anonymous": false}',
  NOW() - INTERVAL '2 hours'
),
(
  gen_random_uuid(),
  'a9f401a1-50e5-42e1-a0c7-ff17b6cfbe23',
  'quick_assessment', 
  'completed',
  65,
  60,
  68,
  62,
  70,
  67,
  'B1',
  '{"name": "Jane Smith", "email": "jane.smith@example.com"}',
  '{"anonymous": false}',
  NOW() - INTERVAL '1 hour'
);