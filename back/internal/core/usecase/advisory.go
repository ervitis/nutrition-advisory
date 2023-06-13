package usecase

import (
	"context"
	"fmt"
)

type advisory struct{}
type Advisory interface {
	Question(context.Context) error
}

func New() Advisory {
	return &advisory{}
}

func (a advisory) Question(ctx context.Context) error {
	fmt.Printf("hello")
	return nil
}
