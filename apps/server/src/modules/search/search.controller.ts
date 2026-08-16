import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { SearchService } from './search.service';

const searchService = new SearchService();

export const globalSearch = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const query = typeof req.query.q === 'string' ? req.query.q : '';
    const types = typeof req.query.types === 'string' ? req.query.types.split(',') : undefined;
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';
    const filters = req.query.filters ? JSON.parse(req.query.filters as string) : {};

    const result = await searchService.search(query, {
      types: types as any,
      page,
      limit,
      sortBy,
      sortOrder,
      filters,
    });

    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};
