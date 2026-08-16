// @ts-ignore: optional runtime dependency
import client from 'prom-client';

const collectDefault = client.collectDefaultMetrics;
collectDefault({ timeout: 5000 });

export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.005, 0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

export const httpErrorsTotal = new client.Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP errors',
  labelNames: ['method', 'route', 'status'],
});

export const socketConnections = new client.Gauge({
  name: 'socket_connections',
  help: 'Number of active socket connections',
});

export const aiRequestsTotal = new client.Counter({
  name: 'ai_requests_total',
  help: 'Total number of AI requests',
  labelNames: ['type'],
});

export const register = client.register;

export default client;
