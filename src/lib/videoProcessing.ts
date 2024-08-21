import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

interface ProcessedVideoResult {
  title: string;
  transcription: string;
}

export const processYouTubeVideo = async (videoURL: string): Promise<ProcessedVideoResult> => {
  try {
    console.log('Fetching video info...');
    const videoInfo = await ytdl.getInfo(videoURL);
    const videoTitle = videoInfo.videoDetails.title;
    console.log('Video Title:', videoTitle);

    console.log('Downloading audio...');
    const audioFilePath = path.resolve('temp_audio.mp3');
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Audio download timed out after 5 minutes'));
      }, 5 * 60 * 1000); // 5 minutes timeout

      const stream = ytdl(videoURL, { filter: 'audioonly' })
        .pipe(fs.createWriteStream(audioFilePath));

      let downloadedBytes = 0;
      stream.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        console.log(`Downloaded ${(downloadedBytes / 1024 / 1024).toFixed(2)} MB`);
      });

      stream.on('finish', () => {
        clearTimeout(timeout);
        console.log('Audio download completed');
        resolve();
      });

      stream.on('error', (error) => {
        clearTimeout(timeout);
        console.error('Error downloading audio:', error);
        reject(error);
      });
    });

    console.log('Transcribing audio...');
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
