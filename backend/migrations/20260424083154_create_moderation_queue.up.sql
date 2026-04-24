CREATE TABLE moderation_queue (
    queue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID,
    comment_id UUID,
    content_type TEXT,
    reason TEXT,
    added_at TIMESTAMP DEFAULT NOW(),
    status TEXT DEFAULT 'pending',
    moderator_id UUID,

    FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE,
    FOREIGN KEY (moderator_id) REFERENCES moderators(moderator_id)
);