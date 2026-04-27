package main

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/gotie49/swipernoswiping/internal/db"
	"github.com/sqlc-dev/pqtype"
	"golang.org/x/crypto/bcrypt"
)

type Handler struct {
	q *db.Queries
}

func NewHandler(q *db.Queries) *Handler {
	return &Handler{q: q}
}

func (h *Handler) GetAllLocations(w http.ResponseWriter, r *http.Request) {
	locations, err := h.q.ListLocations(r.Context(), db.ListLocationsParams{
		Limit:  50,
		Offset: 0,
	})

	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	json.NewEncoder(w).Encode(locations)
}

func (h *Handler) CreateLocation(w http.ResponseWriter, r *http.Request) {
	type request struct {
		Name          string          `json:"name"`
		Description   string          `json:"description"`
		Lat           float64         `json:"lat"`
		Lng           float64         `json:"lng"`
		Address       string          `json:"address"`
		LocationType  string          `json:"location_type"`
		OpeningHours  json.RawMessage `json:"opening_hours"`
		Status        string          `json:"status"`
		CreatorUserID string          `json:"creator_user_id"`
	}

	var req request

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	if req.Name == "" {
		http.Error(w, "name is required", http.StatusBadRequest)
		return
	}

	if req.Lat < -90 || req.Lat > 90 {
		http.Error(w, "invalid latitude", http.StatusBadRequest)
		return
	}

	if req.Lng < -180 || req.Lng > 180 {
		http.Error(w, "invalid longitude", http.StatusBadRequest)
		return
	}

	user := GetUserFromContext(r)
	if user == nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	userID, err := uuid.Parse(user.UserID)
	if err != nil {
		http.Error(w, "invalid user in token", http.StatusUnauthorized)
		return
	}

	status := req.Status
	if status == "" {
		status = "active"
	}

	location, err := h.q.CreateLocation(r.Context(), db.CreateLocationParams{
		LocationID: uuid.New(),
		Name:       req.Name,

		Description: sql.NullString{
			String: req.Description,
			Valid:  req.Description != "",
		},

		Lng: req.Lng,
		Lat: req.Lat,

		Address: sql.NullString{
			String: req.Address,
			Valid:  req.Address != "",
		},

		LocationType: sql.NullString{
			String: req.LocationType,
			Valid:  req.LocationType != "",
		},

		OpeningHours: pqtype.NullRawMessage{
			RawMessage: req.OpeningHours,
			Valid:      len(req.OpeningHours) > 0,
		},

		Status: sql.NullString{
			String: status,
			Valid:  true,
		},

		CreatorUserID: userID,
	})

	if err != nil {
		http.Error(w, "failed to create location: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	json.NewEncoder(w).Encode(location)
}

func (h *Handler) GetLocationByID(w http.ResponseWriter, r *http.Request) {

}

func (h *Handler) UserAuth(w http.ResponseWriter, r *http.Request) {
	h.Login(w, r)
}

func (h *Handler) UserCreate(w http.ResponseWriter, r *http.Request) {
	type request struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	var req request

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	if req.Username == "" {
		http.Error(w, "name is required", http.StatusBadRequest)
		return
	}

	if req.Email == "" {
		http.Error(w, "email is required", http.StatusBadRequest)
		return
	}

	if req.Password == "" {
		http.Error(w, "Password is required", http.StatusBadRequest)
		return
	}
	hash, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)

	user, err := h.q.CreateUser(r.Context(), db.CreateUserParams{
		UserID:       uuid.New(),
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: string(hash),
	})
	if err != nil {
		http.Error(w, "failed to create User: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	json.NewEncoder(w).Encode(user)

}
