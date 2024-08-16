import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const convertAudioFormat = (url: string): Promise<string> => {
  const maxRetries = 3;
  const timeoutDuration = 25000; // Increase to 25 seconds for accessibility

  const fetchVideoInfo = (attempt = 1): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log(`Retrieving video information (Attempt ${attempt})...`);

      const infoFetchTimeout = setTimeout(() => {
        if (attempt < maxRetries) {
          console.warn('Timeout reached, retrying fetch...');
          return resolve(fetchVideoInfo(attempt + 1)); // Retry
        } else {
          return reject(new Error('Timeout while retrieving video information after multiple attempts.'));
        }
      }, timeoutDuration);

      ytdl.getInfo(url, { highWaterMark: 1<<25 }, (err, info) => {
        clearTimeout(infoFetchTimeout);

        if (err || !info) {
          console.error('Error retrieving video info:', err);
          if (attempt < maxRetries) {
            console.warn('Error encountered, retrying...');
            return resolve(fetchVideoInfo(attempt + 1)); // Retry
          } else {
            return reject(new Error('Unable to retrieve video info. It may be restricted or failing after multiple attempts.'));
          }
        }

        console.log('Video information retrieved for', info.videoDetails.title);
        const tempFile = path.resolve('temp_audio.mp3');
        console.log('Downloading audio stream for', info.videoDetails.title);

        const audioStream = ytdl.downloadFromInfo(info, { quality: 'highestaudio' });

        audioStream.on('response', (httpResponse) => {
          console.log('Receiving audio stream, status code:', httpResponse.statusCode);
        });

        audioStream.on('error', (err) => {
          console.error('Error during streaming audio:', err);
          reject(new Error('Failed to stream audio.'));
        });

        console.log('Starting ffmpeg conversion...');
        ffmpeg(audioStream)
          .on('start', commandLine => console.log('Spawned ffmpeg with command:', commandLine))
          .on('codecData', data => console.log('Input is', data.audio, 'with', data.video))
          .audioCodec('libmp3lame')
          .format('mp3')
          .save(tempFile)
          .on('end', () => {
            console.log('Audio conversion completed:', tempFile);
            resolve(tempFile);
          })
          .on('error', (err) => {
            console.error('Error during audio conversion:', err);
            reject(new Error(`Error processing audio: ${err.message}`));
          });
      });
    });
  };

  return fetchVideoInfo();
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    console.log('Invalid request method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { audioUrl } = req.body;

  if (!audioUrl) {
    console.log('No audio URL provided');
    return res.status(400).json({ error: 'Missing audioUrl in request body' });
  }

  const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

  try {
    console.log('Starting audio fetch and conversion process...');
    const audioPath = await convertAudioFormat(audioUrl);
    console.log('Audio successfully fetched and converted:', audioPath);

    const data = {
      version: '3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c',
      input: {
        audio: `file://${audioPath}`,
        batch_size: 64
      }
    };

    console.log('Sending request to Replicate API');
    let response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      console.error('API Request failed:', response.status);
      throw new Error(`API Request failed with status: ${response.status}`);
    }
    
    console.log('Awaiting prediction result from Replicate API...');
    let result = await response.json();
    
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      console.log('Prediction processing not complete, retrying...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      response = await fetch(result.urls.get, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${REPLICATE_API_TOKEN}`
        }
      });
      result = await response.json();
    }

    fs.unlinkSync(audioPath); // Clean up temp file
    console.log('Temporary audio file deleted:', audioPath);

    if (result.status === 'failed') {
      console.error('Prediction failed:', result);
      return res.status(500).json({ error: 'Prediction failed', details: result });
    }

    console.log('Prediction succeeded:', result.output);
    return res.status(200).json({ transcription: result.output || "No transcription available" });
  } catch (error) {
    console.error('Error in processing request:', error.message);
    res.status(500).json({ error: 'Failed to transcribe audio', details: error.message });
  }
}
