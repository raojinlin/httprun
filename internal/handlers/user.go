package handlers

import (
	"encoding/json"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/raojinlin/httprun/services"
	"github.com/raojinlin/httprun/types"
	"github.com/raojinlin/httprun/utils"
	"gorm.io/gorm"
)

type UserController struct {
	db               *gorm.DB
	jwtService       *services.JWTService
	cmdService       *services.CommandService
	accesslogService *services.AccessLogService
}

func NewUserController(db *gorm.DB) *UserController {
	return &UserController{
		db:               db,
		jwtService:       services.NewJWTService(db),
		cmdService:       services.NewCommandService(db),
		accesslogService: services.NewAccessLogService(db),
	}
}

//	@Summary		List commands
//	@Description	Lists commands that the user has permission to run
//	@Tags			commands
//	@Security		JwtAuth
//	@Accept			json
//	@Produce		json
//	@Success		200	{array}		models.Command
//	@Failure		403	{string}	string	"Permission denied"
//	@Failure		500	{string}	string	"Internal server error"
//	@Router			/run/commands [get]
func (c *UserController) GetCommandList(ctx *gin.Context) {
	jwtToken := ctx.Request.Header.Get("x-token")
	permissionCommands, err := c.jwtService.GetGrantCommands(jwtToken)
	if err != nil {
		ctx.AbortWithError(403, err)
		return
	}

	result, err := c.cmdService.ListCommands(permissionCommands...)
	if err != nil {
		ctx.AbortWithError(500, err)
		return
	}
	ctx.JSON(200, result)
}

func (c *UserController) Valid(ctx *gin.Context) {
	ctx.JSON(200, gin.H{"ok": true})
}

//	@Summary		Run a command
//	@Description	Run a command if the user has permission
//	@Tags			commands
//	@Accept			json
//	@Produce		json
//	@Param			x-token	header		string					true	"JWT token"
//	@Param			body	body		types.RunCommandRequest	true	"Command object to run"
//	@Success		200		{object}	types.CommandResponse	"Command executed successfully"
//	@Router			/run [post]
func (c *UserController) Run(ctx *gin.Context) {
	var request types.RunCommandRequest
	err := ctx.BindJSON(&request)
	if err != nil {
		ctx.AbortWithError(400, err)
		return
	}

	jwtToken := ctx.Request.Header.Get("x-token")
	permissionCommands, err := c.jwtService.GetGrantCommands(jwtToken)
	if err != nil {
		ctx.AbortWithError(403, err)
		return
	}

	commandPermissionGranted := false
	for _, command := range permissionCommands {
		if command == request.Name {
			commandPermissionGranted = true
		}
	}

	if !commandPermissionGranted {
		ctx.AbortWithError(403, fmt.Errorf("permission denied"))
		return
	}

	response := c.cmdService.RunCommand(&request)
	reqJson, _ := json.Marshal(request)
	resJson, _ := json.Marshal(response)
	utils.RecordAccessLog(c.accesslogService, ctx, string(reqJson), string(resJson))
	ctx.JSON(200, response)
}
