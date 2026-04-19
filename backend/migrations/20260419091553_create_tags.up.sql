CREATE TABLE tags (
    tag_id UUID PRIMARY KEY,
    tag_name TEXT NOT NULL,
    category TEXT NOT NULL
);


CREATE UNIQUE INDEX idx_tags_name_category
ON tags(tag_name, category);