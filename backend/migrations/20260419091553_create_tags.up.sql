CREATE TABLE tags (
    tag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_name TEXT NOT NULL,
    category TEXT NOT NULL,
    UNIQUE(tag_name, category)
);