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