import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import ffmpeg from 'fluent-ffmpeg';
import { execSync } from 'child_process';

interface ProcessedVideoResult {
  title: string;
  transcription: string;
}

function isFFmpegInstalled(): boolean {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

export const processYouTubeVideo = async (videoURL: string): Promise<ProcessedVideoResult> => {
  if (!isFFmpegInstalled()) {
    throw new Error('FFmpeg is not installed. Please install FFmpeg to continue. You can download it from https://ffmpeg.org/download.html');
  }

  try {
    console.log('Fetching video info...');
    const videoInfo = await ytdl.getInfo(videoURL);
    const videoTitle = videoInfo.videoDetails.title;
    console.log('Video Title:', videoTitle);

    console.log('Downloading and muxing video...');
    const outputFilePath = path.resolve('temp_video.mp4');
    await downloadAndMux(videoURL, outputFilePath);

    console.log('Transcribing audio...');
    const transcription = await transcribeAudioFile(outputFilePath);
    console.log('Transcription completed');

    // Clean up the temporary file
    fs.unlinkSync(outputFilePath);
    console.log('Temporary video file deleted:', outputFilePath);

    return { title: videoTitle, transcription };
  } catch (error: any) {
    console.error('Error processing video:', error);
    throw new Error(`Error in processing video: ${error.message}`);
  }
};

const downloadAndMux = (videoURL: string, outputFilePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const video = ytdl(videoURL, { quality: 'highestvideo', filter: 'audioandvideo' });
    
    ffmpeg(video)
      .outputOptions('-c:v copy')
      .outputOptions('-c:a aac')
      .save(outputFilePath)
      .on('progress', (progress) => {
        console.log(`Processing: ${progress.percent ? progress.percent.toFixed(2) : 0}% done`);
      })
      .on('end', () => {
        console.log('Download and processing completed');
        resolve();
      })
      .on('error', (err) => {
        console.error('Error during download and processing:', err);
        reject(err);
      });
  });
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
