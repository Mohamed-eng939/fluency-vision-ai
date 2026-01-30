-- Seed the prompts table with actual speaking prompts from the application
-- These match the prompts defined in src/data/speaking/promptData.ts

INSERT INTO prompts (title, content, type, cefr_level, expected_duration, instructions, is_active) VALUES
-- A1 Level
('Q1_A1 - Personal Info', 'Introduce yourself. (Name and spelling– Age – Country – Residence– Job – Study – Marital status)', 'speaking', 'A1', 60, 'Share your basic personal information including name, age, where you live, and what you do.', true),
('Q2_A1 - Phone Number', 'What''s your phone number?', 'speaking', 'A1', 30, 'Say your phone number clearly and you can also mention when people can call you.', true),
('Q3_A1 - Family', 'Introduce your family? (Parents / Siblings / Children)', 'speaking', 'A1', 60, 'Tell about your family members - parents, brothers, sisters, or children if you have any.', true),
('Q4_A1 - Daily Routine', 'What''s your daily routine?', 'speaking', 'A1', 60, 'Describe what you do every day from morning to evening.', true),
('Q5_A2 - Past Activities', 'What did you do yesterday or on your last day off?', 'speaking', 'A2', 60, 'Talk about activities you did recently, where you went, and who you were with.', true),
('Q6_A2 - Future Plans', 'What are you going to do this week?', 'speaking', 'A2', 60, 'Share your plans and activities for the coming week.', true),
('Q7_B1 - Life in 10 Years', 'How will your life be different in the next 10 years?', 'speaking', 'B1', 90, 'Talk about your expectations and goals for the future.', true),
('Q8_B1 - Childhood Memories', 'Describe your life when you were a child.', 'speaking', 'B1', 90, 'Share memories from your childhood, activities you enjoyed, and how things were different.', true),
('Q9_B1 - Special Memory', 'Tell me about a special childhood memory.', 'speaking', 'B1', 90, 'Share a memorable experience from when you were young and explain why it was special.', true),
('Q10_B1 - Travel Experience', 'Talk about a place you have traveled to. Why did you go there and what did you do?', 'speaking', 'B1', 90, 'Describe a trip you took, including the destination, reasons for going, and activities.', true),
('Q11_B1 - Cultural Site', 'Describe a place of cultural or historical importance that you have visited.', 'speaking', 'B1', 90, 'Talk about a museum, monument, or historical site you visited and what you learned.', true),
('Q12_B1 - Favorite Restaurant', 'Tell me about your favorite restaurant or cafe.', 'speaking', 'B1', 60, 'Describe a restaurant or cafe you like, including the food, atmosphere, and why you enjoy it.', true),
('Q13_B1 - Dream Home', 'Describe your dream home. Where would it be and what would it look like?', 'speaking', 'B1', 90, 'Imagine your ideal home and describe its location, design, and features.', true),
('Q14_B1 - Technology Changes', 'How has technology changed our lives?', 'speaking', 'B1', 90, 'Discuss the impact of technology on daily life, work, and communication.', true),
('Q15_B1 - Social Media', 'What do you think about social media?', 'speaking', 'B1', 90, 'Share your views on social media platforms and their effects on society.', true),
('Q16_B2 - Inspiring Person', 'Describe a person who has inspired you. Why do you admire them?', 'speaking', 'B2', 90, 'Talk about someone who has influenced your life and explain their impact on you.', true),
('Q17_B2 - Environmental Concerns', 'What are the biggest environmental problems in your country?', 'speaking', 'B2', 90, 'Discuss environmental issues and potential solutions in your region.', true),
('Q18_B2 - Education System', 'How could education be improved in your country?', 'speaking', 'B2', 90, 'Share your ideas for improving educational systems and outcomes.', true),
('Q19_B2 - Work-Life Balance', 'What is your opinion on work-life balance?', 'speaking', 'B2', 90, 'Discuss the importance of balancing professional and personal life.', true),
('Q20_B2 - Globalization', 'What are the advantages and disadvantages of globalization?', 'speaking', 'B2', 120, 'Analyze both positive and negative aspects of globalization on culture and economy.', true),
('Q21_B2 - Traditional vs Modern', 'Should traditional customs be preserved or adapted to modern times?', 'speaking', 'B2', 120, 'Discuss the balance between maintaining traditions and embracing change.', true),
('Q22_C1 - Immigration Policies', 'What role should governments play in managing immigration?', 'speaking', 'C1', 120, 'Analyze immigration policies and their effects on societies.', true),
('Q23_C1 - AI and Future', 'How do you think artificial intelligence will shape our future?', 'speaking', 'C1', 120, 'Discuss the potential impacts of AI on work, society, and daily life.', true);

-- Read-aloud prompts
INSERT INTO prompts (title, content, type, cefr_level, expected_duration, instructions, is_active) VALUES
('RA1_A1 - Simple Sentence', 'I like to eat apples and oranges every day.', 'read_aloud', 'A1', 15, 'Read the sentence clearly and naturally.', true),
('RA2_A1 - Basic Description', 'The cat is sleeping on the warm bed.', 'read_aloud', 'A1', 15, 'Read the sentence clearly and naturally.', true),
('RA3_A2 - Weather', 'Yesterday it was very sunny and hot, but today it is raining.', 'read_aloud', 'A2', 20, 'Read the sentence clearly and naturally.', true),
('RA4_A2 - Shopping', 'I went to the supermarket and bought some bread, milk, and cheese.', 'read_aloud', 'A2', 20, 'Read the sentence clearly and naturally.', true),
('RA5_B1 - Technology', 'Technology has changed the way we communicate with friends and family around the world.', 'read_aloud', 'B1', 25, 'Read the sentence clearly with good intonation.', true),
('RA6_B1 - Travel', 'Last summer, I traveled to Spain and visited beautiful historical buildings in Barcelona.', 'read_aloud', 'B1', 25, 'Read the sentence clearly with good intonation.', true),
('RA7_B1 - Environment', 'Many scientists believe that climate change is one of the greatest challenges facing our planet today.', 'read_aloud', 'B1', 30, 'Read the sentence clearly with good intonation.', true),
('RA8_B2 - Education', 'Education plays a crucial role in shaping individuals abilities to think critically and solve complex problems.', 'read_aloud', 'B2', 30, 'Read with natural rhythm and appropriate emphasis.', true),
('RA9_B2 - Society', 'The increasing use of social media has fundamentally altered how people interact and form relationships in modern society.', 'read_aloud', 'B2', 35, 'Read with natural rhythm and appropriate emphasis.', true),
('RA10_B2 - Healthcare', 'Access to affordable healthcare remains a significant challenge in many developing countries around the world.', 'read_aloud', 'B2', 35, 'Read with natural rhythm and appropriate emphasis.', true),
('RA11_C1 - Economics', 'The intricate relationship between globalization and local economies continues to be a subject of considerable academic debate.', 'read_aloud', 'C1', 40, 'Read with sophisticated intonation and clear articulation.', true),
('RA12_C1 - Philosophy', 'Contemporary philosophers argue that the pursuit of happiness must be balanced with ethical considerations and social responsibility.', 'read_aloud', 'C1', 40, 'Read with sophisticated intonation and clear articulation.', true),
('RA13_C1 - Science', 'Recent breakthroughs in quantum computing have the potential to revolutionize fields ranging from cryptography to pharmaceutical research.', 'read_aloud', 'C1', 45, 'Read with sophisticated intonation and clear articulation.', true),
('RA14_C1 - Culture', 'The preservation of indigenous languages and cultural practices is increasingly recognized as essential for maintaining global diversity and heritage.', 'read_aloud', 'C1', 45, 'Read with sophisticated intonation and clear articulation.', true),
('RA15_C1 - Politics', 'The delicate balance between national sovereignty and international cooperation presents ongoing challenges for policymakers worldwide.', 'read_aloud', 'C1', 45, 'Read with sophisticated intonation and clear articulation.', true);