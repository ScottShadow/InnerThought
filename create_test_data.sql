-- First clean existing data
DELETE FROM themes;
DELETE FROM emotions;
DELETE FROM entries;
DELETE FROM users;

-- Insert a test user
INSERT INTO users (username, password) VALUES ('demo', 'password');

-- Insert some journal entries with varying dates
INSERT INTO entries (user_id, title, content, created_at, is_starred, clarity_rating) VALUES 
(1, 'Excited about my new project', 'Today I started working on a new app idea. I am excited about the possibilities and can''t wait to see it come to life. This could be a game-changer if I can execute it well.', '2025-05-12 10:00:00', true, 4),
(1, 'Feeling stuck', 'Hit a roadblock with my coding today. Nothing seems to be working as expected. Feeling frustrated but I know I need to persevere.', '2025-05-13 15:30:00', false, 2),
(1, 'Great team meeting', 'Had an amazing brainstorming session with the team. We came up with some brilliant ideas for the project. Everyone was engaged and motivated.', '2025-05-15 09:15:00', true, 5),
(1, 'Learning new skills', 'Started learning about AI and machine learning today. It''s challenging but fascinating. I see so many potential applications for what I''m building.', '2025-05-17 14:45:00', false, 3),
(1, 'Weekend reflection', 'Taking some time to step back and reflect on my goals. I need to focus more on work-life balance while still pushing forward with my projects.', '2025-05-18 20:00:00', false, 4);

-- Insert emotions for each entry
-- Entry 1 emotions
INSERT INTO emotions (entry_id, emotion, score) VALUES 
(1, 'Excited', 85),
(1, 'Optimistic', 75),
(1, 'Motivated', 90);

-- Entry 2 emotions
INSERT INTO emotions (entry_id, emotion, score) VALUES 
(2, 'Frustrated', 70),
(2, 'Determined', 65),
(2, 'Anxious', 45);

-- Entry 3 emotions
INSERT INTO emotions (entry_id, emotion, score) VALUES 
(3, 'Happy', 80),
(3, 'Inspired', 85),
(3, 'Energetic', 75);

-- Entry 4 emotions
INSERT INTO emotions (entry_id, emotion, score) VALUES 
(4, 'Curious', 88),
(4, 'Challenged', 60),
(4, 'Focused', 70);

-- Entry 5 emotions
INSERT INTO emotions (entry_id, emotion, score) VALUES 
(5, 'Reflective', 75),
(5, 'Calm', 65),
(5, 'Satisfied', 60);

-- Insert themes for each entry
-- Entry 1 themes
INSERT INTO themes (entry_id, theme) VALUES 
(1, 'Projects'),
(1, 'Creativity'),
(1, 'Innovation');

-- Entry 2 themes
INSERT INTO themes (entry_id, theme) VALUES 
(2, 'Challenges'),
(2, 'Coding'),
(2, 'Problem Solving');

-- Entry 3 themes
INSERT INTO themes (entry_id, theme) VALUES 
(3, 'Teamwork'),
(3, 'Collaboration'),
(3, 'Productivity');

-- Entry 4 themes
INSERT INTO themes (entry_id, theme) VALUES 
(4, 'Learning'),
(4, 'Technology'),
(4, 'Personal Growth');

-- Entry 5 themes
INSERT INTO themes (entry_id, theme) VALUES 
(5, 'Work-Life Balance'),
(5, 'Goals'),
(5, 'Self-Reflection');
