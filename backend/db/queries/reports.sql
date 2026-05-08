-- name: ReportLocation :one
INSERT INTO reports (
  report_id,
  user_id,
  location_id,
  reason,
  status
)
VALUES (
  $1,
  $2,
  $3,
  $4,
  'pending'
)
RETURNING *;

-- name: ReportComment :one
INSERT INTO reports (
  report_id,
  user_id,
  comment_id,
  reason,
  status
)
VALUES (
  $1,
  $2,
  $3,
  $4,
  'pending'
)
RETURNING *;

-- name: GetReports :many
SELECT *
FROM reports
ORDER BY created_at DESC;