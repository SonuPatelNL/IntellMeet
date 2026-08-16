import Meeting, { IMeeting } from './meeting.model';
import { Types } from 'mongoose';
import { AppError } from '../../middleware/error.middleware';

/**
 * Creates an operational AppError with a given message and HTTP status code.
 */
function makeError(message: string, statusCode: number): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}

export class MeetingService {
  // ─────────────────────────────────────────────
  // Create
  // ─────────────────────────────────────────────

  static async createInstantMeeting(
    hostId: string | Types.ObjectId,
    data: { title: string; description?: string; workspaceId?: string; projectId?: string }
  ): Promise<IMeeting> {
    return Meeting.create({
      ...data,
      hostId,
      startTime: new Date(),
      status: 'active',
      attendees: [hostId],
    });
  }

  static async scheduleMeeting(
    hostId: string | Types.ObjectId,
    data: { title: string; description?: string; startTime: Date | string; workspaceId?: string; projectId?: string }
  ): Promise<IMeeting> {
    const startTime = new Date(data.startTime);
    if (startTime <= new Date()) {
      throw makeError('Scheduled start time must be in the future', 400);
    }

    return Meeting.create({
      ...data,
      startTime,
      hostId,
      status: 'scheduled',
      attendees: [hostId],
    });
  }

  // ─────────────────────────────────────────────
  // Read
  // ─────────────────────────────────────────────

  static async getMeetingById(meetingId: string): Promise<IMeeting> {
    const meeting = await Meeting.findById(meetingId)
      .populate('hostId', 'name email avatarUrl')
      .populate('attendees', 'name email avatarUrl');

    if (!meeting) {
      throw makeError('Meeting not found', 404);
    }

    return meeting;
  }

  static async getMeetingHistory(userId: string | Types.ObjectId): Promise<IMeeting[]> {
    return Meeting.find({
      $or: [{ hostId: userId }, { attendees: userId }],
    })
      .sort({ startTime: -1 })
      .populate('hostId', 'name email avatarUrl');
  }

  static async getUpcomingMeetings(userId: string | Types.ObjectId): Promise<IMeeting[]> {
    return Meeting.find({
      $or: [{ hostId: userId }, { attendees: userId }],
      status: 'scheduled',
      startTime: { $gte: new Date() },
    })
      .sort({ startTime: 1 })
      .populate('hostId', 'name email avatarUrl');
  }

  // ─────────────────────────────────────────────
  // Participant lifecycle
  // ─────────────────────────────────────────────

  static async joinMeeting(meetingId: string, userId: string | Types.ObjectId): Promise<IMeeting> {
    const meeting = await this.getMeetingById(meetingId);

    if (meeting.status === 'cancelled') {
      throw makeError('Cannot join a cancelled meeting', 400);
    }

    if (meeting.status === 'completed') {
      throw makeError('Cannot join a meeting that has already ended', 400);
    }

    // Auto-activate if host joins a scheduled meeting
    if (meeting.status === 'scheduled') {
      const hostId = (meeting.hostId as any)._id?.toString() ?? meeting.hostId.toString();
      if (hostId === userId.toString()) {
        meeting.status = 'active';
      }
    }

    // Add to attendees list if not already present (preserved for history)
    const alreadyAttendee = meeting.attendees.some(
      (id: any) => (id._id ?? id).toString() === userId.toString()
    );
    if (!alreadyAttendee) {
      meeting.attendees.push(userId as Types.ObjectId);
    }

    await meeting.save();
    return meeting.populate('attendees', 'name email avatarUrl');
  }

  /**
   * leaveMeeting — records departure but keeps user in attendees for history.
   * When the host leaves an active meeting, the meeting is marked completed.
   */
  static async leaveMeeting(meetingId: string, userId: string | Types.ObjectId): Promise<void> {
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) throw makeError('Meeting not found', 404);

    const hostId = meeting.hostId.toString();
    const isHost = hostId === userId.toString();

    if (isHost && meeting.status === 'active') {
      meeting.status = 'completed';
      meeting.endTime = new Date();
      await meeting.save();
    }
    // Note: attendees list is preserved intentionally for meeting history.
  }

  // ─────────────────────────────────────────────
  // Host controls
  // ─────────────────────────────────────────────

  static async cancelMeeting(meetingId: string, hostId: string | Types.ObjectId): Promise<IMeeting> {
    const meeting = await this.getMeetingById(meetingId);

    const resolvedHostId = (meeting.hostId as any)._id?.toString() ?? meeting.hostId.toString();
    if (resolvedHostId !== hostId.toString()) {
      throw makeError('Only the host can cancel the meeting', 403);
    }

    if (meeting.status === 'completed' || meeting.status === 'cancelled') {
      throw makeError(`Meeting cannot be cancelled (current status: ${meeting.status})`, 400);
    }

    meeting.status = 'cancelled';
    return meeting.save();
  }

  static async endMeeting(meetingId: string, hostId: string | Types.ObjectId): Promise<IMeeting> {
    const meeting = await this.getMeetingById(meetingId);

    const resolvedHostId = (meeting.hostId as any)._id?.toString() ?? meeting.hostId.toString();
    if (resolvedHostId !== hostId.toString()) {
      throw makeError('Only the host can end the meeting', 403);
    }

    if (meeting.status !== 'active') {
      throw makeError('Only an active meeting can be ended', 400);
    }

    meeting.status = 'completed';
    meeting.endTime = new Date();
    return meeting.save();
  }
}
