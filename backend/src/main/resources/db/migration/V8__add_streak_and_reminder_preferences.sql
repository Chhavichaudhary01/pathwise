-- Migration V8: Add Streak Tracking & Daily Reminder Preferences
ALTER TABLE learner_profiles
ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_active_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS daily_reminder_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS daily_reminder_time VARCHAR(10) DEFAULT '09:00',
ADD COLUMN IF NOT EXISTS notification_email VARCHAR(255);
