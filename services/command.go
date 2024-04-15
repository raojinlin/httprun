package services

import (
	"context"
	"encoding/json"

	"github.com/raojinlin/httprun/internal/command"
	"github.com/raojinlin/httprun/models"
	"github.com/raojinlin/httprun/types"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type CommandService struct {
	db *gorm.DB
}

func NewCommandService(db *gorm.DB) *CommandService {
	return &CommandService{db: db}
}

func (s *CommandService) CreateCommand(cmd *types.CreateCommandRequest) (*types.CreateCommandResponse, error) {
	cmdJson, err := cmd.Command.JSON()
	if err != nil {
		return nil, err
	}

	model := &models.Command{
		Name:        cmd.Name,
		Path:        cmd.Path,
		Description: cmd.Description,
		Status:      models.CommandStatusActive,
		Command:     cmdJson,
	}

	s.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "name"}},
		DoUpdates: clause.AssignmentColumns([]string{"command", "status", "description", "updated_at"}),
	}).Create(model)
	return &types.CreateCommandResponse{Id: model.ID}, nil
}

func (s *CommandService) ListCommands() ([]types.ListCommandsResponse, error) {
	var commands []models.Command
	s.db.Find(&commands)
	result := make([]types.ListCommandsResponse, 0)
	for _, cmd := range commands {
		var comm command.Command
		json.Unmarshal([]byte(cmd.Command), &comm)
		result = append(result, types.ListCommandsResponse{
			Name:        cmd.Name,
			Path:        cmd.Path,
			Description: cmd.Description,
			Command:     &comm,
			CreatedAt:   cmd.CreatedAt,
			UpdatedAt:   cmd.UpdatedAt,
			ID:          cmd.ID,
		})
	}

	return result, nil
}

func (s *CommandService) DeleteCommands(name ...string) {
	s.db.Unscoped().Where("name in (?)", name).Delete(&models.Command{})
}

func (s *CommandService) UpdateCommandsStatus(status models.CommandStatus, commands ...string) error {
	s.db.Model(&command.Command{}).Where("name in (?)", commands).Update("status", status)
	return nil
}

func (s *CommandService) RunCommand(request *types.RunCommandRequest) *types.CommandResponse {
	var cmdModel models.Command
	s.db.Model(&models.Command{}).Where("name = ?", request.Name).First(&cmdModel)
	if cmdModel.ID == 0 {
		return &types.CommandResponse{Error: "invalid command"}
	}

	if cmdModel.Status == models.CommandStatusInactive {
		return &types.CommandResponse{Error: "command is inactive"}
	}

	var cmd command.Command
	err := json.Unmarshal([]byte(cmdModel.Command), &cmd)
	if err != nil {
		return &types.CommandResponse{Error: err.Error()}
	}

	stdout, stderr, err := cmd.Run(context.Background(), request.Params, request.Env)
	if err != nil {
		return &types.CommandResponse{Error: err.Error(), Stderr: stderr, Stdout: stdout}
	}

	return &types.CommandResponse{Stdout: stdout, Stderr: stderr}
}
