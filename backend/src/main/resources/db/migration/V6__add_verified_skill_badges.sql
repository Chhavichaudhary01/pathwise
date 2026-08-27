CREATE TABLE IF NOT EXISTS verified_skill_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_name VARCHAR(255) NOT NULL,
    topic_title VARCHAR(255),
    score INTEGER NOT NULL,
    verification_hash VARCHAR(255) NOT NULL,
    challenge_type VARCHAR(50) DEFAULT 'CODE_CHALLENGE',
    badge_tier VARCHAR(50) DEFAULT 'DIAMOND',
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_verified_badges_user_id ON verified_skill_badges(user_id);
