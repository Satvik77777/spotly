# AGENTS.md — Development Guidelines for Spotly

This document defines architectural conventions, code quality constraints, and operational requirements for AI assistants and engineers working on **Spotly**.

---

## 1. Core Principles & Philosophy
- **Real Persistence**: Never fake database operations using in-memory mock arrays or localStorage in production code. All mutations and queries must resolve via Express REST endpoints backed by MongoDB.
- **Maintainable & Explainable Architecture**: Prefer standard, clean patterns (modular MVC-inspired backend, feature-based React frontend) over bloated enterprise patterns.
- **Strict Typing**: TypeScript everywhere (`strict: true`). No `any` types unless interfacing with un-typed third-party edge cases.
- **Verification First**: Always run type checks, linters, and unit/integration tests before declaring a task complete. Report genuine test outputs.
- **Zero Secrets in Source Control**: Sensitive keys, database URIs with passwords, or API secrets must stay in `.env` (gitignored). Only commit `.env.example`.

---

## 2. Technology Stack & Boundaries
- **Backend**: Node.js, Express.js, TypeScript, MongoDB, Mongoose, Zod, Helmet, CORS, express-rate-limit.
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui design patterns, React Leaflet (OpenStreetMap), TanStack Query, Axios, React Hook Form, Zod, Lucide React, Motion, Sonner.
- **Prohibited Libraries**: Prisma, Drizzle, GraphQL, Redis, RabbitMQ, Microservices, Redux (TanStack Query handles server state).

---

## 3. Directory Structure Standards
```text
spotly/
├── client/          # Vite + React TypeScript frontend
│   └── src/
│       ├── app/         # App root & QueryClient provider
│       ├── components/  # Shared UI components & layout
│       ├── features/    # Domain-specific modules (locations)
│       │   └── locations/
│       │       ├── api/        # Axios API client & endpoints
│       │       ├── components/ # Map, Cards, Forms, Dialogs
│       │       ├── hooks/      # TanStack Query & mutation hooks
│       │       ├── schemas/    # Zod validation schemas
│       │       └── types.ts    # Frontend domain interfaces
│       ├── lib/         # Utility functions (cn, formatters)
│       └── styles/      # Global CSS & Tailwind configuration
├── server/          # Express + TypeScript backend
│   └── src/
│       ├── config/      # Env variables, database connection
│       ├── middleware/  # Error handlers, rate limiter, validation
│       ├── modules/     # Domain modules (locations)
│       │   └── locations/
│       │       ├── location.model.ts
│       │       ├── location.controller.ts
│       │       ├── location.routes.ts
│       │       └── location.schema.ts
│       ├── utils/       # Logger, response helpers
│       ├── app.ts       # Express app setup
│       └── index.ts     # Server entrypoint
├── docs/            # Architecture, API, and Project documentation
├── AGENTS.md        # Agent rules and conventions
└── README.md        # Recruiter & engineer documentation
```

---

## 4. Code & Quality Standards
1. **Error Responses**: Return standardized JSON:
   ```json
   {
     "success": false,
     "error": {
       "message": "Human-readable description",
       "code": "ERROR_CODE",
       "details": []
     }
   }
   ```
2. **Success Responses**:
   ```json
   {
     "success": true,
     "data": {}
   }
   ```
3. **Validation**: Both client and server validate inputs using shared/mirrored Zod schemas.
4. **Map Coordinates**: Ensure latitude is between -90 and 90, longitude between -180 and 180. Center demo coordinates on Chandigarh, India (30.7333, 76.7794).
5. **No Regressions**: Before pushing changes, execute `npm run typecheck` and `npm run test` in both client and server workspaces.
