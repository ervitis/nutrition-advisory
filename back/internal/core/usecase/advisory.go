package usecase

import (
	"context"
	"log"
	"os"

	"github.com/ervitis/nutrition-advisory/back/internal/core/domain"
	"github.com/sashabaranov/go-openai"
)

type advisory struct {
	client *openai.Client
}
type Advisory interface {
	Question(context.Context, domain.Advisory) (domain.Advisory, error)
}

func New() Advisory {
	token := os.Getenv("OPENAI_TOKEN")
	if token == "" {
		log.Fatal("OPENAI_TOKEN env var empty")
	}

	return &advisory{openai.NewClient(token)}
}

func (a advisory) Question(ctx context.Context, adv domain.Advisory) (domain.Advisory, error) {
	resp, err := a.client.CreateChatCompletion(
		ctx,
		openai.ChatCompletionRequest{
			Model: openai.GPT3Dot5Turbo0301,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleUser,
					Content: adv.Message,
				},
			},
		},
	)
	if err != nil {
		return domain.Advisory{}, err
	}

	return domain.Advisory{Message: resp.Choices[0].Message.Content}, nil
}
