package main

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/ervitis/nutrition-advisory/back/internal/core/domain"
	"github.com/ervitis/nutrition-advisory/back/internal/core/usecase"
	reqDomain "github.com/ervitis/nutrition-advisory/back/internal/input/domain"
	"github.com/ervitis/nutrition-advisory/back/internal/server"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/olahol/melody"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	s := make(chan os.Signal, 1)
	signal.Notify(s, os.Interrupt, os.Kill, syscall.SIGTERM)

	ctx := context.Background()

	advisory := usecase.New()

	m := melody.New()
	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"http://*", "ws://*"},
		AllowedMethods: []string{http.MethodPost, http.MethodGet, http.MethodOptions},
		AllowedHeaders: []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		MaxAge:         300,
	}))
	r.Route("/", func(ws chi.Router) {
		ws.Get("/advisory", func(w http.ResponseWriter, r *http.Request) {
			if err := m.HandleRequest(w, r); err != nil {
				log.Println(err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
		})
	})

	m.HandleMessage(func(s *melody.Session, msg []byte) {
		var question reqDomain.Request
		err := json.Unmarshal(msg, &question)
		if err != nil {
			fmt.Println(err)
			_ = m.Broadcast([]byte(`err: ` + err.Error()))
			return
		}
		d, err := advisory.Question(ctx, domain.Advisory{Message: question.Question})
		if err != nil {
			fmt.Println(err)
			_ = m.Broadcast([]byte(`err: ` + err.Error()))
		}

		b, err := json.Marshal(reqDomain.Response{Advise: d.Message})

		_ = m.Broadcast(b)
	})

	m.HandleDisconnect(func(session *melody.Session) {
		_ = session.Write([]byte(`diss`))
	})

	srv := server.NewServer(r)

	go func() {
		<-s
		_ = srv.Shutdown(ctx)
	}()

	if err := srv.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}
