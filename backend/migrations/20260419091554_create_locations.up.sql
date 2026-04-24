
CREATE TABLE locations (
    location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    geom GEOMETRY(Point, 4326) NOT NULL,
    address TEXT,
    location_type TEXT,
    opening_hours JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    status TEXT DEFAULT 'active',
    creator_user_id UUID NOT NULL,
    average_rating FLOAT DEFAULT 0,

    FOREIGN KEY (creator_user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_locations_geom
ON locations USING GIST (geom);