help: ## Show this help
	@echo "Help"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "    \033[36m%-20s\033[93m %s\n", $$1, $$2}'

fmt: ## Format code
	go install golang.org/x/tools/cmd/goimports@latest
	find . -type f -name '*.go' | xargs goimports -w && go fmt `go list ./...`
	go mod tidy

lint: ## Execute golangci-lint
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@v1.53.2
	golangci-lint run ./... --new-from-rev=origin/main --exclude-use-default=false --timeout 10m

generate: ## Generate automated code
	go install github.com/golang/mock/mockgen@v1.6.0
	go install github.com/ervitis/foggo@v0.0.6
	go generate ./...

http-run: ## Execute the http server, it needs the OPENAI_TOKEN to run properly
	OPENAI_TOKEN=$(OPENAI_TOKEN); go run ./cmd/server/main.go

http-compile: ## Compile the http server
	go build -ldflags="-s -w" -o ./cmd/server/http_server ./cmd/server/main.go
