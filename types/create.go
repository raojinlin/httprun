package types

import (
	"github.com/raojinlin/httprun/internal/command"
	"github.com/raojinlin/httprun/models"
)

type CreateCommandRequest struct {
	Name        string               `json:"name" yaml:"name"`
	Path        string               `json:"path" yaml:"path"`
	Description string               `json:"description" yaml:"description"`
	Status      models.CommandStatus `json:"status" yaml:"status"`
	Command     command.Command      `json:"command" yaml:"command"`
}

type CreateCommandResponse struct {
	Id uint `json:"id" yaml:"id"`
}

type CommandResponse struct {
	Stdout string `json:"stdout" yaml:"stdout"`
	Stderr string `json:"stderr" yaml:"stderr"`
	Error  string `json:"error" yaml:"error"`
}

type RunCommandRequest struct {
	Name   string          `json:"name" yaml:"name"`
	Params []command.Param `json:"params" yaml:"params"`
	Env    []command.Env   `json:"env" yaml:"env"`
}

type UpdateCommandRequest struct {
	Commands []string             `json:"commands" yaml:"commands"`
	Status   models.CommandStatus `json:"status" yaml:"status"`
}

type UpdateCommandResponse struct {
	Id uint `json:"id" yaml:"id"`
}
