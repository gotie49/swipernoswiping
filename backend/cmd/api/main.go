package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/gotie49/swipernoswiping/internal/db"
	_ "github.com/lib/pq"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")

	conn, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal(err)
	}

	if err := conn.Ping(); err != nil {
		log.Fatal("DB not ready:", err)
	}

	queries := db.New(conn)
	r := SetupAPI()

	log.Println("Server running on 8080")
	http.ListenAndServe(":8080", r)
}


func SetupAPI() {
	r := chi.NewRouter()

	r.Get("/locations", h.GetAllLocations)	
	r.Post("/locations", h.CreateLocation)
	r.Get("/locations/{id}", h.GetLocationByID)
	r.Get("/locations/nearby", h.GetNearby)
	
	r.Get("/user", h.UserAuth)
	r.Post("/user", h.UserCreate)
	r.Delete("/user", h.UserDelete )
	
	r.
	
	return r
}