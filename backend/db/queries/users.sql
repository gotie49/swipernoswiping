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

-- name: GetUserIDByEmail :one
SELECT user_id, username, email, is_moderator, password_hash
FROM users
WHERE email = $1;

-- name: DeleteUser :exec
UPDATE users
SET is_deleted = true
WHERE user_id = $1;