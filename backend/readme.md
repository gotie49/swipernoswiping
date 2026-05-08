# 🚀 Backend Setup (Go + Postgres + PostGIS + sqlc)

This project uses:

- Go (API)
- PostgreSQL + PostGIS (database)
- golang-migrate (migrations)
- sqlc (type-safe DB access)
- Docker (local dev environment)

---

# 📦 Requirements

- Docker + Docker Compose
- Go (>= 1.21 recommended)
- sqlc

Install sqlc:

```bash
go install github.com/sqlc-dev/sqlc/cmd/sqlc@v1.26.0
```

---

# 🐳 Start Database

```bash
docker compose up -d db
```

Stop:

```bash
docker compose down
```

Reset DB (⚠️ deletes all data):

```bash
docker compose down -v
```

---

# 🗄️ Run Migrations

Run all migrations:

```bash
docker compose run --rm migrate -path=/migrations -database "postgres://postgres:postgres@db:5432/app?sslmode=disable" up
```

Rollback:

```bash
docker compose run --rm migrate -path=/migrations -database "postgres://postgres:postgres@db:5432/app?sslmode=disable" down
```

Force fix (dirty DB):

```bash
docker compose run --rm migrate -path=/migrations -database "postgres://postgres:postgres@db:5432/app?sslmode=disable" force VERSION
```

---

# 🧬 Generate DB Code (sqlc)

Generate Go code from SQL queries:

```bash
sqlc generate
```

Generated files:

```
internal/db/
```

---

# ▶️ Run API

```bash
docker compose up --build api
```

API runs on:

```
http://localhost:8080
```

---

# 🧪 Run Tests

Run all tests:

```bash
go test ./...
```

Run with verbose output:

```bash
go test -v ./...
```

---

# 📁 Project Structure

```
backend/
  cmd/api/           # main application
  internal/db/       # sqlc generated code (DO NOT EDIT)
  db/queries/        # SQL queries (used by sqlc)
  migrations/        # DB schema (golang-migrate)
  docker-compose.yml
  sqlc.yaml
```

---

# ⚙️ Environment Variables

Example:

```
DATABASE_URL=postgres://postgres:postgres@db:5432/app?sslmode=disable
```

---

# 🧠 Workflow

1. Change DB schema → edit `migrations/`
2. Run migrations
3. Write queries → `db/queries/*.sql`
4. Run:

```bash
sqlc generate
```

5. Use generated code in Go

---

# ⚠️ Git Rules

DO NOT commit:

```
.env
```

---

# 🔧 Useful Debug Commands

Check migrations folder inside container:

```bash
docker compose run --rm migrate ls /migrations
```

Connect to DB:

```bash
docker exec -it app-postgis psql -U postgres -d app
```

List tables:

```sql
\dt

# 📡 API Documentation

---

# 🔐 Authentication Endpoints

## Register

### POST /user/register

Create a new user account.

### Request

```http
POST /user/register
Content-Type: application/json
```

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

### Responses

**Success (201)**

```json
{
  "user_id": "...",
  "username": "testuser",
  "email": "test@example.com"
}
```

**Errors**

| Status | Message | Description |
|------|--------|-------------|
| 400 | "invalid json body" | Malformed JSON |
| 500 | "failed to create user" | DB error |

---

## Login

### POST /user/login

Authenticate user and return JWT.

### Request

```http
POST /user/login
Content-Type: application/json
```

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### Responses

**Success (200)**

```json
{
  "token": "jwt_token"
}
```

**Errors**

| Status | Message | Description |
|------|--------|-------------|
| 400 | "invalid json body" | Malformed request |
| 401 | "invalid credentials" | Wrong login |

---

## Current User

### GET /user/me (AUTH REQUIRED)

Returns authenticated user.

### Response (200)

```json
{
  "user_id": "...",
  "email": "test@example.com"
}
```

---

## Delete User

### DELETE /user (AUTH REQUIRED)

Delete current user account.

### Response

**Success (200)**

```json
"deleted"
```

---

# 📍 Location Endpoints

## Get All Locations

### GET /locations

Retrieve list of locations.

### Response (200)

```json
[
  {
    "location_id": "...",
    "name": "..."
  }
]
```

---

## Get Location by ID

### GET /locations/{id}

### Response (200)

```json
{
  "location_id": "...",
  "name": "..."
}
```

---

## Search Locations

### GET /locations/search?q=term

### Response (200)

```json
[]
```

---

## Nearby Locations

### GET /locations/nearby

### Query Params

- lat
- lng
- distance

### Response (200)

```json
[]
```

---

## Create Location (AUTH REQUIRED)

### POST /locations

### Request

```json
{
  "name": "string",
  "description": "string",
  "lat": 0,
  "lng": 0,
  "address": "string",
  "location_type": "string",
  "opening_hours": {},
  "status": "string"
}
```

### Response (201)

```json
{
  "location_id": "..."
}
```

---

## Update Location (AUTH REQUIRED)

### PUT /locations/{id}

### Request

```json
{
  "name": "string",
  "description": "string",
  "address": "string",
  "location_type": "string",
  "status": "string"
}
```

---

## Delete Location (AUTH REQUIRED)

### DELETE /locations/{id}

---

# 💬 Comment Endpoints

## Get Comments

### GET /locations/{id}/comments

---

## Create Comment (AUTH REQUIRED)

### POST /locations/{id}/comments

```json
{
  "text": "hello"
}
```

---

## Delete Comment (AUTH REQUIRED)

### DELETE /comments/{id}

---

# ⭐ Rating Endpoints

## Get Ratings

### GET /locations/{id}/ratings

---

## Create Rating (AUTH REQUIRED)

### POST /locations/{id}/ratings

```json
{
  "score": 5
}
```

---

# 🚩 Report Endpoints

## Report Location (AUTH REQUIRED)

### POST /locations/{id}/report

```json
{
  "reason": "spam"
}
```

---

## Report Comment (AUTH REQUIRED)

### POST /comments/{id}/report

```json
{
  "reason": "abuse"
}
```

---

# 🏷️ Tags

## Get Tags

### GET /tags

---

# 🛡️ Moderation (MOD ONLY)

## Get Queue

### GET /moderation/queue

---

## Review Item

### POST /moderation/{id}/review

```json
{
  "status": "approved"
}
```

---

## Get Reports

### GET /moderation/reports

---

## Hide Comment

### POST /moderation/comments/{id}/hide

---

## Hide Location

### POST /moderation/locations/{id}/hide

---

# 🔐 Security Notes

- JWT HS256
- 5 minute expiration
- HTTP-only cookie support
- bcrypt password hashing
