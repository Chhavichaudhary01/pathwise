-- V7: Add avatar_url column to learner_profiles table
ALTER TABLE learner_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
