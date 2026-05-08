-- name: GetModerationQueue :many
SELECT *
FROM moderation_queue
WHERE status = 'pending'
ORDER BY added_at ASC;

-- name: ReviewModeration :exec
UPDATE moderation_queue
SET
  status = $2,
  moderator_id = $3
WHERE queue_id = $1;