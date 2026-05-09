package main

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
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

func (h *Handler) UserAuth(w http.ResponseWriter, r *http.Request) {
	h.Login(w, r)
}

func (h *Handler) GetLocationByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	locationID, err := uuid.Parse(id)
	if err != nil {
		http.Error(w, "invalid location id", http.StatusBadRequest)
		return
	}

	location, err := h.q.GetLocationByID(r.Context(), locationID)
	if err != nil {
		http.Error(w, "location not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(location)
}

// /locations/nearby?lat=53.55&lng=9.99&distance=5000
func (h *Handler) GetNearby(w http.ResponseWriter, r *http.Request) {
	lat, err := strconv.ParseFloat(r.URL.Query().Get("lat"), 64)
	if err != nil {
		http.Error(w, "invalid lat", 400)
		return
	}

	lng, err := strconv.ParseFloat(r.URL.Query().Get("lng"), 64)
	if err != nil {
		http.Error(w, "invalid lng", 400)
		return
	}

	distance, err := strconv.ParseFloat(r.URL.Query().Get("distance"), 64)
	if err != nil {
		http.Error(w, "invalid distance", 400)
		return
	}

	locations, err := h.q.GetNearbyLocations(r.Context(), db.GetNearbyLocationsParams{
		StMakepoint:   lng,
		StMakepoint_2: lat,
		StDwithin:     distance,
	})

	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	if locations == nil {
		locations = []db.GetNearbyLocationsRow{}
	}

	json.NewEncoder(w).Encode(locations)
}

func (h *Handler) SearchLocations(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")

	locations, err := h.q.SearchLocations(r.Context(), sql.NullString{
		String: query,
		Valid:  query != "",
	})

	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	json.NewEncoder(w).Encode(locations)
}

func (h *Handler) GetCommentsByLocation(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	locationID, err := uuid.Parse(id)
	if err != nil {
		http.Error(w, "invalid location id", 400)
		return
	}

	comments, err := h.q.GetCommentsByLocation(r.Context(), locationID)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	json.NewEncoder(w).Encode(comments)
}

func (h *Handler) GetRatingsByLocation(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	locationID, err := uuid.Parse(id)
	if err != nil {
		http.Error(w, "invalid location id", 400)
		return
	}

	ratings, err := h.q.GetRatingsByLocation(r.Context(), locationID)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	json.NewEncoder(w).Encode(ratings)
}
func (h *Handler) GetTags(w http.ResponseWriter, r *http.Request) {
	tags, err := h.q.GetTags(r.Context())
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	json.NewEncoder(w).Encode(tags)
}

func (h *Handler) UpdateLocation(w http.ResponseWriter, r *http.Request) {
	type request struct {
		Name         string `json:"name"`
		Description  string `json:"description"`
		Address      string `json:"address"`
		LocationType string `json:"location_type"`
		Status       string `json:"status"`
	}

	var req request

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	locationID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid location id", http.StatusBadRequest)
		return
	}

	location, err := h.q.UpdateLocation(r.Context(), db.UpdateLocationParams{
		LocationID: locationID,

		Name: req.Name,

		Description: sql.NullString{
			String: req.Description,
			Valid:  req.Description != "",
		},

		Address: sql.NullString{
			String: req.Address,
			Valid:  req.Address != "",
		},

		LocationType: sql.NullString{
			String: req.LocationType,
			Valid:  req.LocationType != "",
		},

		Status: sql.NullString{
			String: req.Status,
			Valid:  req.Status != "",
		},
	})

	if err != nil {
		http.Error(w, "failed to update location: "+err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(location)
}

func (h *Handler) DeleteLocation(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	locationID, err := uuid.Parse(id)
	if err != nil {
		http.Error(w, "invalid location id", 400)
		return
	}

	err = h.q.DeleteLocation(r.Context(), locationID)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.WriteHeader(http.StatusOK)
}
func (h *Handler) CreateComment(w http.ResponseWriter, r *http.Request) {
	type request struct {
		LocationID string `json:"location_id"`
		Text       string `json:"text"`
	}

	var req request

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	if req.LocationID == "" {
		http.Error(w, "location_id is required", http.StatusBadRequest)
		return
	}

	if req.Text == "" {
		http.Error(w, "text is required", http.StatusBadRequest)
		return
	}

	locationID, err := uuid.Parse(req.LocationID)
	if err != nil {
		http.Error(w, "invalid location id", http.StatusBadRequest)
		return
	}

	user := GetUserFromContext(r)
	if user == nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	userID, err := uuid.Parse(user.UserID)
	if err != nil {
		http.Error(w, "invalid user id", http.StatusUnauthorized)
		return
	}

	comment, err := h.q.CreateComment(r.Context(), db.CreateCommentParams{
		CommentID:  uuid.New(),
		UserID:     userID,
		LocationID: locationID,
		Text:       req.Text,
	})

	if err != nil {
		http.Error(w, "failed to create comment: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	json.NewEncoder(w).Encode(comment)
}

func (h *Handler) DeleteComment(w http.ResponseWriter, r *http.Request) {
	commentID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid comment id", http.StatusBadRequest)
		return
	}

	err = h.q.DeleteComment(r.Context(), commentID)
	if err != nil {
		http.Error(w, "failed to delete comment", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) CreateRating(w http.ResponseWriter, r *http.Request) {
	type request struct {
		LocationID string `json:"location_id"`
		Score      int32  `json:"score"`
	}

	var req request

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	if req.LocationID == "" {
		http.Error(w, "location_id is required", http.StatusBadRequest)
		return
	}

	if req.Score < 1 || req.Score > 5 {
		http.Error(w, "score must be between 1 and 5", http.StatusBadRequest)
		return
	}

	locationID, err := uuid.Parse(req.LocationID)
	if err != nil {
		http.Error(w, "invalid location id", http.StatusBadRequest)
		return
	}

	user := GetUserFromContext(r)
	if user == nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	userID, err := uuid.Parse(user.UserID)
	if err != nil {
		http.Error(w, "invalid user id", http.StatusUnauthorized)
		return
	}

	rating, err := h.q.CreateRating(r.Context(), db.CreateRatingParams{
		RatingID:   uuid.New(),
		UserID:     userID,
		LocationID: locationID,
		Score: sql.NullInt32{
			Int32: req.Score,
			Valid: true,
		},
	})

	if err != nil {
		http.Error(w, "failed to create rating: "+err.Error(), http.StatusInternalServerError)
		return
	}

	err = h.q.UpdateLocationAverageRating(r.Context(), locationID)
	if err != nil {
		http.Error(w, "failed to update average rating", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	json.NewEncoder(w).Encode(rating)
}

func (h *Handler) ReportLocation(w http.ResponseWriter, r *http.Request) {
	type request struct {
		LocationID string `json:"location_id"`
		Reason     string `json:"reason"`
	}

	var req request

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	if req.Reason == "" {
		http.Error(w, "reason is required", http.StatusBadRequest)
		return
	}

	locationID, err := uuid.Parse(req.LocationID)
	if err != nil {
		http.Error(w, "invalid location id", http.StatusBadRequest)
		return
	}
	user := GetUserFromContext(r)
	if user == nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	userID, err := uuid.Parse(user.UserID)
	if err != nil {
		http.Error(w, "invalid user id", http.StatusUnauthorized)
		return
	}

	report, err := h.q.ReportLocation(r.Context(), db.ReportLocationParams{
		ReportID: uuid.New(),
		UserID:   userID,
		LocationID: uuid.NullUUID{
			UUID:  locationID,
			Valid: true,
		},
		Reason: req.Reason,
	})

	if err != nil {
		http.Error(w, "failed to create report: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	json.NewEncoder(w).Encode(report)
}

func (h *Handler) ReportComment(w http.ResponseWriter, r *http.Request) {
	type request struct {
		CommentID string `json:"comment_id"`
		Reason    string `json:"reason"`
	}

	var req request

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	if req.Reason == "" {
		http.Error(w, "reason is required", http.StatusBadRequest)
		return
	}

	commentID, err := uuid.Parse(req.CommentID)
	if err != nil {
		http.Error(w, "invalid comment id", http.StatusBadRequest)
		return
	}

	user := GetUserFromContext(r)
	if user == nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	userID, err := uuid.Parse(user.UserID)
	if err != nil {
		http.Error(w, "invalid user id", http.StatusUnauthorized)
		return
	}

	report, err := h.q.ReportComment(r.Context(), db.ReportCommentParams{
		ReportID: uuid.New(),
		UserID:   userID,
		CommentID: uuid.NullUUID{
			UUID:  commentID,
			Valid: true,
		},
		Reason: req.Reason,
	})

	if err != nil {
		http.Error(w, "failed to create report: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	json.NewEncoder(w).Encode(report)
}

func (h *Handler) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	user := GetUserFromContext(r)
	if user == nil {
		http.Error(w, "unauthorized", 401)
		return
	}

	json.NewEncoder(w).Encode(user)
}

func (h *Handler) UserDelete(w http.ResponseWriter, r *http.Request) {
	user := GetUserFromContext(r)
	if user == nil {
		http.Error(w, "unauthorized", 401)
		return
	}

	userID, err := uuid.Parse(user.UserID)
	if err != nil {
		http.Error(w, "invalid user", 400)
		return
	}

	err = h.q.DeleteUser(r.Context(), userID)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) GetModerationQueue(w http.ResponseWriter, r *http.Request) {
	queue, err := h.q.GetModerationQueue(r.Context())
	if err != nil {
		http.Error(w, "failed to get moderation queue", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(queue)
}

func (h *Handler) ReviewModeration(w http.ResponseWriter, r *http.Request) {
	type request struct {
		Status string `json:"status"`
	}

	var req request

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	queueID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid queue id", http.StatusBadRequest)
		return
	}

	err = h.q.ReviewModeration(r.Context(), db.ReviewModerationParams{
		QueueID: queueID,
		Status: sql.NullString{
			String: req.Status,
			Valid:  req.Status != "",
		},
	})

	if err != nil {
		http.Error(w, "failed to review moderation", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) GetReports(w http.ResponseWriter, r *http.Request) {
	reports, err := h.q.GetReports(r.Context())
	if err != nil {
		http.Error(w, "failed to get reports", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(reports)
}

func (h *Handler) HideComment(w http.ResponseWriter, r *http.Request) {
	commentID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid comment id", http.StatusBadRequest)
		return
	}

	err = h.q.HideComment(r.Context(), commentID)
	if err != nil {
		http.Error(w, "failed to hide comment", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) HideLocation(w http.ResponseWriter, r *http.Request) {
	locationID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid location id", http.StatusBadRequest)
		return
	}

	err = h.q.HideLocation(r.Context(), locationID)
	if err != nil {
		http.Error(w, "failed to hide location", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
