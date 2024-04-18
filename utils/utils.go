package utils

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/raojinlin/httprun/models"
	"github.com/raojinlin/httprun/services"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func AutoMigrate(db *gorm.DB) (err error) {
	err = db.AutoMigrate(&models.Command{})
	if err != nil {
		return
	}

	err = db.AutoMigrate(&models.AccessLog{})
	if err != nil {
		return
	}

	err = db.AutoMigrate(&models.Token{})
	return
}

func JwtMiddleware(db *gorm.DB, checkAdmin bool) func(ctx *gin.Context) {
	jwtService := services.NewJWTService(db)
	return func(ctx *gin.Context) {
		jwtToken := ctx.Request.Header.Get("x-token")
		if jwtToken == "" {
			ctx.AbortWithError(403, fmt.Errorf("token required"))
			return
		}

		err := jwtService.Verify(jwtToken)
		if err != nil {
			ctx.AbortWithError(403, err)
			return
		}

		if checkAdmin {
			if ok, _ := jwtService.IsAdmin(jwtToken); !ok {
				ctx.AbortWithError(403, fmt.Errorf("administration permission required"))
				return
			}
		}
		ctx.Next()
	}
}

func RecordAccessLog(service *services.AccessLogService, ctx *gin.Context, req string, res string) {
	service.Recrod(&models.AccessLog{
		Request:  req,
		Response: res,
		Path:     ctx.Request.RequestURI,
		IP:       ctx.Request.RemoteAddr,
		TokenID:  ctx.GetHeader("x-token"),
	})
}

func NewDB(dialector gorm.Dialector, showLog bool) (*gorm.DB, error) {
	var newLogger logger.Interface
	if showLog {
		newLogger = logger.New(
			log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
			logger.Config{
				SlowThreshold:             time.Second, // Slow SQL threshold
				LogLevel:                  logger.Info, // Log level
				IgnoreRecordNotFoundError: true,        // Ignore ErrRecordNotFound error for logger
				ParameterizedQueries:      true,        // Don't include params in the SQL log
				Colorful:                  false,       // Disable color
			},
		)
	}

	db, err := gorm.Open(dialector, &gorm.Config{Logger: newLogger})
	if err != nil {
		return nil, err
	}

	err = AutoMigrate(db)
	return db, err
}

func ParsePage(ctx *gin.Context) (pageIndex int, pageSize int) {
	pageSizeStr := ctx.Query("pageSize")
	pageSize, _ = strconv.Atoi(pageSizeStr)
	pageIndexStr := ctx.Query("pageIndex")
	pageIndex, _ = strconv.Atoi(pageIndexStr)
	return
}
