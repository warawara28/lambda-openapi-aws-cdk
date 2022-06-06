package main

import (
	"context"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	echolambda "github.com/awslabs/aws-lambda-go-api-proxy/echo"
	"github.com/labstack/echo/v4"

	"sample/app"
)

var echoLambda *echolambda.EchoLambda

func init() {
	srv := app.NewService()

	e := echo.New()
	e.HideBanner = true
	e.HidePort = true
	{
		e.GET("/", srv.HelloRoot())
		e.GET("/hello", srv.Hello())
	}

	echoLambda = echolambda.New(e)
}

// Handler .
func Handler(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	return echoLambda.ProxyWithContext(ctx, req)
}

func main() 
	lambda.Start(Handler)
}
