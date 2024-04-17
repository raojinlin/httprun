package models

import "time"

type AccessLog struct {
	Id        uint64    `json:"id" gorm:"primary_key"`
	TokenID   string    `json:"token_id"`
	Path      string    `json:"path" gorm:"varchar(200)"`
	IP        string    `json:"ip" gorm:"varchar(200)"`
	Request   string    `json:"request" gorm:"text"`
	Response  string    `json:"response" gorm:"text"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

