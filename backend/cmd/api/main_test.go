package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	_ "github.com/lib/pq"

	"github.com/gotie49/swipernoswiping/internal/db"
)

// -----------------------------------------------------------------------
// Test-Setup
// -----------------------------------------------------------------------

func newTestDB(t *testing.T) *sql.DB {
	t.Helper()
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("TEST_DATABASE_URL nicht gesetzt – Test wird übersprungen")
	}
	conn, err := sql.Open("postgres", dsn)
	if err != nil {
		t.Fatalf("DB öffnen fehlgeschlagen: %v", err)
	}
	if err := conn.Ping(); err != nil {
		t.Fatalf("DB nicht erreichbar: %v", err)
	}
	return conn
}

func newTestServer(t *testing.T) *httptest.Server {
	t.Helper()
	conn := newTestDB(t)
	queries := db.New(conn)
	h := NewHandler(queries)
	router := SetupAPI(h)
	srv := httptest.NewServer(router)

	t.Cleanup(func() {
		srv.Close()
		conn.Exec("DELETE FROM locations WHERE name LIKE 'Test-%'")
		conn.Exec("DELETE FROM users WHERE email LIKE '%@test.example'")
		conn.Close()
	})
	return srv
}

func uniqueEmail() string {
	return fmt.Sprintf("user-%d@test.example", time.Now().UnixNano())
}

// -----------------------------------------------------------------------
// HTTP-Hilfsfunktionen
// -----------------------------------------------------------------------

func postJSON(t *testing.T, url string, body any) *http.Response {
	t.Helper()
	b, err := json.Marshal(body)
	if err != nil {
		t.Fatalf("JSON marshal fehlgeschlagen: %v", err)
	}
	resp, err := http.Post(url, "application/json", bytes.NewReader(b))
	if err != nil {
		t.Fatalf("POST %s fehlgeschlagen: %v", url, err)
	}
	return resp
}

func postJSONWithCookie(t *testing.T, url string, body any, cookie *http.Cookie) *http.Response {
	t.Helper()
	b, err := json.Marshal(body)
	if err != nil {
		t.Fatalf("JSON marshal fehlgeschlagen: %v", err)
	}
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(b))
	if err != nil {
		t.Fatalf("Request erstellen fehlgeschlagen: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	if cookie != nil {
		req.AddCookie(cookie)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("POST %s fehlgeschlagen: %v", url, err)
	}
	return resp
}

// -----------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------

func TestRegisterLoginFlow(t *testing.T) {
	srv := newTestServer(t)
	email := uniqueEmail()

	t.Run("register_erfolgreich", func(t *testing.T) {
		resp := postJSON(t, srv.URL+"/user/register", map[string]string{
			"username": "Testuser",
			"email":    email,
			"password": "sicheres_passwort_123",
		})
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusCreated {
			t.Errorf("Register: erwartet 201, bekommen %d", resp.StatusCode)
		}
		var result map[string]any
		json.NewDecoder(resp.Body).Decode(&result)
		if result["email"] != email {
			t.Errorf("Register: E-Mail im Response falsch: got %v", result["email"])
		}
	})

	t.Run("login_erfolgreich", func(t *testing.T) {
		resp := postJSON(t, srv.URL+"/user/login", map[string]string{
			"email":    email,
			"password": "sicheres_passwort_123",
		})
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Errorf("Login: erwartet 200, bekommen %d", resp.StatusCode)
		}
		var result map[string]string
		json.NewDecoder(resp.Body).Decode(&result)
		if result["token"] == "" {
			t.Fatal("Login: kein Token im Response")
		}

		// JWT-Inhalt prüfen (ohne Signatur-Validierung)
		token, _, err := new(jwt.Parser).ParseUnverified(result["token"], jwt.MapClaims{})
		if err != nil {
			t.Fatalf("Login: Token nicht parsebar: %v", err)
		}
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			t.Fatal("Login: Claims nicht lesbar")
		}
		if claims["email"] != email {
			t.Errorf("Login: E-Mail im Token falsch: got %v", claims["email"])
		}
	})

	t.Run("register_duplikat_schlaegt_fehl", func(t *testing.T) {
		resp := postJSON(t, srv.URL+"/user/register", map[string]string{
			"username": "Testuser2",
			"email":    email,
			"password": "anderes_passwort",
		})
		defer resp.Body.Close()
		if resp.StatusCode < 400 {
			t.Errorf("Duplikat: erwartet 4xx/5xx, bekommen %d", resp.StatusCode)
		}
	})
}

func TestLoginFehlerFaelle(t *testing.T) {
	srv := newTestServer(t)
	email := uniqueEmail()

	postJSON(t, srv.URL+"/user/register", map[string]string{
		"username": "Testuser",
		"email":    email,
		"password": "richtiges_passwort",
	})

	t.Run("falsches_passwort", func(t *testing.T) {
		resp := postJSON(t, srv.URL+"/user/login", map[string]string{
			"email":    email,
			"password": "falsches_passwort",
		})
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusUnauthorized {
			t.Errorf("erwartet 401, bekommen %d", resp.StatusCode)
		}
	})

	t.Run("unbekannte_email", func(t *testing.T) {
		resp := postJSON(t, srv.URL+"/user/login", map[string]string{
			"email":    "niemand@test.example",
			"password": "egal",
		})
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusUnauthorized {
			t.Errorf("erwartet 401, bekommen %d", resp.StatusCode)
		}
	})
}

func TestRegisterValidierung(t *testing.T) {
	srv := newTestServer(t)

	cases := []struct {
		name     string
		body     map[string]string
		wantCode int
	}{
		{"fehlendes_passwort", map[string]string{"username": "x", "email": "x@test.example"}, http.StatusBadRequest},
		{"fehlende_email", map[string]string{"username": "x", "password": "y"}, http.StatusBadRequest},
		{"fehlender_username", map[string]string{"email": "x@test.example", "password": "y"}, http.StatusBadRequest},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			resp := postJSON(t, srv.URL+"/user/register", tc.body)
			defer resp.Body.Close()
			if resp.StatusCode != tc.wantCode {
				t.Errorf("%s: erwartet %d, bekommen %d", tc.name, tc.wantCode, resp.StatusCode)
			}
		})
	}
}

func TestCreateLocationFlow(t *testing.T) {
	srv := newTestServer(t)
	email := uniqueEmail()

	postJSON(t, srv.URL+"/user/register", map[string]string{
		"username": "Testuser",
		"email":    email,
		"password": "passwort123",
	})

	loginResp := postJSON(t, srv.URL+"/user/login", map[string]string{
		"email":    email,
		"password": "passwort123",
	})
	defer loginResp.Body.Close()

	var tokenCookie *http.Cookie
	for _, c := range loginResp.Cookies() {
		if c.Name == "token" {
			tokenCookie = c
			break
		}
	}
	if tokenCookie == nil {
		t.Fatal("Kein 'token'-Cookie nach Login")
	}

	t.Run("location_mit_auth", func(t *testing.T) {
		body := map[string]any{
			"name":        "Test-Jugendzentrum Wilhelmsburg",
			"description": "Ein offener Ort für alle",
			"latitude":    53.4895,
			"longitude":   9.9927,
			"type":        "youth_center",
		}
		resp := postJSONWithCookie(t, srv.URL+"/locations", body, tokenCookie)
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
			t.Errorf("CreateLocation: erwartet 200/201, bekommen %d", resp.StatusCode)
		}
	})

	t.Run("location_ohne_auth_verboten", func(t *testing.T) {
		body := map[string]any{
			"name":      "Test-Ort ohne Auth",
			"latitude":  53.4895,
			"longitude": 9.9927,
		}
		resp := postJSON(t, srv.URL+"/locations", body)
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusUnauthorized {
			t.Errorf("Ohne Auth: erwartet 401, bekommen %d", resp.StatusCode)
		}
	})
}
