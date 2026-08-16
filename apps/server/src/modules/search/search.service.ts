import { Model, FilterQuery } from 'mongoose';
import { User } from '../users/user.model';
import Meeting from '../meetings/meeting.model';
import Message from '../chat/message.model';
import Task from '../tasks/task.model';

export type SearchEntityType = 'users' | 'meetings' | 'messages' | 'tasks' | 'documents';

export interface SearchOptions {
  types?: SearchEntityType[];
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResultItem {
  type: SearchEntityType;
  id: string;
  title?: string;
  description?: string;
  snippet?: string;
  score?: number;
  [key: string]: any;
}

export interface GlobalSearchResponse {
  query: string;
  page: number;
  limit: number;
  total: number;
  results: Record<SearchEntityType, SearchResultItem[]>;
}

export class SearchService {
  constructor(private readonly models: {
    users: Model<any>;
    meetings: Model<any>;
    messages: Model<any>;
    tasks: Model<any>;
    documents: Model<any>;
  } = {
    users: User,
    meetings: Meeting,
    messages: Message,
    tasks: Task,
    documents: {} as Model<any>,
  }) {}

  async search(query: string, options: SearchOptions = {}): Promise<GlobalSearchResponse> {
    const normalizedQuery = query?.trim();
    if (!normalizedQuery) {
      return this.emptyResponse(normalizedQuery || '', options);
    }

    const types: SearchEntityType[] = options.types?.length
      ? options.types
      : ['users', 'meetings', 'messages', 'tasks', 'documents'];
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 20));
    const filters = options.filters || {};
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';

    const response: GlobalSearchResponse = {
      query: normalizedQuery,
      page,
      limit,
      total: 0,
      results: {
        users: [],
        meetings: [],
        messages: [],
        tasks: [],
        documents: [],
      },
    };

    for (const type of types) {
      const docs = await this.runTypeSearch(type, normalizedQuery, { page, limit, filters, sortBy, sortOrder });
      response.results[type as SearchEntityType] = docs;
      response.total += docs.length;
    }

    return response;
  }

  private async runTypeSearch(type: SearchEntityType, query: string, options: Required<Pick<SearchOptions, 'page' | 'limit' | 'filters' | 'sortBy' | 'sortOrder'>>) {
    const model = this.models[type];
    if (!model || typeof (model as any).find !== 'function') {
      return [];
    }

    const searchFilter = this.buildFilter(type, query, options.filters);
    const sortSpec = { [options.sortBy]: options.sortOrder === 'asc' ? 1 : -1 };

    const docs = await (model as any)
      .find(searchFilter)
      .sort(sortSpec)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);

    return docs.map((doc: any) => this.normalizeResult(type, doc));
  }

  private buildFilter(type: SearchEntityType, query: string, filters: Record<string, any> = {}) {
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const baseFilter: FilterQuery<any> = { ...filters };

    switch (type) {
      case 'users':
        baseFilter.$or = [{ name: regex }, { email: regex }];
        break;
      case 'meetings':
        baseFilter.$or = [{ title: regex }, { description: regex }];
        break;
      case 'messages':
        baseFilter.$or = [{ content: regex }];
        break;
      case 'tasks':
        baseFilter.$or = [{ title: regex }, { description: regex }];
        break;
      case 'documents':
        baseFilter.$or = [{ title: regex }, { content: regex }, { filename: regex }];
        break;
    }

    return baseFilter;
  }

  private normalizeResult(type: SearchEntityType, doc: any): SearchResultItem {
    const base = doc.toObject ? doc.toObject() : doc;
    return {
      type,
      id: base._id?.toString?.() || base.id,
      title: base.title || base.name || base.filename || base.content?.slice(0, 80),
      description: base.description || base.content?.slice(0, 160) || base.email,
      snippet: base.content?.slice(0, 160) || base.description || base.email,
      score: 1,
      ...base,
    };
  }

  private emptyResponse(query: string, options: SearchOptions): GlobalSearchResponse {
    return {
      query,
      page: Math.max(1, options.page || 1),
      limit: Math.min(50, Math.max(1, options.limit || 20)),
      total: 0,
      results: {
        users: [],
        meetings: [],
        messages: [],
        tasks: [],
        documents: [],
      },
    };
  }
}
