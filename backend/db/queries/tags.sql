-- name: GetTags :many
SELECT *
FROM tags
ORDER BY category, tag_name;