import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validator';
import { analyzeTranscriptSchema, searchMeetingSchema } from './ai.validation';
import { AIService } from './ai.service';

const router = Router();
router.use(requireAuth);

router.post('/meeting/analyze', validate(analyzeTranscriptSchema), async (req, res, next) => {
  try {
    const result = await AIService.analyzeTranscript(req.body.transcript);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/meeting/search', validate(searchMeetingSchema), async (req, res, next) => {
  try {
    const result = await AIService.searchMeetingKnowledge(req.query.q as string);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
