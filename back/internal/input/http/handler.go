package http

import (
	"context"
	"fmt"
	"github.com/ervitis/nutrition-advisory/back/internal/core/usecase"
	"log"
	"net/http"

	"github.com/olahol/melody"

	"github.com/ervitis/nutrition-advisory/back/internal/input/domain"
)

type handler struct {
	m *melody.Melody

	a   usecase.Advisory
	ctx context.Context
}

type Handler interface {
	HealthCheckHandler(http.ResponseWriter, *http.Request)
	AdvisoryHandler(http.ResponseWriter, *http.Request)

	WSConnectHandler() func(s *melody.Session)
	WSDisconnectHandler() func(s *melody.Session)
	WSMessageHandler() func(s *melody.Session)
}

func New(adv usecase.Advisory, ctx context.Context) Handler {
	return &handler{melody.New(), adv, ctx}
}

func (h handler) HealthCheckHandler(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusOK)
}

func (h handler) AdvisoryHandler(w http.ResponseWriter, r *http.Request) {
	if err := h.m.HandleRequest(w, r); err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

func (h handler) WSConnectHandler() func(s *melody.Session) {
	return func(s *melody.Session) {
		_ = s.Write([]byte(`conn`))
	}
}

func (h handler) WSDisconnectHandler() func(s *melody.Session) {
	return func(s *melody.Session) {
		_ = h.m.Broadcast([]byte(`dis`))
	}
}

func (h handler) WSMessageHandler() func(s *melody.Session) {
	return func(s *melody.Session) {
		value, exists := s.Get("question")

		if !exists {
			return
		}

		question := value.(*domain.Request)

		if err := h.a.Question(h.ctx); err != nil {
			fmt.Println(err)
			_ = h.m.Broadcast([]byte(`err: ` + err.Error()))
		}

		_ = h.m.Broadcast([]byte(`msg: ` + question.Question))
	}
}
