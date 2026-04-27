# 📡 API Übersicht

Diese Dokumentation beschreibt die verfügbaren Endpunkte der Anwendung.

---

# 🧭 Auth / User

## 🟢 Benutzer erstellen

**POST** `/user/register`

Erstellt einen neuen User.

### Request Body

```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

### Validierung

* username erforderlich
* email erforderlich
* password erforderlich

### Response

* `201 Created`
* User-Objekt aus der Datenbank

---

## 🔐 Login

**POST** `/user/login`

Authentifiziert einen User und gibt ein JWT zurück.

### Request Body

```json
{
  "email": "string",
  "password": "string"
}
```

### Response

```json
{
  "token": "jwt_token"
}
```

### Zusätzlich

* Setzt HTTP-only Cookie: `token`
* JWT enthält:

  * user_id
  * email
  * expiration (5 Minuten)

---

# 📍 Locations

## 📥 Alle Locations abrufen

**GET** `/locations`

Gibt eine Liste aller Locations zurück.

### Verhalten

* Limit: 50
* Offset: 0 (aktuell fix im Code)

### Response

```json
[
  {
    "location_id": "...",
    "name": "..."
  }
]
```

---

## 📍 Location nach ID abrufen

**GET** `/locations/{id}`

⚠️ Noch nicht implementiert

---

## ➕ Location erstellen (AUTH REQUIRED)

**POST** `/locations`

Erstellt eine neue Location.

### Request Body

```json
{
  "name": "string",
  "description": "string",
  "lat": 48.123,
  "lng": 11.123,
  "address": "string",
  "location_type": "string",
  "opening_hours": {},
  "status": "string",
  "creator_user_id": "string"
}
```

### Validierung

* name erforderlich
* lat: -90 bis 90
* lng: -180 bis 180
* User muss authentifiziert sein

### Automatisch vom Server gesetzt

* location_id (UUID)
* creator_user_id aus JWT Context
* status = "active" falls leer

### Response

* `201 Created`
* Location Objekt

---

# 🔐 Auth System

## JWT Eigenschaften

* Algorithmus: HS256
* Secret: `JWT_SECRET`
* Ablaufzeit: 5 Minuten
* Speicherung:

  * HTTP-only Cookie `token`
  * zusätzlich JSON Response

---

# ⚠️ Hinweise

## Strukturproblem

* Login ist unnötig über `UserAuth` gewrappt
* `/user/login` sollte direkt `Login` nutzen

## Fehlende Implementierung

* `GET /locations/{id}` ist leer

## Pagination

* aktuell fix (Limit 50, Offset 0)
* keine echte Pagination vorhanden

---

# 📌 Übersicht (Kurzform)

```
AUTH
POST   /user/register
POST   /user/login

LOCATIONS
GET    /locations
GET    /locations/{id} (TODO)
POST   /locations (AUTH)
```
