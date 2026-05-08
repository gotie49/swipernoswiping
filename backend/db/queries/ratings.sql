-- name: CreateRating :one
INSERT INTO ratings (
  rating_id,
  user_id,
  location_id,
  score
)
VALUES (
  $1,
  $2,
  $3,
  $4
)
RETURNING *;

-- name: GetRatingsByLocation :many
SELECT *
FROM ratings
WHERE location_id = $1
ORDER BY created_at DESC;

-- name: UpdateLocationAverageRating :exec
UPDATE locations
SET average_rating = (
  SELECT AVG(ratings.score)::float
  FROM ratings
  WHERE ratings.location_id = locations.location_id
)
WHERE locations.location_id = $1;