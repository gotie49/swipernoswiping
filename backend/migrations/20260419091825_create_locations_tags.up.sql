CREATE TABLE location_tags (
    location_id UUID REFERENCES locations(location_id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (location_id, tag_id)
);