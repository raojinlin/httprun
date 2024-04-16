package services

import (
	"fmt"

	"github.com/dgrijalva/jwt-go"
	"github.com/raojinlin/httprun/models"
	"gorm.io/gorm"
)

var jwtSecret = []byte("XqWwD8O7j8mZaFEPhOyKDfY2pCOJTiRuvG5pVI8oUmM9BtObZrmyluJWAPyQam9UYGwE1dYikE9oR4GBkc6ls4SdkqS8C5t3")

type JWTService struct {
	db *gorm.DB
}

func NewJWTService(db *gorm.DB) *JWTService {
	return &JWTService{db}
}

func (s *JWTService) GenerateJWT(item *models.Token) (string, error) {
	token := jwt.New(jwt.SigningMethodHS256)

	claims := token.Claims.(jwt.MapClaims)
	claims["exp"] = item.ExiresAt
	claims["iat"] = item.IssueAt

	claims["sub"] = item.Subject
	claims["name"] = item.Name

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

func (s *JWTService) List() []models.Token {
	var result []models.Token
	s.db.Model(&models.Token{}).Find(&result)
	return result
}

func (s *JWTService) Delete(id uint64) error {
	r := s.db.Model(&models.Token{}).Delete(&models.Token{Id: id})
	if r.RowsAffected == 0 {
		return fmt.Errorf("delete token failed")
	}

	return nil
}
