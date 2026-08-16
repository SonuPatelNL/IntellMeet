import { RecordingService } from './recording.service';
import Meeting from './meeting.model';
import Recording from './recording.model';
import { storageService } from '../../storage/storage.service';

jest.mock('./meeting.model', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

jest.mock('./recording.model', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.mock('../../storage/storage.service', () => ({
  storageService: {
    upload: jest.fn(),
    getSignedUrl: jest.fn(),
  },
}));

describe('RecordingService', () => {
  const mockedMeeting = Meeting as unknown as { findById: jest.Mock };
  const mockedRecording = Recording as unknown as { findOne: jest.Mock; create: jest.Mock; findById: jest.Mock };
  const mockedStorage = storageService as unknown as { upload: jest.Mock; getSignedUrl: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts a recording for the host of an active meeting', async () => {
    mockedMeeting.findById.mockResolvedValue({
      _id: 'meeting-1',
      hostId: 'host-1',
      attendees: ['host-1'],
      status: 'active',
    });
    mockedRecording.findOne.mockResolvedValue(null);
    mockedRecording.create.mockResolvedValue({
      _id: 'recording-1',
      meetingId: 'meeting-1',
      status: 'recording',
      startedAt: new Date(),
    });

    const recording = await RecordingService.startRecording('meeting-1', 'host-1');

    expect(recording.status).toBe('recording');
    expect(mockedRecording.create).toHaveBeenCalled();
  });

  it('stores a recording and returns a signed playback URL for an authorized attendee', async () => {
    mockedMeeting.findById.mockResolvedValue({
      _id: 'meeting-1',
      hostId: 'host-1',
      attendees: ['host-1', 'attendee-1'],
      status: 'completed',
      save: jest.fn(),
    });
    mockedRecording.findOne.mockResolvedValue({
      _id: 'recording-1',
      meetingId: 'meeting-1',
      status: 'processing',
      save: jest.fn().mockResolvedValue({}),
    });
    mockedStorage.upload.mockResolvedValue({ url: 'https://cdn.example.com/recording.mp4', key: 'recordings/meeting-1.mp4' });
    mockedStorage.getSignedUrl.mockResolvedValue('https://signed.example.com/recording.mp4');

    const playback = await RecordingService.storeRecording('meeting-1', 'host-1', Buffer.from('video'), 'meeting-1.mp4', 'video/mp4');

    expect(playback.signedUrl).toBe('https://signed.example.com/recording.mp4');
    expect(mockedStorage.upload).toHaveBeenCalled();
  });
});
