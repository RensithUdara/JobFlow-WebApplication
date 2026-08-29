package repository

import (
	"context"

	"jobflow/internal/model"

	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, name, email string, company *string, passwordHash string) (model.User, error) {
	var user model.User
	err := r.db.QueryRow(ctx, `
		INSERT INTO users (name, email, company, password_hash)
		VALUES ($1, $2, $3, $4)
		RETURNING id::text, name, email, company, password_hash, created_at
	`, name, email, company, passwordHash).Scan(&user.ID, &user.Name, &user.Email, &user.Company, &user.PasswordHash, &user.CreatedAt)
	return user, err
}

func (r *UserRepository) FindByEmail(ctx context.Context, email string) (model.User, error) {
	var user model.User
	err := r.db.QueryRow(ctx, `
		SELECT id::text, name, email, company, password_hash, created_at
		FROM users
		WHERE email = $1
	`, email).Scan(&user.ID, &user.Name, &user.Email, &user.Company, &user.PasswordHash, &user.CreatedAt)
	return user, err
}
