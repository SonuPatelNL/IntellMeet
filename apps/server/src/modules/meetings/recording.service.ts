import Meeting from './meeting.model';
import Recording from './recording.model';
import { types } from 'util';
import { AppError } from '../../middleware/error.middleware';
import { storageService } from '../../storage/storage.service';

function makeError(message: string, statusCode: number): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}

export class RecordingService {
  static async startRecording(meetingId: string, userId: string) {
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) throw makeError('Meeting not found', 404);

    const hostId = meeting.hostId?.toString() ?? meeting.hostId;
    if (hostId !== userId) {
      throw makeError('Only the host can start recording', 403);
    }

    if (meeting.status !== 'active') {
      throw makeError('Recording can only start for an active meeting', 400);
    }

    const existing = await Recording.findOne({ meetingId, status: 'recording' });
    if (existing) {
      return existing;
    }

    return Recording.create({
      meetingId,
      status: 'recording',
      startedAt: new Date(),
    });
  }

  static async stopRecording(meetingId: string, userId: string) {
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) throw makeError('Meeting not found', 404);

    const hostId = meeting.hostId?.toString() ?? meeting.hostId;
    if (hostId !== userId) {
      throw makeError('Only the host can stop recording', 403);
    }

    const recording = await Recording.findOne({ meetingId, status: 'recording' });
    if (!recording) {
      throw makeError('No active recording found', 404);
    }

    recording.status = 'processing';
    recording.stoppedAt = new Date();
    recording.durationSeconds = Math.max(0, Math.floor((recording.stoppedAt.getTime() - (recording.startedAt?.getTime() || recording.stoppedAt.getTime())) / 1000));
    await recording.save();

    return recording;
  }

  static async storeRecording(meetingId: string, userId: string, fileBuffer: Buffer, filename: string, contentType: string) {
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) throw makeError('Meeting not found', 404);

    const isHost = meeting.hostId?.toString() === userId;
    const attendeeIds = (meeting.attendees || []).map((attendee: any) => attendeeIdToString(attendee));
    const isAttendee = attendeeIds.includes(userId);
    if (!isHost && !isAttendee) {
      throw makeError('You do not have permission to store this recording', 403);
    }

    const recording = await Recording.findOne({ meetingId, status: { $in: ['recording', 'processing'] } });
    if (!recording) {
      throw makeError('Recording session not found', 404);
    }

    const uploadResult = await storageService.upload(fileBuffer, {
      folder: 'intellmeet/recordings',
      filename,
      contentType,
    });

    recording.status = 'ready';
    recording.storageKey = uploadResult.key;
    recording.storageUrl = uploadResult.url;
    recording.signedUrl = await storageService.getSignedUrl(uploadResult.key, 3600);
    recording.stoppedAt = recording.stoppedAt || new Date();
    await recording.save();

    return {
      recording,
      signedUrl: recording.signedUrl,
    };
  }

  static async getPlaybackUrl(meetingId: string, userId: string) {
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) throw makeError('Meeting not found', 404);

    const isHost = meeting.hostId?.toString() === userId;
    const attendeeIds = (meeting.attendees || []).map((attendee: any) => attendeeIdToString(attendee));
    const isAttendee = attendeeIds.includes(userId);
    if (!isHost && !isAttendee) {
      throw makeError('You do not have permission to view this recording', 403);
    }

    const recording = await Recording.findOne({ meetingId, status: 'ready' });
    if (!recording) {
      throw makeError('Recording not found', 404);
    }

    return {
      recording,
      signedUrl: recording.signedUrl || (recording.storageKey ? await storageService.getSignedUrl(recording.storageKey, 3600) : null),
    };
  }
}

function attendeeIdToString(attendee: any): string {
  if (!attendee) return '';
  if (typeof attendee === 'string') return attendee;
  if (types.isNativeError(attendee)) return '';
  return attendee._id?.toString() || attendee.toString();
}
