package services

import (
	"fmt"
	"os"
	"strings"

	"github.com/dgrijalva/jwt-go"
	"github.com/raojinlin/httprun/models"
	"gorm.io/gorm"
)

var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

type JWTService struct {
	db *gorm.DB
}

func NewJWTService(db *gorm.DB) *JWTService {
	return &JWTService{db}
}

func (s *JWTService) GenerateJWT(item *models.Token) (string, error) {
	token := jwt.New(jwt.SigningMethodHS256)

	claims := token.Claims.(jwt.MapClaims)
	claims["exp"] = item.ExpiresAt
	claims["iat"] = item.IssueAt

	claims["sub"] = item.Subject
	claims["name"] = item.Name
	claims["admin"] = item.IsAdmiin

	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func (s *JWTService) ParseJWT(tokenString string) (*jwt.Token, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})
	if err != nil {
		return nil, err
	}

	return token, nil
}

func (s *JWTService) GetGrantCommands(tokenString string) ([]string, error) {
	token, err := s.ParseJWT(tokenString)
	if err != nil {
		return nil, err
	}

	claims := token.Claims.(jwt.MapClaims)
	return strings.Split(claims["sub"].(string), ","), nil
}

func (s *JWTService) IsAdmin(tokenString string) (bool, error) {
	token, err := s.ParseJWT(tokenString)
	if err != nil {
		return false, err
	}

	claims := token.Claims.(jwt.MapClaims)
	return claims["admin"].(bool), nil
}

func (s *JWTService) AddToken(token *models.Token) error {
	tokenString, err := s.GenerateJWT(token)
	if err != nil {
		return err
	}

	token.JwtToken = tokenString
	s.db.Model(token).Create(token)
	return nil
}

func (s *JWTService) Verify(tokenStr string) error {
	token, err := s.ParseJWT(tokenStr)
	if err != nil {
		return err
	}

	var tokenCount int64
	s.db.Model(&models.Token{}).Where("name = ?", token.Claims.(jwt.MapClaims)["name"]).Count(&tokenCount)
	if tokenCount == 0 {
		return fmt.Errorf("token not found")
	}

	return nil
}

func (s *JWTService) List(pageIndex int, pageSize int) *models.TokenListResponse {
	var result []models.Token
	s.db.Model(&models.Token{}).Limit(pageSize).Order("created_at desc").Offset((pageIndex - 1) * pageSize).Find(&result)
	var total int64
	s.db.Model(&models.Token{}).Count(&total)
	return &models.TokenListResponse{Items: result, Total: total}
}

func (s *JWTService) Delete(id uint64) error {
	r := s.db.Model(&models.Token{}).Delete(&models.Token{Id: id})
	if r.RowsAffected == 0 {
		return fmt.Errorf("delete token failed")
	}

	return nil
}
