package app

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

// Service APIのハンドラー実装
type Service struct{}

// NewService APIのハンドラー実装を生成
func NewService() *Service {
	return &Service{}
}

// Hello .
func (srv *Service) Hello() echo.HandlerFunc {
	return func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello!")
	}
}

// HelloRoot .
func (srv *Service) HelloRoot() echo.HandlerFunc {
	return func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello Root!")
	}
}
