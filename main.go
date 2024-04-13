package main

import (
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/raojinlin/httprun/models"
	"github.com/raojinlin/httprun/services"
	"github.com/raojinlin/httprun/types"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func main() {
	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
		logger.Config{
			SlowThreshold:             time.Second, // Slow SQL threshold
			LogLevel:                  logger.Info, // Log level
			IgnoreRecordNotFoundError: true,        // Ignore ErrRecordNotFound error for logger
			ParameterizedQueries:      true,        // Don't include params in the SQL log
			Colorful:                  false,       // Disable color
		},
	)
	db, err := gorm.Open(sqlite.Open("./test.db"), &gorm.Config{Logger: newLogger})
	if err != nil {
		panic(err)
	}

	err = db.AutoMigrate(&models.Command{})
	if err != nil {
		panic(err)
	}

	cmdService := services.NewCommandService(db)
	router := gin.Default()
	router.POST("/api/run/*path", func(ctx *gin.Context) {
		var request types.RunCommandRequest
		err := ctx.BindJSON(&request)
		if err != nil {
			ctx.AbortWithError(400, err)
			return
		}

		response := cmdService.RunCommand(&request)
		ctx.JSON(200, response)
	})

	adminGroup := router.Group("/api/admin")
	{
		adminGroup.POST("/command", func(ctx *gin.Context) {
			var cmd types.CreateCommandRequest
			if err := ctx.ShouldBindJSON(&cmd); err != nil {
				ctx.JSON(400, gin.H{"error": err.Error()})
				return
			}

			result, err := cmdService.CreateCommand(&cmd)
			if err != nil {
				ctx.JSON(500, gin.H{"error": err.Error()})
				return
			}

			ctx.JSON(200, result)
		})

		adminGroup.GET("/commands", func(ctx *gin.Context) {
			commands, err := cmdService.ListCommands()
			if err != nil {
				ctx.JSON(500, gin.H{"error": err.Error()})
				return
			}

			ctx.JSON(200, commands)
		})

		adminGroup.PUT("/commands", func(ctx *gin.Context) {
			var req types.UpdateCommandRequest
			if err := ctx.ShouldBindJSON(&req); err != nil {
				ctx.JSON(400, gin.H{"error": err.Error()})
				return
			}

			cmdService.UpdateCommandsStatus(req.Status, req.Commands...)
			ctx.JSON(200, gin.H{"success": true})
		})

		adminGroup.DELETE("/commands", func(ctx *gin.Context) {
			name := ctx.Query("name")
			if name == "" {
				ctx.AbortWithError(400, fmt.Errorf("name required"))
				return
			}
			cmdService.DeleteCommands(strings.Split(name, " ")...)
			ctx.JSON(200, gin.H{})
		})
	}

	router.Run(":8081")
}
