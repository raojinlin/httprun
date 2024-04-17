package models

import (
	"time"
)

type CommandStatus uint

const (
	CommandStatusActive CommandStatus = iota
	CommandStatusInactive
)

type Command struct {
	ID          uint          `json:"id" gorm:"primary_key"`
	Name        string        `gorm:"unique" json:"name"`
	Path        string        `gorm:"unique" json:"path"`
	Description string        `gorm:"text" json:"description"`
	Status      CommandStatus `gorm:"int" json:"status"`
	Command     string        `gorm:"text" json:"command"`
	CreatedAt   time.Time     `json:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at"`
}
