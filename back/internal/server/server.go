package server

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"time"
)

//go:generate foggo afop --struct Server --no-instance
type Server struct {
	router Router       `foggo:"-"`
	http   *http.Server `foggo:"-"`

	Port    int
	Address string
}

type IServer interface {
	ListenAndServe() error
	Shutdown(context.Context) error
}

const (
	timeoutDuration = 5 * time.Second
)

func defaultServerOptions() *Server {
	return &Server{
		Port:    8080,
		Address: "0.0.0.0",
	}
}

func NewServer(router Router, opts ...ServerOption) IServer {

	srvOpts := defaultServerOptions()
	for _, opt := range opts {
		opt.apply(srvOpts)
	}

	srv := &http.Server{
		Addr:                         fmt.Sprintf("%s:%d", srvOpts.Address, srvOpts.Port),
		Handler:                      router.Handler(),
		DisableGeneralOptionsHandler: false,
		TLSConfig:                    nil,
		ReadTimeout:                  timeoutDuration,
		ReadHeaderTimeout:            timeoutDuration,
		WriteTimeout:                 timeoutDuration,
		IdleTimeout:                  5 * timeoutDuration,
	}
	return &Server{router: router, http: srv}
}

func (s Server) ListenAndServe() error {
	if err := s.http.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
		return err
	}
	return nil
}

func (s Server) Shutdown(ctx context.Context) error {
	return s.http.Shutdown(ctx)
}
