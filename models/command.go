package models

import (
	"gorm.io/gorm"
)

type CommandStatus uint

const (
	CommandStatusActive CommandStatus = iota
	CommandStatusInactive
)

type Command struct {
	gorm.Model
	Name        string        `gorm:"unique" json:"name"`
	Path        string        `gorm:"unique" json:"path"`
	Description string        `gorm:"text" json:"description"`
	Status      CommandStatus `gorm:"int" json:"status"`
	Command     string        `gorm:"text" json:"command"`
}
