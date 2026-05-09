package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/gotie49/swipernoswiping/internal/db"
	_ "github.com/lib/pq"
)

func main() {

	dbURL := os.Getenv("DATABASE_URL")
	log.Println("DB URL:", dbURL)
	conn, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal(err)
	}

	if err := conn.Ping(); err != nil {
		log.Fatal("DB not ready:", err)
	}
	queries := db.New(conn)

	h := NewHandler(queries)

	r := SetupAPI(h)

	log.Println("Server running on :8080")

	err = http.ListenAndServe(":8080", r)
	if err != nil {
		log.Fatal(err)
	}
}

func SetupAPI(h *Handler) http.Handler {
	r := chi.NewRouter()
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "null"}, // change for prod
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// PUBLIC ROUTES
	r.Get("/locations", h.GetAllLocations)
	r.Get("/locations/{id}", h.GetLocationByID)
	r.Get("/locations/nearby", h.GetNearby)

	r.Post("/user/register", h.UserCreate)
	r.Post("/user/login", h.UserAuth)

	// PROTECTED ROUTES
	r.Group(func(protected chi.Router) {
		protected.Use(AuthMiddleware)

		protected.Post("/locations", h.CreateLocation)
		protected.Get("/user/me", h.GetCurrentUser)
		//protected.Delete("/user", h.UserDelete)
	})

	return r
}
