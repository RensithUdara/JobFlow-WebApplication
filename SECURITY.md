# Security Policy

## Supported Version

This project is currently in active development. Security fixes should target the latest code in the main branch.

## Reporting A Vulnerability

If you find a security issue:

1. Do not publish the vulnerability publicly.
2. Document the affected area.
3. Include reproduction steps if possible.
4. Share the issue privately with the project owner.

## Security Notes

- Never commit real `.env` files.
- Use a strong `JWT_SECRET`.
- Use HTTPS in production.
- Do not expose PostgreSQL or Redis publicly.
- Rotate secrets if they are leaked.
- Use strong PostgreSQL credentials outside local development.
- Restrict CORS with `ALLOWED_ORIGIN`.

## Production Hardening Checklist

- Replace default database password
- Replace default JWT secret
- Run API behind HTTPS
- Enable proper logging and monitoring
- Use managed PostgreSQL/Redis or secure private networking
- Configure backups
- Add rate limiting for auth endpoints
- Add request size limits for payload JSON

