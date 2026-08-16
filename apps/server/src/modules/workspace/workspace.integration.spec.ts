import request from 'supertest';
import app from '../../app';
import Workspace from './workspace.model';
import Project from './project.model';
import { AuthService } from '../auth/auth.service';

jest.mock('./workspace.model');
jest.mock('./project.model');
jest.mock('../auth/auth.service');

describe('Workspace Endpoints Integration', () => {
  const mockToken = 'mock_access_token';
  const mockUserPayload = { userId: 'userid123', role: 'user' };

  beforeEach(() => {
    (AuthService.verifyAccessToken as jest.Mock).mockReturnValue(mockUserPayload);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a workspace', async () => {
    (Workspace.create as jest.Mock).mockResolvedValue({ _id: 'workspace1', name: 'Platform' });

    const response = await request(app)
      .post('/api/v1/workspaces')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ name: 'Platform' });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
  });

  it('should list projects for a workspace', async () => {
    (Project.find as jest.Mock).mockReturnValue({ sort: jest.fn().mockResolvedValue([{ name: 'Launch' }]) });

    const response = await request(app)
      .get('/api/v1/workspaces/507f1f77bcf86cd799439011/projects')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
  });
});
