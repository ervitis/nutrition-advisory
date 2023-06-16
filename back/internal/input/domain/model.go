package domain

type Request struct {
	Id       uint64
	Question string
}

type Response struct {
	Advise string `json:"advise"`
}
