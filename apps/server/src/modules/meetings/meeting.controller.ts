import { Response, NextFunction } from 'express';
import { MeetingService } from './meeting.service';
import { RecordingService } from './recording.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { AuditLogService } from '../auditLogs/auditLogs.service';
import { AuditAction } from '../auditLogs/auditLog.model';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ok = (res: Response, data: object, statusCode = 200) =>
  res.status(statusCode).json({ status: 'success', data });

const list = (res: Response, items: any[], key: string) =>
  res.status(200).json({ status: 'success', results: items.length, data: { [key]: items } });

// ─── Controllers ──────────────────────────────────────────────────────────────

export const createInstantMeeting = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const meeting = await MeetingService.createInstantMeeting(req.user!.userId, req.body);
    await AuditLogService.createAuditLog({
      user: req.user!.userId,
      action: AuditAction.MEETING_CREATE,
      ip: req.ip,
      metadata: { meetingId: meeting._id, title: meeting.title, type: 'instant' },
    });
    ok(res, { meeting }, 201);
  } catch (error) {
    next(error);
  }
};

export const scheduleMeeting = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const meeting = await MeetingService.scheduleMeeting(req.user!.userId, req.body);
    await AuditLogService.createAuditLog({
      user: req.user!.userId,
      action: AuditAction.MEETING_CREATE,
      ip: req.ip,
      metadata: { meetingId: meeting._id, title: meeting.title, type: 'scheduled' },
    });
    ok(res, { meeting }, 201);
  } catch (error) {
    next(error);
  }
};

export const getMeeting = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const meeting = await MeetingService.getMeetingById(req.params.id);
    ok(res, { meeting });
  } catch (error) {
    next(error);
  }
};

export const joinMeeting = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const meeting = await MeetingService.joinMeeting(req.params.id, req.user!.userId);
    ok(res, { meeting });
  } catch (error) {
    next(error);
  }
};

export const leaveMeeting = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await MeetingService.leaveMeeting(req.params.id, req.user!.userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const cancelMeeting = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const meeting = await MeetingService.cancelMeeting(req.params.id, req.user!.userId);
    ok(res, { meeting });
  } catch (error) {
    next(error);
  }
};

export const endMeeting = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const meeting = await MeetingService.endMeeting(req.params.id, req.user!.userId);
    ok(res, { meeting });
  } catch (error) {
    next(error);
  }
};

export const startRecording = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const recording = await RecordingService.startRecording(req.params.id, req.user!.userId);
    ok(res, { recording }, 201);
  } catch (error) {
    next(error);
  }
};

export const stopRecording = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const recording = await RecordingService.stopRecording(req.params.id, req.user!.userId);
    ok(res, { recording });
  } catch (error) {
    next(error);
  }
};

export const storeRecording = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'Recording file is required' });
    }

    const result = await RecordingService.storeRecording(
      req.params.id,
      req.user!.userId,
      req.file.buffer,
      req.file.originalname || `${req.params.id}.webm`,
      req.file.mimetype || 'application/octet-stream'
    );

    ok(res, { recording: result.recording, signedUrl: result.signedUrl }, 201);
  } catch (error) {
    next(error);
  }
};

export const getPlayback = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const playback = await RecordingService.getPlaybackUrl(req.params.id, req.user!.userId);
    ok(res, { playback });
  } catch (error) {
    next(error);
  }
};

export const getMeetingHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const meetings = await MeetingService.getMeetingHistory(req.user!.userId);
    list(res, meetings, 'meetings');
  } catch (error) {
    next(error);
  }
};

export const getUpcomingMeetings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const meetings = await MeetingService.getUpcomingMeetings(req.user!.userId);
    list(res, meetings, 'meetings');
  } catch (error) {
    next(error);
  }
};
