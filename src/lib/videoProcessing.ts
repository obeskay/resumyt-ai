import ytGet from 'yt-get';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

interface ProcessedVideoResult {
  title: string;
  transcription: string;
}

export const processYouTubeVideo = async (videoURL: string): Promise<ProcessedVideoResult> => {
  const maxRetries = 3;
  let retryCount = 0;

  const fetchVideoTitle = async (url: string): Promise<string> => {
    while (retryCount < maxRetries) {
      try {
        console.log('Fetching video title...');
        const videoTitle = await ytGet.getVideoTitle(url);
        console.log('Video Title:', videoTitle);
        return videoTitle;
      } catch (error) {
        console.error(`Error fetching video title (attempt ${retryCount + 1}):`, error);
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
      }
    }
    throw new Error('Failed to fetch video title after multiple attempts');
  };

  const downloadAudio = async (url: string): Promise<{ base64: string, title: string }> => {
    retryCount = 0; // Reset retry count
    while (retryCount < maxRetries) {
      try {
        console.log('Downloading audio in MP3 format...');
        const { base64, title } = await ytGet.getVideoMP3Base64(url);
        console.log('Downloaded MP3 for:', title);
        return { base64, title };
      } catch (error) {
        if (error.statusCode === 403) {
          console.error('Forbidden error: The server blocked the request. This video may not be available for download.');
          throw new Error('Forbidden error: The server blocked the request. This video may not be available for download.');
        } else {
          console.error(`Error downloading audio (attempt ${retryCount + 1}):`, error);
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
        }
      }
    }
    throw new Error('Failed to download audio after multiple attempts');
  };

  try {
    const videoTitle = await fetchVideoTitle(videoURL);
    const { base64: audioBase64, title } = await downloadAudio(videoURL);

    const audioFilePath = await convertBase64ToFile(audioBase64);
    console.log('File saved:', audioFilePath);

    const transcription = await transcribeAudioFile(audioFilePath);
    console.log('Transcription completed');

    // Clean up the temporary file
    fs.unlinkSync(audioFilePath);
    console.log('Temporary audio file deleted:', audioFilePath);

    return { title: videoTitle, transcription };
  } catch (error: any) {
    console.error('Error processing video:', error);
    throw new Error(`Error in processing video: ${error.message}`);
  }
};

const convertBase64ToFile = async (base64: string): Promise<string> => {
  const filePath = path.resolve('temp_audio.mp3');
  const fileData = Buffer.from(base64, 'base64');
  fs.writeFileSync(filePath, fileData);
  return filePath;
};

const transcribeAudioFile = async (filePath: string): Promise<string> => {
  const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

  const data = {
    version: '3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c',
    input: {
      audio: `file://${filePath}`,
      batch_size: 64
    }
  };

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`API Request failed with status: ${response.status}`);
  }

  let result:any = await response.json();

  while (result.status !== 'succeeded' && result.status !== 'failed') {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const statusResponse = await fetch(result.urls.get, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`
      }
    });
    result = await statusResponse.json();
  }

  if (result.status === 'failed') {
    throw new Error('Transcription failed');
  }

  return result.output || "No transcription available";
};
