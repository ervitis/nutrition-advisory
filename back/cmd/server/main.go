package main

import (
	"context"
	"github.com/ervitis/nutrition-advisory/back/internal/core/usecase"
	"github.com/ervitis/nutrition-advisory/back/internal/input/http"
	"github.com/ervitis/nutrition-advisory/back/internal/server"
	"log"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	s := make(chan os.Signal, 1)
	signal.Notify(s, os.Interrupt, os.Kill, syscall.SIGTERM)

	ctx := context.Background()

	advisory := usecase.New()
	handlers := http.New(advisory, ctx)

	r := server.NewRouter(handlers)
	srv := server.NewServer(r)

	go func() {
		<-s
		_ = srv.Shutdown(ctx)
	}()

	if err := srv.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}
