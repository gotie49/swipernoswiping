
CREATE TABLE locations (
    location_id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    geom GEOMETRY(Point, 25832) NOT NULL,
    address TEXT,
    location_type TEXT,
    opening_hours JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL,
    creator_user_id UUID NOT NULL,

    FOREIGN KEY (creator_user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_locations_geom
ON locations
USING GIST (geom);