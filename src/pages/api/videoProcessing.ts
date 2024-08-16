import fetch from 'node-fetch';
import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const convertAudioFormat = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const tempFile = path.resolve('temp_audio.mp3');
    const stream = ytdl(url, { filter: 'audioonly' });
    const tempOggFile = path.resolve('temp_audio.ogg');

    stream.pipe(fs.createWriteStream(tempOggFile)).on('finish', () => {
      exec(`sox ${tempOggFile} ${tempFile}`, (err) => {
        if (err) {
          reject(err);
        } else {
          fs.unlinkSync(tempOggFile); // Clean up OGG file
          resolve(tempFile);
        }
      });
    }).on('error', (err) => reject(err));
  });
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { audioUrl } = req.body;

  if (!audioUrl) {
    return res.status(400).json({ error: 'Missing audioUrl in request body' });
  }

  const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

  try {
    const audioPath = await convertAudioFormat(audioUrl);

    const data = {
      version: '3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c',
      input: {
        audio: `file://${audioPath}`,
        batch_size: 64
      }
    };

    let response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    let result = await response.json();

    while (result.status !== 'succeeded' && result.status !== 'failed') {
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

    if (result.status === 'failed') {
      return res.status(500).json({ error: 'Prediction failed', details: result });
    }

    res.status(200).json({ transcription: result.output || "No transcription available" });
  } catch (error) {
    console.error('Error in processing request:', error);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
}
