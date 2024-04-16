package types

import "github.com/raojinlin/httprun/models"

type AccessLogResponse struct {
	Items []models.AccessLog `json:"items"`
	Total int64              `json:"total"`
}
