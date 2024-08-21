import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import ytdl from "ytdl-core";

interface ProcessedVideoResult {
  title: string;
  transcription: string;
}

export const processYouTubeVideo = async (
  videoURL: string
): Promise<ProcessedVideoResult> => {
  try {
    console.log("Fetching video info...");
    const videoId = extractVideoId(videoURL);
    const videoTitle = await getVideoTitle(videoId);
    console.log("Video Title:", videoTitle);

    console.log("Downloading audio...");
    const outputFilePath = path.resolve("temp_audio.mp3");
    await downloadAudio(videoId, outputFilePath);

    console.log("Transcribing audio...");
    const transcription = await transcribeAudioFile(outputFilePath);
    console.log("Transcription completed");

    // Clean up the temporary file
    fs.unlinkSync(outputFilePath);
    console.log("Temporary audio file deleted:", outputFilePath);

    return { title: videoTitle, transcription };
  } catch (error: any) {
    console.error("Error processing video:", error);
    throw new Error(`Error in processing video: ${error.message}`);
  }
};

const extractVideoId = (url: string): string => {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/;
  const match = url.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  throw new Error("Invalid YouTube URL");
};

const getVideoTitle = async (videoId: string): Promise<string> => {
  const response = await fetch(
    `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
  );
  const data: any = await response.json();
  return data.title || "Unknown Title";
};

const downloadAudio = (
  videoId: string,
  outputFilePath: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    let startTime = Date.now();
    let timeout = setTimeout(() => {
      reject(new Error("Download timed out after 5 minutes"));
    }, 5 * 60 * 1000); // 5 minutes timeout

    const stream = ytdl(videoUrl, {
      quality: 'highestaudio',
      filter: 'audioonly',
    });

    stream.on('progress', (chunkLength, downloaded, total) => {
      const percent = (downloaded / total * 100).toFixed(2);
      const downloadedMinutes = (Date.now() - startTime) / 1000 / 60;
      const estimatedDownloadTime = (downloadedMinutes / (downloaded / total) - downloadedMinutes).toFixed(2);
      
      console.log(`Downloaded ${percent}% (${(downloaded / 1024 / 1024).toFixed(2)}MB) of ${(total / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Estimated download time: ${estimatedDownloadTime} minutes`);
    });

    stream.pipe(fs.createWriteStream(outputFilePath))
      .on("finish", () => {
        clearTimeout(timeout);
        console.log("Audio download completed");
        resolve();
      })
      .on("error", (err: Error) => {
        clearTimeout(timeout);
        console.error("Error during audio download:", err);
        reject(err);
      });
  });
};

const transcribeAudioFile = async (filePath: string): Promise<string> => {
  const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

  const data = {
    version: "3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c",
    input: {
      audio: `file://${filePath}`,
      batch_size: 64,
    },
  };

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`API Request failed with status: ${response.status}`);
  }

  let result: any = await response.json();

  while (result.status !== "succeeded" && result.status !== "failed") {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const statusResponse = await fetch(result.urls.get, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
      },
    });
    result = await statusResponse.json();
  }

  if (result.status === "failed") {
    throw new Error("Transcription failed");
  }

  return result.output || "No transcription available";
};
