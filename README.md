# Express.js on Vercel

Express.js API with OAuth 2.0 authentication, JWT tokens, JWKS endpoint, and automatic Swagger documentation.

## Features

- 🔐 **OAuth 2.0 Authentication** - Client credentials flow with JWT tokens
- 🔑 **JWKS Endpoint** - Public key distribution at `/.well-known/jwks.json`
- 📚 **Swagger Documentation** - Auto-generated API docs at `/api-docs`
- 🛡️ **Protected Routes** - Bearer token authentication middleware
- 🚀 **Vercel Ready** - Environment variable support for serverless deployment
- ✅ **TypeScript** - Full type safety

## Quick Start

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Server runs at http://localhost:3000

Swagger UI: http://localhost:3000/api-docs

### Get an OAuth Token

```bash
curl -X POST http://localhost:3000/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "client_credentials",
    "client_id": "demo-client-id",
    "client_secret": "demo-client-secret"
  }'
```

### Access Protected Endpoint

```bash
curl http://localhost:3000/api/protected \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Deploying to Vercel

### 1. Generate and Encode Keys

```bash
# Generate keys locally
pnpm dev

# Encode keys for Vercel
pnpm encode-keys
```

This outputs base64-encoded `RSA_PRIVATE_KEY` and `RSA_PUBLIC_KEY`.

### 2. Add Environment Variables to Vercel

Go to your Vercel project → **Settings** → **Environment Variables** and add:

| Variable | Value | Required |
|----------|-------|----------|
| `RSA_PRIVATE_KEY` | Base64-encoded private key | ✅ Yes |
| `RSA_PUBLIC_KEY` | Base64-encoded public key | ✅ Yes |
| `CLIENT_ID` | Your client ID | ⚠️ Recommended |
| `CLIENT_SECRET` | Your client secret | ⚠️ Recommended |
| `JWT_ISSUER` | `https://your-app.vercel.app` | Optional |
| `JWT_AUDIENCE` | `api` | Optional |

### 3. Deploy

```bash
git push origin main
```

Vercel will automatically deploy.

**📖 Full deployment guide:** See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | Home page |
| GET | `/api-docs` | No | Swagger UI |
| POST | `/oauth/token` | No | Get access token |
| GET | `/.well-known/jwks.json` | No | Public keys (JWKS) |
| GET | `/api/protected` | Yes | Protected endpoint |
| GET | `/api-data` | No | Sample data |
| GET | `/healthz` | No | Health check |

## Scripts

```bash
pnpm dev              # Start development server
pnpm generate-swagger # Generate swagger.json
pnpm encode-keys      # Encode RSA keys for Vercel
pnpm build            # Build for production
pnpm start            # Start production server
```

## Documentation

- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Complete Vercel deployment guide
- **[swagger.json](./swagger.json)** - OpenAPI 3.0 specification

## Project Structure

```
src/
├── auth/
│   ├── keys.ts          # RSA key management
│   ├── jwks.ts          # JWKS endpoint
│   ├── oauth.ts         # Token generation
│   └── middleware.ts    # Auth middleware
├── index.ts             # Main app with routes
├── server.ts            # Server entry point
└── swagger.config.ts    # Swagger configuration
```

## Security

- RSA keys are auto-generated on first run
- Keys stored in `keys/` directory (gitignored)
- Production uses environment variables
- JWT tokens signed with RS256
- Default token expiration: 1 hour

**⚠️ Important:** Change default `CLIENT_ID` and `CLIENT_SECRET` in production!

## Testing/Debugging
```
pnpm dev
```

## License

MIT
