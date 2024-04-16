package services

import (
	"time"

	"github.com/raojinlin/httprun/models"
	"github.com/raojinlin/httprun/types"
	"gorm.io/gorm"
)

type AccessLogService struct {
	db *gorm.DB
}

func NewAccessLogService(db *gorm.DB) *AccessLogService {
	return &AccessLogService{db}
}

func (a *AccessLogService) Recrod(item *models.AccessLog) error {
	item.CreatedAt = time.Now()
	item.UpdatedAt = time.Now()
	a.db.Create(item)
	return nil
}

func (a *AccessLogService) List(pageIndex int, pageSize int) *types.AccessLogResponse {
	var result = []models.AccessLog{}
	a.db.Model(&models.AccessLog{}).Limit(pageSize).Offset((pageIndex - 1) * pageSize).Order("created_at desc").Find(&result)
	var total int64
	a.db.Model(&models.AccessLog{}).Count(&total)
	return &types.AccessLogResponse{
		Items: result,
		Total: total,
	}
}
