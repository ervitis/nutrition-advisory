# nutrition-advisory

This is a WIP project about using chatGPT for nutrition advisory.

> DISCLAIMER: chatGPT can give wrong or confusing answers, please, always talk with an expert if you need help in nutrition advice.

Write your weight, number of calories you consume or achieve and the ingredients you have and ChatGPT will answer with some healthy recipes.

## Getting started

These instructions will give you a copy of the project up and running on your local machine for development and testing purposes.

## Prerequisites

- Golang 1.20 or upper version
- NodeJS 18 or upper version
  - Yarn

## Execution

- Backend:

```bash
OPENAI_TOKEN=${OPENAI_TOKEN} make http-run
```

- Frontend:

```bash
yarn build

yarn start 
```
