-- name: CreateComment :one
INSERT INTO comments (
  comment_id,
  user_id,
  location_id,
  text,
  status
)
VALUES (
  $1,
  $2,
  $3,
  $4,
  'active'
)
RETURNING *;

-- name: GetCommentsByLocation :many
SELECT *
FROM comments
WHERE location_id = $1
  AND status = 'active'
ORDER BY created_at DESC;

-- name: DeleteComment :exec
UPDATE comments
SET
  status = 'deleted',
  updated_at = NOW()
WHERE comment_id = $1;


-- name: HideComment :exec
UPDATE comments
SET
  status = 'hidden',
  updated_at = NOW()
WHERE comment_id = $1;