CREATE TABLE location_tags (
    location_id UUID NOT NULL,
    tag_id UUID NOT NULL,

    PRIMARY KEY (location_id, tag_id),

    FOREIGN KEY (location_id)
        REFERENCES locations(location_id)
        ON DELETE CASCADE,

    FOREIGN KEY (tag_id)
        REFERENCES tags(tag_id)
        ON DELETE CASCADE
);