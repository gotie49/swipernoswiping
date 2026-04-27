-- name: GetNearbyLocations :many
SELECT location_id, name, description, geom
FROM locations
WHERE ST_DWithin(
  geom::geography,
  ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
  $3
)
ORDER BY created_at DESC;

-- name: CreateLocation :one
INSERT INTO locations (
  location_id,
  name,
  description,
  geom,
  address,
  location_type,
  opening_hours,
  status,
  creator_user_id
)
VALUES (
  sqlc.arg(location_id),
  sqlc.arg(name),
  sqlc.arg(description),

  ST_SetSRID(
    ST_MakePoint(sqlc.arg(lng), sqlc.arg(lat)),
    4326
  ),

  sqlc.arg(address),
  sqlc.arg(location_type),
  sqlc.arg(opening_hours),
  sqlc.arg(status),
  sqlc.arg(creator_user_id)
)
RETURNING *;

-- name: GetLocationByID :one
SELECT *
FROM locations
WHERE location_id = $1;

-- name: SearchLocations :many
SELECT *
FROM locations
WHERE name ILIKE '%' || $1 || '%'
  AND status = 'active'
ORDER BY created_at DESC;

-- name: UpdateLocation :one
UPDATE locations
SET
  name = $2,
  description = $3,
  address = $4,
  location_type = $5,
  status = $6,
  updated_at = NOW()
WHERE location_id = $1
RETURNING *;

-- name: GetLocationsInBounds :many
SELECT
  location_id,
  name,
  ST_X(geom) AS lng,
  ST_Y(geom) AS lat
FROM locations
WHERE geom && ST_MakeEnvelope($1, $2, $3, $4, 4326)
  AND status = 'active';

-- name: ListLocations :many
SELECT *
FROM locations
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;