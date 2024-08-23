import { NextRequest } from 'next/server';
import { POST } from '../src/app/api/videoProcessing/route';
import { getOrCreateAnonymousUser } from '@/lib/supabase';
import { processVideo } from '@/lib/videoProcessing';

jest.mock('@/lib/supabase');
jest.mock('@/lib/videoProcessing');
jest.mock('@/lib/rateLimit', () => ({
  rateLimit: jest.fn().mockResolvedValue(false),
}));

describe('Video Processing API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRequest = (body: any) => {
    return {
      json: jest.fn().mockResolvedValue(body),
      ip: '127.0.0.1',
      headers: {
        get: jest.fn().mockReturnValue('127.0.0.1'),
      },
    } as unknown as NextRequest;
  };

  test('should process video and return summary and transcript', async () => {
    const mockUser = { id: 'test-user-id', transcriptions_used: 0 };
    const mockVideoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const mockVideoId = 'dQw4w9WgXcQ';
    const mockTranscript = 'Test transcript';
    const mockSummary = 'Test summary';

    (getOrCreateAnonymousUser as jest.Mock).mockResolvedValue(mockUser);
    (processVideo as jest.Mock).mockResolvedValue({ videoId: mockVideoId, transcript: mockTranscript, summary: mockSummary });

    const request = mockRequest({ videoUrl: mockVideoUrl });
    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody).toEqual({ summary: mockSummary, transcript: mockTranscript });
  });

  test('should return error when videoUrl is missing', async () => {
    const request = mockRequest({});
    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody).toEqual({ error: 'Missing videoUrl' });
  });

  test('should return error when user quota is exceeded', async () => {
    const mockUser = { id: 'test-user-id', transcriptions_used: 3 };
    const mockVideoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    (getOrCreateAnonymousUser as jest.Mock).mockResolvedValue(mockUser);

    const request = mockRequest({ videoUrl: mockVideoUrl });
    const response = await POST(request);
    const responseBody = await response.json();

    expect(response.status).toBe(403);
    expect(responseBody).toEqual({ error: 'User quota exceeded' });
  });
});