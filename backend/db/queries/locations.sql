-- name: GetNearbyLocations :many
SELECT location_id, name, description, geom
FROM locations
WHERE ST_DWithin(
  geom,
  ST_Transform(
    ST_SetSRID(ST_MakePoint($1, $2), 4326),
    25832
  ),
  $3
)
ORDER BY created_at DESC;