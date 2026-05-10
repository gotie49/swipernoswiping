## Allgemeines
    - USP formulieren und Gimmick Feature umsetzen
    - Code Reviews nach ISO Norm durchführen und dokumentieren
    - Design Pattern ausdenken welches angewandt wird
    - Präsentation erstellen
    - Going Viral, Ausblick, Roter Pfaden, etc. 

## CI/CD TODO

### Must Have 
- Echte Unit Tests im Backend — mindestens Handler-Tests für Login, Register, GetNearby
- Echte Unit Tests im Frontend — mindestens Tests für nullString, getColorForType, geocodeAddress

### Should Have
- Integrationstests Backend — HTTP-Request gegen echte Test-DB, z.B. POST /user/register → POST /user/login → POST /locations
- Coverage-Threshold einkommentieren sobald Tests da sin

### Could Have
- Automatisches Deployment (CD) — fehlt komplett.

## Backend TODO

### 1. Username in Claims

`type Claims` um `Username` erweitern:

```go
type Claims struct {
    UserID      string `json:"user_id"`
    Username    string `json:"username"` // neu
    Email       string `json:"email"`
    IsModerator bool   `json:"is_moderator"`
    jwt.RegisteredClaims
}
```

`GetUserIDByEmail` SQL Query muss `username` zurückgeben:

```sql
-- name: GetUserIDByEmail :one
SELECT user_id, username, email, is_moderator, password_hash
FROM users
WHERE email = $1;
```

`Login` Handler muss `Username` in Claims schreiben:

```go
claims := &Claims{
    UserID:      expectedUser.UserID.String(),
    Username:    expectedUser.Username, // neu
    Email:       creds.Email,
    IsModerator: expectedUser.IsModerator.Bool,
    ...
}
```
---

### 2. `location_type` in `/locations/nearby`

SQL Query erweitern:

```sql
-- name: GetNearbyLocations :many
SELECT
  location_id,
  name,
  description,
  location_type,
  address,
  status,
  ST_X(geom) AS lng,
  ST_Y(geom) AS lat
FROM locations
WHERE ST_DWithin(
  geom::geography,
  ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
  $3
)
AND status = 'active'
ORDER BY created_at DESC;
```
---

### 3. Ratings Endpoints

Neue Endpoints:

```
POST /locations/{id}/ratings   → CreateRating (protected)
GET  /locations/{id}/ratings   → GetRatingsByLocation (public)
```

Request Body für `POST`:
```json
{ "score": 4 }
```

Response für `GET`:
```json
[
  { "rating_id": "...", "user_id": "...", "score": 4, "created_at": "..." }
]
```
---

### 4. `/locations/{id}/comments` mit Username

`GetCommentsByLocation` Query muss `username` aus `users` Tabelle joinen:

```sql
-- name: GetCommentsByLocation :many
SELECT
  c.comment_id,
  c.user_id,
  u.username,
  c.location_id,
  c.text,
  c.created_at,
  c.updated_at,
  c.status
FROM comments c
JOIN users u ON c.user_id = u.user_id
WHERE c.location_id = $1
ORDER BY c.created_at DESC;
```
---

### 5. `/locations` nach Status filtern

`GET /locations?status=pending` unterstützen damit die Moderationsansicht neue eingereichte Locations anzeigen kann.

Option A — Query-Parameter in `GetAllLocations`:

```sql
-- name: GetAllLocations :many
SELECT * FROM locations
WHERE status = $1
ORDER BY created_at DESC;
```

Option B — separater Endpoint `GET /locations/pending` nur für Moderatoren (protected + ModeratorMiddleware).

## Frontend TODO (nach Backend-Updates)
### 1. Ratings anbinden

**`hooks/useLocationDetail.ts`** — Ratings parallel laden:

```ts
const [locationRes, commentsRes, ratingsRes] = await Promise.all([
  fetch(`/api/locations/${locationId}`),
  fetch(`/api/locations/${locationId}/comments`),
  fetch(`/api/locations/${locationId}/ratings`),  // neu
])
```

Hook gibt `ratings` zusätzlich zurück:

```ts
interface UseLocationDetailResult {
  detail: LocationDetail | null
  comments: Comment[]
  ratings: Rating[]       // neu
  isLoading: boolean
  error: string | null
  reload: () => void
}
```

**`types/rating.ts`** — neuen Type anlegen:

```ts
export interface Rating {
  rating_id: string
  user_id: string
  score: number
  created_at: string
}
```

**`components/map/location-detail/RatingSection/RatingSection.tsx`** — echte Daten statt Dummy:

- `ratings` als Prop empfangen
- Balken-Verteilung aus echten Daten berechnen
- `averageRating` aus echten Ratings berechnen oder aus `detail.average_rating`
- `POST /api/locations/{id}/ratings` beim Abgeben aufrufen (war bereits als TODO kommentiert)

**`components/map/location-detail/LocationDetail/LocationDetail.tsx`** — `ratings` an `RatingSection` weitergeben:

```tsx
<RatingSection
  locationId={location.location_id}
  ratings={ratings}           // neu
  averageRating={detail?.average_rating ?? null}
/>
```

---

### 2. Username in Kommentaren anzeigen

**`types/comment.ts`** — `username` hinzufügen:

```ts
export interface Comment {
  comment_id: string
  user_id: string
  username: string    // neu
  location_id: string
  text: string
  created_at: string
  updated_at: string
  status: string | null
}
```

**`components/map/location-detail/CommentSection/CommentSection.tsx`** — `username` statt gekürzter `user_id`:

```tsx
// vorher:
<span className={styles.commentUser}>{c.user_id.slice(0, 8)}...</span>

// nachher:
<span className={styles.commentUser}>{c.username}</span>
```

---

### 3. Moderation — pending Locations anzeigen

**`app/moderation/page.tsx`** — `GET /api/locations?status=pending` statt alle Locations filtern:

```ts
fetch('/api/locations?status=pending', { headers: authHeaders })
```

Mapping dann vereinfachen — kein clientseitiger `.filter()` mehr nötig:

```ts
const pendingItems: ModerationItem[] = (locationsData ?? []).map(...)
// filter((l) => nullString(l.status) === 'pending') ← entfernen
```