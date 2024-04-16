package main

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/raojinlin/httprun/models"
	"github.com/raojinlin/httprun/services"
	"github.com/raojinlin/httprun/types"
	"github.com/raojinlin/httprun/utils"
	"gorm.io/driver/sqlite"
)

func main() {
	db, err := utils.NewDB(sqlite.Open("./httprun.db"))
	if err != nil {
		panic(err)
	}

	cmdService := services.NewCommandService(db)
	accesslogService := services.NewAccessLogService(db)

	router := gin.Default()
	runGroup := router.Group("/api/run")
	runGroup.Use(utils.JwtMiddleware(db))
	runGroup.POST("/*path", func(ctx *gin.Context) {
		var request types.RunCommandRequest
		err := ctx.BindJSON(&request)
		if err != nil {
			ctx.AbortWithError(400, err)
			return
		}

		response := cmdService.RunCommand(&request)
		reqJson, _ := json.Marshal(request)
		resJson, _ := json.Marshal(response)
		utils.RecordAccessLog(accesslogService, ctx, string(reqJson), string(resJson))
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

			reqJson, _ := json.Marshal(cmd)
			resJson, _ := json.Marshal(result)
			utils.RecordAccessLog(accesslogService, ctx, string(reqJson), string(resJson))
			ctx.JSON(200, result)
		})

		adminGroup.GET("/commands", func(ctx *gin.Context) {
			commands, err := cmdService.ListCommands()
			if err != nil {
				ctx.JSON(500, gin.H{"error": err.Error()})
				return
			}

			cmdListJson, _ := json.Marshal(commands)
			utils.RecordAccessLog(accesslogService, ctx, "", string(cmdListJson))
			ctx.JSON(200, commands)
		})

		adminGroup.PUT("/commands", func(ctx *gin.Context) {
			var req types.UpdateCommandRequest
			if err := ctx.ShouldBindJSON(&req); err != nil {
				ctx.JSON(400, gin.H{"error": err.Error()})
				return
			}

			reqJson, _ := json.Marshal(req)
			utils.RecordAccessLog(accesslogService, ctx, string(reqJson), "")
			cmdService.UpdateCommandsStatus(req.Status, req.Commands...)
			ctx.JSON(200, gin.H{"success": true})
		})

		adminGroup.DELETE("/commands", func(ctx *gin.Context) {
			name := ctx.Query("name")
			if name == "" {
				ctx.AbortWithError(400, fmt.Errorf("name required"))
				return
			}
			utils.RecordAccessLog(accesslogService, ctx, name, "")
			cmdService.DeleteCommands(strings.Split(name, " ")...)
			ctx.JSON(200, gin.H{})
		})

		tokenService := services.NewJWTService(db)
		adminGroup.GET("/tokens", func(ctx *gin.Context) {
			pageIndex, pageSize := utils.ParsePage(ctx)
			ctx.JSON(200, tokenService.List(pageIndex, pageSize))
		})

		adminGroup.POST("/token", func(ctx *gin.Context) {
			var req types.CreateTokenRequest
			if err := ctx.ShouldBindJSON(&req); err != nil {
				ctx.AbortWithError(400, err)
				return
			}

			token := &models.Token{
				Subject:   req.Subject,
				Name:      req.Name,
				IssueAt:   req.IssueAt,
				ExpiresAt: req.ExiresAt,
			}
			err = tokenService.AddToken(token)

			if err != nil {
				ctx.AbortWithError(500, err)
				return
			}

			ctx.JSON(200, types.CreateTokenResponse{Token: token.JwtToken})
		})

		adminGroup.DELETE("/token/:tokenId", func(ctx *gin.Context) {
			tokenId, _ := ctx.Params.Get("tokenId")
			if tokenId == "" {
				ctx.AbortWithStatus(400)
				return
			}

			id, err := strconv.Atoi(tokenId)
			if err != nil {
				ctx.AbortWithError(400, err)
				return
			}

			err = tokenService.Delete(uint64(id))
			if err != nil {
				ctx.AbortWithError(400, err)
				return
			}

			ctx.JSON(200, gin.H{"id": id})
		})

		adminGroup.GET("/accesslog", func(ctx *gin.Context) {
			pageIndex, pageSize := utils.ParsePage(ctx)
			if err != nil {
				ctx.AbortWithError(400, err)
				return
			}

			ctx.JSON(200, accesslogService.List(pageIndex, pageSize))
		})
	}

	router.Run(":8081")
}
