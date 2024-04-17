package handlers

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
	"gorm.io/gorm"
)

type AdminController struct {
	db               *gorm.DB
	cmdService       *services.CommandService
	tokenService     *services.JWTService
	accesslogService *services.AccessLogService
}

func NewAdminController(db *gorm.DB) *AdminController {
	return &AdminController{
		db:               db,
		cmdService:       services.NewCommandService(db),
		tokenService:     services.NewJWTService(db),
		accesslogService: services.NewAccessLogService(db),
	}
}

//	@Summary		Create a new command
//	@Description	Create a new command
//	@Tags			commands
//	@Accept			json
//	@Produce		json
//	@Param			body	body	types.CreateCommandRequest	true	"Command object to be created"
//	@Router			/admin/command [post]
func (c *AdminController) CreateCommand(ctx *gin.Context) {
	var cmd types.CreateCommandRequest
	if err := ctx.ShouldBindJSON(&cmd); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	result, err := c.cmdService.CreateCommand(&cmd)
	if err != nil {
		ctx.JSON(500, gin.H{"error": err.Error()})
		return
	}

	reqJson, _ := json.Marshal(cmd)
	resJson, _ := json.Marshal(result)
	utils.RecordAccessLog(c.accesslogService, ctx, string(reqJson), string(resJson))
	ctx.JSON(200, result)
}

//	@Summary		Update the status of one or more commands
//	@Description	Update the status of one or more commands
//	@Tags			commands
//	@Accept			json
//	@Produce		json
//	@Param			body	body	types.UpdateCommandRequest	true	"Update command status request"
//	@Success		200
//	@Failure		400
//	@Failure		500
//	@Router			/admin/commands [put]
func (c *AdminController) UpdateCommand(ctx *gin.Context) {
	var req types.UpdateCommandRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	reqJson, _ := json.Marshal(req)
	utils.RecordAccessLog(c.accesslogService, ctx, string(reqJson), "")
	c.cmdService.UpdateCommandsStatus(req.Status, req.Commands...)
	ctx.JSON(200, gin.H{"success": true})
}

//	@Summary		Get a list of all commands
//	@Description	Get a list of all commands
//	@Tags			commands
//	@Accept			json
//	@Produce		json
//	@Success		200	{array}	models.Command	"List of commands"
//	@Router			/admin/commands [get]
func (c *AdminController) GetCommandList(ctx *gin.Context) {
	commands, err := c.cmdService.ListCommands()
	if err != nil {
		ctx.JSON(500, gin.H{"error": err.Error()})
		return
	}

	cmdListJson, _ := json.Marshal(commands)
	utils.RecordAccessLog(c.accesslogService, ctx, "", string(cmdListJson))
	ctx.JSON(200, commands)
}

//	@Summary		Delete one or more commands by name
//	@Description	Delete one or more commands by name
//	@Tags			commands
//	@Accept			json
//	@Produce		json
//	@Param			name	query	string	true	"Name(s) of the command(s) to delete, separated by spaces"
//	@Router			/admin/commands [delete]
func (c *AdminController) DeleteCommand(ctx *gin.Context) {
	name := ctx.Query("name")
	if name == "" {
		ctx.AbortWithError(400, fmt.Errorf("name required"))
		return
	}
	utils.RecordAccessLog(c.accesslogService, ctx, name, "")
	c.cmdService.DeleteCommands(strings.Split(name, " ")...)
	ctx.JSON(200, gin.H{})
}

//	@Summary		Get a list of tokens
//	@Description	Get a list of tokens
//	@Tags			tokens
//	@Accept			json
//	@Produce		json
//	@Param			page	query		integer	false	"Page number"
//	@Param			size	query		integer	false	"Page size"
//	@Success		200		{object}	models.TokenListResponse
//	@Router			/admin/tokens [get]
func (c *AdminController) GetTokenList(ctx *gin.Context) {
	pageIndex, pageSize := utils.ParsePage(ctx)
	ctx.JSON(200, c.tokenService.List(pageIndex, pageSize))
}

//	@Summary		Create a new token
//	@Description	Create a new token
//	@Tags			tokens
//	@Accept			json
//	@Produce		json
//	@Param			body	body	types.CreateTokenRequest	true	"Token object to be created"
//	@Router			/admin/token [post]
func (c *AdminController) CreateToken(ctx *gin.Context) {
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
		IsAdmiin:  false,
	}
	err := c.tokenService.AddToken(token)
	if err != nil {
		ctx.AbortWithError(500, err)
		return
	}

	ctx.JSON(200, types.CreateTokenResponse{Token: token.JwtToken})
}

//	@Summary		Delete a token by ID
//	@Description	Delete a token by ID
//	@Tags			tokens
//	@Accept			json
//	@Produce		json
//	@Param			tokenId	path	string	true	"Token ID to delete"
//	@Router			/admin/token/{tokenId} [delete]
func (c *AdminController) DeleteToken(ctx *gin.Context) {
	tokenId, _ := ctx.Params.Get("tokenId")
	if tokenId == "" {
		ctx.AbortWithStatus(404)
		return
	}

	id, err := strconv.Atoi(tokenId)
	if err != nil {
		ctx.AbortWithError(400, err)
		return
	}

	err = c.tokenService.Delete(uint64(id))
	if err != nil {
		ctx.AbortWithError(400, err)
		return
	}

	ctx.JSON(200, gin.H{"id": id})
}

//	@Summary		Get a list of access logs
//	@Description	Get a list of access logs
//	@Tags			access logs
//	@Accept			json
//	@Produce		json
//	@Param			page	query		integer	false	"Page number"
//	@Param			size	query		integer	false	"Page size"
//	@Success		200		{object}	types.AccessLogResponse
//	@Router			/admin/accesslog [get]
func (c *AdminController) GetAccessLogList(ctx *gin.Context) {
	pageIndex, pageSize := utils.ParsePage(ctx)
	if pageIndex == 0 || pageSize == 0 {
		ctx.AbortWithStatus(400)
		return
	}

	ctx.JSON(200, c.accesslogService.List(pageIndex, pageSize))
}
