# IntellMeet — 5 Minute Technical Presentation

Audience: Senior Software Engineers

Slides:

1. Problem
   - Meetings are fragmented: poor notes, missed action items, low discoverability.
   - Organizations need integrated search, summaries, and traceability.

2. Solution
   - IntellMeet: real-time meetings + AI summaries, searchable transcripts, and task extraction.

3. Architecture
   - Frontend: React + Vite
   - Backend: Node.js + Express (REST + Socket.IO)
   - Data: MongoDB (primary) + Redis (cache)
   - AI: Python microservice for embeddings/summarization
   - Observability: Prometheus metrics + Grafana, Sentry

4. Tech Decisions
   - MongoDB for flexible document model and fast prototyping.
   - Socket.IO for low-latency real-time features and room semantics.
   - Prom-client for metrics and Winston for structured logging.

5. Challenges
   - Scaling real-time sockets vs API traffic.
   - Ensuring AI latency and cost controls.
   - Security: secrets management, robust password storage.

6. AI Integration
   - AI service provides summarization, action item extraction, and search embeddings.
   - Caching of AI outputs and usage metrics to control costs.

7. Security
   - JWT-based auth, CSRF protection, helmet, rate limiting.
   - Next: enforce env secrets, increase password hashing cost, enable CSP.

8. Scalability
   - K8s manifests with HPA, resource requests/limits, probes.
   - Next: split socket worker, managed databases, autoscaling rules.

9. Future Improvements
   - Multi-tenant RBAC, data governance, audit trails.
   - Offline meeting analysis, meeting analytics dashboard.

10. Call to Action
   - Review audit recommendations, prioritize secrets enforcement and password hardening.
