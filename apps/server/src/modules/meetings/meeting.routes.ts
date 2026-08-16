import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validator';
import { createMeetingSchema, scheduleMeetingSchema, meetingIdParamSchema } from './meeting.validation';
import {
  createInstantMeeting,
  scheduleMeeting,
  getMeeting,
  joinMeeting,
  leaveMeeting,
  cancelMeeting,
  endMeeting,
  startRecording,
  stopRecording,
  storeRecording,
  getPlayback,
  getMeetingHistory,
  getUpcomingMeetings,
} from './meeting.controller';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

// All meeting routes require authentication
router.use(requireAuth);

// ─── Collection routes ────────────────────────────────────────────────────────
router.get('/history', getMeetingHistory);
router.get('/upcoming', getUpcomingMeetings);
router.post('/instant', validate(createMeetingSchema), createInstantMeeting);
router.post('/schedule', validate(scheduleMeetingSchema), scheduleMeeting);

// ─── Resource routes ──────────────────────────────────────────────────────────
router
  .route('/:id')
  .get(validate(meetingIdParamSchema), getMeeting);

router.post('/:id/join',   validate(meetingIdParamSchema), joinMeeting);
router.post('/:id/leave',  validate(meetingIdParamSchema), leaveMeeting);
router.post('/:id/cancel', validate(meetingIdParamSchema), cancelMeeting);
router.post('/:id/end',    validate(meetingIdParamSchema), endMeeting);
router.post('/:id/recording/start', validate(meetingIdParamSchema), startRecording);
router.post('/:id/recording/stop', validate(meetingIdParamSchema), stopRecording);
router.post('/:id/recording/store', validate(meetingIdParamSchema), upload.single('recording'), storeRecording);
router.get('/:id/recording/playback', validate(meetingIdParamSchema), getPlayback);

export default router;
