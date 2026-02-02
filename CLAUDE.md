# PhotonicTag - AI Agent Context

This file provides context for AI agents (OpenClaw, Claude Code, etc.) to understand and work with this codebase.

## Project Overview

**PhotonicTag** is an AI-powered Digital Product Passport (DPP) platform for product traceability, sustainability tracking, and EU DPP compliance.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TailwindCSS, Shadcn/ui |
| Backend | Express.js, Node.js, TypeScript |
| Database | PostgreSQL with Drizzle ORM |
| Auth | Passport.js (Google, Microsoft OAuth, Local) |
| AI | OpenAI API for product insights |

## Project Structure

```
├── client/                 # React frontend
│   └── src/
│       ├── pages/          # Route pages
│       ├── components/     # UI components
│       └── hooks/          # Custom hooks
├── server/                 # Express backend
│   ├── auth/               # Authentication (Passport.js)
│   ├── services/           # Business logic
│   └── routes.ts           # API endpoints
├── shared/                 # Shared types/schema
│   └── schema.ts           # Drizzle DB schema
└── .github/workflows/      # CI/CD automation
```

## Key Commands

```bash
# Development
npm run dev              # Start dev server (port 5000)
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:push          # Push schema to database
npm run setup            # Initialize database

# Type checking
npm run check            # TypeScript check
```

## Environment Variables

Required in production:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key (64+ chars)
- `MASTER_ADMIN_EMAILS` - Comma-separated admin emails

Optional:
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - Google OAuth
- `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET` - Microsoft OAuth
- `OPENAI_API_KEY` - AI features
- `ALLOWED_ORIGINS` - CORS origins (comma-separated)

## API Endpoints

### Public (no auth)
- `GET /api/health` - Health check

### Protected (requires auth)
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/:id` - Get product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/iot/devices` - List IoT devices
- `POST /api/ai/summarize` - Generate AI summary

### Admin only
- `GET /api/audit-logs` - View audit logs
- `POST /api/admin/seed-demo-data` - Seed demo data

## Deployment

### Railway
1. Connect GitHub repo
2. Add PostgreSQL service
3. Set environment variables
4. Deploy automatically on push to `main`

### Health Check
- Path: `/api/health`
- Expected: `{ "status": "ok", "timestamp": "..." }`

## Common Tasks for AI Agents

### Adding a new API endpoint
1. Add route in `server/routes.ts`
2. Add `isAuthenticated` middleware for protected routes
3. Add `isAdmin` middleware for admin routes
4. Use Zod schema for validation

### Adding a new database table
1. Define schema in `shared/schema.ts`
2. Run `npm run db:push`
3. Add storage methods in `server/storage.ts`

### Running tests
Currently no test suite. To add:
1. Install vitest: `npm install -D vitest`
2. Create `__tests__/` directories
3. Add test script to package.json

## Security Notes

- All API endpoints require authentication (except `/api/health`)
- Rate limiting: 100 req/15min (API), 10 req/15min (auth)
- Helmet.js for HTTP headers
- CORS configured for allowed origins
- Session cookies: httpOnly, secure (production), sameSite=lax

## Known Issues / TODOs

1. [ ] Add test coverage
2. [ ] Split routes.ts into feature modules
3. [ ] Add OpenAPI/Swagger documentation
4. [ ] Implement pagination for list endpoints
5. [ ] Add structured logging (replace console.log)
