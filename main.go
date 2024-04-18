package main

import (
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/raojinlin/httprun/docs"
	"github.com/raojinlin/httprun/internal/handlers"
	"github.com/raojinlin/httprun/utils"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"gorm.io/driver/sqlite"
)

// @title			httprun API
// @version		1.0
// @description	API for managing commands, tokens, and access logs
// @host			localhost:8081
// @BasePath		/api
func main() {
	godotenv.Load()
	db, err := utils.NewDB(sqlite.Open("./httprun.db"), true)
	if err != nil {
		panic(err)
	}

	router := gin.Default()
	webappBuildDir := os.Getenv("WEBAPP_BUILD_DIR")
	if webappBuildDir != "" {
		router.Static("/static", webappBuildDir+"/static")
		// Serve the index file for all routes not starting with /api or /static or /swagger
		router.NoRoute(func(ctx *gin.Context) {
			ctx.File(webappBuildDir + "/index.html")
		})
	}

	userGroup := router.Group("/api/run")
	userGroup.Use(utils.JwtMiddleware(db, false))

	userController := handlers.NewUserController(db)

	userGroup.GET("/commands", userController.GetCommandList)
	userGroup.GET("/valid", userController.Valid)
	userGroup.POST("/*path", userController.Run)

	adminGroup := router.Group("/api/admin")
	adminGroup.Use(utils.JwtMiddleware(db, true))
	{
		adminController := handlers.NewAdminController(db)
		adminGroup.POST("/command", adminController.CreateCommand)
		adminGroup.GET("/commands", adminController.GetCommandList)
		adminGroup.PUT("/commands", adminController.UpdateCommand)
		adminGroup.DELETE("/commands", adminController.DeleteCommand)
		adminGroup.GET("/tokens", adminController.GetTokenList)
		adminGroup.POST("/token", adminController.CreateToken)
		adminGroup.DELETE("/token/:tokenId", adminController.DeleteToken)
		adminGroup.GET("/accesslog", adminController.GetAccessLogList)
	}

	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	router.Run(":8081")
}
