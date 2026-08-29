package middleware

import (
	"net/http"
	"strings"

	"jobflow/internal/service"

	"github.com/gin-gonic/gin"
)

const UserIDKey = "userID"

func Auth(auth *service.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		token := strings.TrimPrefix(header, "Bearer ")
		if token == "" || token == header {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing bearer token"})
			return
		}
		userID, err := auth.Parse(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}
		c.Set(UserIDKey, userID)
		c.Next()
	}
}

func UserID(c *gin.Context) string {
	value, _ := c.Get(UserIDKey)
	id, _ := value.(string)
	return id
}
