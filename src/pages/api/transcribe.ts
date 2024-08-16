import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { audioUrl, userSession } = req.body;

  if (!audioUrl) {
    return res.status(400).json({ error: 'Missing audioUrl in request body' });
  }

  try {
    const input = {
      audio: audioUrl,
      batch_size: 64,
    };

    let curlCommand;
    if (userSession?.user?.user_metadata?.isAnonymous) {
      // Use a different API key or set different limits/quotas for anonymous users
      curlCommand = `curl --silent --show-error https://api.replicate.com/v1/predictions \
        --request POST \
        --header "Authorization: Bearer $REPLICATE_ANON_API_TOKEN" \
        --header "Content-Type: application/json" \
        --data @- <<-EOM
        {
          "version": "3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c",
          "input": ${JSON.stringify(input)}
        }
        EOM`;
    } else {
      curlCommand = `curl --silent --show-error https://api.replicate.com/v1/predictions \
        --request POST \
        --header "Authorization: Bearer $REPLICATE_API_TOKEN" \
        --header "Content-Type: application/json" \
        --data @- <<-EOM
        {
          "version": "3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c",
          "input": ${JSON.stringify(input)}
        }
        EOM`;
    }

    const output = await new Promise<string>((resolve, reject) => {
      exec(curlCommand, { env: process.env }, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }

        if (stderr) {
          reject(new Error(stderr));
          return;
        }

        try {
          const response = JSON.parse(stdout);
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response.output.text);
          }
        } catch (err) {
          reject(new Error(`Failed to parse JSON response: ${err}`));
        }
      });
    });

    res.status(200).json({ transcription: output });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
}