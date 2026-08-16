import { SearchService } from './search.service';

describe('SearchService', () => {
  it('returns paginated results for selected entity types with filters applied', async () => {
    const usersModel = {
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ name: 'Ada', email: 'ada@example.com' }]),
          }),
        }),
      }),
    };

    const meetingsModel = {
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ title: 'Sprint review' }]),
          }),
        }),
      }),
    };

    const messagesModel = { find: jest.fn() };
    const tasksModel = { find: jest.fn() };
    const documentsModel = { find: jest.fn() };

    const service = new SearchService({
      users: usersModel as any,
      meetings: meetingsModel as any,
      messages: messagesModel as any,
      tasks: tasksModel as any,
      documents: documentsModel as any,
    });

    const result = await service.search('ada', {
      types: ['users', 'meetings'],
      page: 1,
      limit: 5,
      filters: { status: 'active' },
    });

    expect(result.results.users).toHaveLength(1);
    expect(result.results.meetings).toHaveLength(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(5);
  });
});
