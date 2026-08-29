package service

import (
	"context"
	"errors"
	"strings"
	"time"

	"jobflow/internal/model"
	"jobflow/internal/repository"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	users     *repository.UserRepository
	jwtSecret []byte
}

func NewAuthService(users *repository.UserRepository, secret string) *AuthService {
	return &AuthService{users: users, jwtSecret: []byte(secret)}
}

func (s *AuthService) Register(ctx context.Context, name, email string, company *string, password string) (model.User, string, error) {
	name = strings.TrimSpace(name)
	email = strings.TrimSpace(strings.ToLower(email))
	if name == "" {
		return model.User{}, "", errors.New("name is required")
	}
	if company != nil {
		cleanCompany := strings.TrimSpace(*company)
		if cleanCompany == "" {
			company = nil
		} else {
			company = &cleanCompany
		}
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return model.User{}, "", err
	}
	user, err := s.users.Create(ctx, name, email, company, string(hash))
	if err != nil {
		return model.User{}, "", err
	}
	token, err := s.Token(user)
	return user, token, err
}

func (s *AuthService) Login(ctx context.Context, email, password string) (model.User, string, error) {
	user, err := s.users.FindByEmail(ctx, email)
	if err != nil {
		return model.User{}, "", errors.New("invalid credentials")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return model.User{}, "", errors.New("invalid credentials")
	}
	token, err := s.Token(user)
	return user, token, err
}

func (s *AuthService) Token(user model.User) (string, error) {
	claims := jwt.MapClaims{
		"name":  user.Name,
		"sub":   user.ID,
		"email": user.Email,
		"exp":   time.Now().Add(24 * time.Hour).Unix(),
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(s.jwtSecret)
}

func (s *AuthService) Parse(token string) (string, error) {
	parsed, err := jwt.Parse(token, func(t *jwt.Token) (any, error) {
		if t.Method != jwt.SigningMethodHS256 {
			return nil, errors.New("unexpected signing method")
		}
		return s.jwtSecret, nil
	})
	if err != nil || !parsed.Valid {
		return "", errors.New("invalid token")
	}
	claims, ok := parsed.Claims.(jwt.MapClaims)
	if !ok {
		return "", errors.New("invalid token claims")
	}
	sub, _ := claims["sub"].(string)
	if sub == "" {
		return "", errors.New("missing subject")
	}
	return sub, nil
}
