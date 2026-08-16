# IntellMeet

IntellMeet is an AI-powered meeting and collaboration platform designed for enterprises. This repository contains a monorepo with backend, frontend, AI services, and deployment manifests suitable for demo and production environments.

## Features
- Real-time chat and meetings with WebRTC signaling
- AI-driven meeting summarization and action item extraction
- Tasks, workspaces, and project management
- Integrations: Cloudinary, OpenAI
- Observability: Prometheus metrics, structured logging, Sentry

## Architecture

High-level architecture:

- Frontend (Vite + React)
- Backend (Node.js + Express) — REST API + Socket.IO
- Data stores: MongoDB (primary), Redis (cache)
- AI microservice (Python) for embeddings, summarization, transcription
- Deployment: Kubernetes manifests in `deployment/k8s`

![Architecture Diagram](docs/screenshots/architecture.png)

## Tech Stack
- Node.js, TypeScript, Express
- MongoDB + Mongoose
- Redis
- Socket.IO
- React + Vite
- Prometheus + Grafana (observability)
- Sentry (error tracking)

## Installation
1. Install dependencies (pnpm recommended):

```bash
pnpm install
pnpm --filter server install
pnpm --filter web install
```

2. Copy `.env.example` to `.env` and populate environment variables for your environment.

## Environment Setup
See `.env.example` for supported variables. NEVER commit secrets — use Kubernetes Secrets or a secret manager in production.

## API Docs
Swagger UI available at `/api/v1/docs` when the server is running.

## Seeding Demo Data
From repository root run:

```bash
cd apps/server
pnpm run seed
```

This creates 10 users, 5 teams (workspaces), 20 meetings, 100 messages, and 50 tasks for demo purposes.

## Deployment
Kubernetes manifests live under `deployment/k8s`. Use `kubectl apply -k deployment/k8s` after configuring your cluster and secrets.

## Screenshots
Add screenshots to `docs/screenshots` for UI pages and diagrams.

## Future Roadmap
- Separate socket and API processes
- Production MongoDB replica set and managed Redis
- Helm charts and CI/CD pipelines
- Advanced AI evaluation and prompt optimization

## Contributing
Follow standard GitHub PR workflow. Ensure tests pass and add descriptive commit messages.

## License
See LICENSE in the repo root.
