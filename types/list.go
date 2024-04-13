package types

import (
	"time"

	"github.com/raojinlin/httprun/internal/command"
	"github.com/raojinlin/httprun/models"
)

type ListCommandsResponse struct {
	ID          uint                 `json:"id"`
	Command     *command.Command     `json:"command"`
	Name        string               `json:"name"`
	Status      models.CommandStatus `json:"status"`
	Description string               `json:"description"`
	Path        string               `json:"path"`
	CreatedAt   time.Time            `json:"created_at"`
	UpdatedAt   time.Time            `json:"updated_at"`
}
