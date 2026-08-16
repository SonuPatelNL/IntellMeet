export const swaggerSpec: any = {
  openapi: '3.0.3',
  info: {
    title: 'IntellMeet API',
    version: '1.0.0',
    description: 'Enterprise API documentation for IntellMeet',
  },
  servers: [
    {
      url: process.env.API_URL || 'http://localhost:5000/api/v1',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'accessToken' },
    },
    schemas: {
      ErrorResponse: { type: 'object', properties: { status: { type: 'string' }, message: { type: 'string' } } },
      UserProfile: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, email: { type: 'string' } } },
    },
  },
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  paths: {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in a user',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } }, required: ['email', 'password'] } } },
        },
        responses: { 200: { description: 'Logged in' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/users/me': {
      get: { tags: ['Users'], summary: 'Get current user', responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } } },
    },
  },
};
