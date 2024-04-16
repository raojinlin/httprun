package types

type CreateTokenRequest struct {
	Subject  string `json:"subject"`
	Name     string `json:"name"`
	IssueAt  uint64 `json:"issue_at"`
	ExiresAt uint64 `json:"exires_at"`
}

type CreateTokenResponse struct {
	Token string `json:"token"`
}
