package models

import "time"

type Token struct {
	Id        uint64    `json:"id" gorm:"primary_key"`
	Subject   string    `json:"subject" gorm:"varchar(200)"`
	Name      string    `json:"name" gorm:"varchar(200)"`
	IsAdmiin  bool      `json:"is_admiin" gorm:"int(1)"`
	IssueAt   uint64    `json:"issue_at" gorm:"timestamp"`
	ExiresAt  uint64    `json:"exires_at" gorm:"timestamp"`
	JwtToken  string    `json:"jwt_token" gorm:"text"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type TokenListResponse struct {
	Items []Token `json:"items"`
	Total int64   `json:"total"`
}
