-- name: GetUser :one
SELECT *
FROM users
WHERE user_id = $1;

-- name: CreateUser :one
INSERT INTO users (
  user_id,
  username,
  email,
  password_hash,
  created_at,
  is_moderator,
  is_deleted
)
VALUES (
  $1, $2, $3, $4, NOW(), false, false
)
RETURNING *;