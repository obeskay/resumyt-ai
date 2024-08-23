import { processVideo, transcribeVideo, generateSummary } from '../src/lib/videoProcessing';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js');
jest.mock('openai');

describe('Video Processing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('processVideo should handle a valid YouTube URL', async () => {
    const mockVideoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const mockUserId = 'test-user-id';
    const mockTranscript = 'Test transcript';
    const mockSummary = 'Test summary';

    (createClient as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        upsert: jest.fn().mockResolvedValue({ error: null }),
      }),
    });

    const result = await processVideo(mockVideoUrl, mockUserId);

    expect(result).toEqual({
      videoId: 'dQw4w9WgXcQ',
      transcript: expect.any(String),
      summary: expect.any(String),
    });
  });

  test('transcribeVideo should return a transcript', async () => {
    const mockVideoId = 'dQw4w9WgXcQ';
    const result = await transcribeVideo(mockVideoId);
    expect(result).toContain(mockVideoId);
  });

  test('generateSummary should return a summary', async () => {
    const mockTranscript = 'This is a test transcript';
    const result = await generateSummary(mockTranscript);
    expect(result).toBeTruthy();
  });

  test('processVideo should throw an error for an invalid YouTube URL', async () => {
    const mockVideoUrl = 'https://www.example.com';
    const mockUserId = 'test-user-id';

    await expect(processVideo(mockVideoUrl, mockUserId)).rejects.toThrow('Invalid YouTube URL');
  });
});