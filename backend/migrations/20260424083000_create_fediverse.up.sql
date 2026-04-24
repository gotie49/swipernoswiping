CREATE TABLE fediverse_content (
    content_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL,
    external_id TEXT,
    content_type TEXT,
    text TEXT,
    published_at TIMESTAMP,
    source_url TEXT,

    FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE CASCADE
);