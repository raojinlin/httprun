package main

import (
	"fmt"
	"time"

	"github.com/joho/godotenv"
	"github.com/raojinlin/httprun/models"
	"github.com/raojinlin/httprun/services"
	"github.com/raojinlin/httprun/utils"
	"gorm.io/driver/sqlite"
)

func main() {
	godotenv.Load()
	db, err := utils.NewDB(sqlite.Open("./httprun.db"))
	if err != nil {
		panic(err)
	}

	jwtService := services.NewJWTService(db)
	token := &models.Token{
		Name:      "admin",
		Subject:   "admin",
		ExpiresAt: uint64(time.Now().Add(30 * 24 * time.Hour).Unix()),
		IssueAt:   uint64(time.Now().Unix()),
		IsAdmiin:  true,
	}
	jwtService.AddToken(token)
	fmt.Println(token.JwtToken)
}
