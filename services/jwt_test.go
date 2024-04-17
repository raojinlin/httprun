package services

import (
	"fmt"
	"testing"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/raojinlin/httprun/models"
)

func TestJWTGenerate(t *testing.T) {
	service := NewJWTService(nil)
	ts, err := service.GenerateJWT(&models.Token{
		IssueAt:   uint64(time.Now().Unix()),
		ExpiresAt: uint64(time.Now().Add(-1 * time.Hour).Unix()),
		Subject:   "user1",
		Name:      "user1",
	})

	if err != nil {
		panic(err)
	}

	token, err := service.ParseJWT(ts)
	if err != nil {
		t.Fatal(err)
	}

	claims := token.Claims.(jwt.MapClaims)
	if claims["sub"] != "user1" {
		t.Fatal(fmt.Errorf("Expected sub to be user1, got %v", claims["token"]))
	}

	if claims["name"] != "user1" {
		t.Fatal(fmt.Errorf("expected name to be user1, got %v", claims["name"]))
	}
}
