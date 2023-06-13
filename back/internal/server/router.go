package server

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	customHandler "github.com/ervitis/nutrition-advisory/back/internal/input/http"
)

type router struct {
	r *chi.Mux
}

type Router interface {
	Handler() http.Handler
}

func NewRouter(ch customHandler.Handler) Router {
	r := chi.NewRouter()
	r.HandleFunc("/advisory", ch.AdvisoryHandler)

	r.HandleFunc("/health", ch.HealthCheckHandler)

	return &router{
		r: r,
	}
}

func (r router) Handler() http.Handler {
	return r.r
}
