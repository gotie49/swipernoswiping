CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    is_moderator BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE
);