import fs from "fs";
import path from "path";
import os from "os";
import fetch from "node-fetch";
import ytdl from "ytdl-core";

class YTDLErrorHandler {
  private error: Error;

  constructor(error: Error) {
    this.error = error;
  }

  getError(): { message: string; code: string } {
    if (this.error.message.includes("Status code: 403")) {
      return {
        message: "Access to this video is forbidden. This could be due to regional restrictions, age restrictions, or the video being private. If you're outside of China, try using a VPN with a Chinese server.",
        code: "FORBIDDEN_ACCESS"
      };
    } else if (this.error.message.includes("Video unavailable")) {
      return {
        message: "This video is unavailable. It may have been removed or set to private by the owner.",
        code: "VIDEO_UNAVAILABLE"
      };
    } else if (this.error.message.includes("Video is private")) {
      return {
        message: "This video is private and cannot be accessed. Please try a different video.",
        code: "PRIVATE_VIDEO"
      };
    } else if (this.error.message.includes("Sign in to confirm your age")) {
      return {
        message: "This video is age-restricted and requires sign-in. Please try a different video.",
        code: "AGE_RESTRICTED"
      };
    } else {
      return {
        message: `Error downloading audio: ${this.error.message}. Please try again or use a different video.`,
        code: "UNKNOWN_ERROR"
      };
    }
  }
}

interface ProcessedVideoResult {
  title: string;
  transcription: string;
}

export const processYouTubeVideo = async (
  videoURL: string
): Promise<ProcessedVideoResult> => {
  let outputFilePath: string | null = null;
  try {
    console.log("Fetching video info...");
    const videoId = extractVideoId(videoURL);
    console.log("Extracted video ID:", videoId);
    const videoTitle = await getVideoTitle(videoId);
    console.log("Video Title:", videoTitle);

    console.log("Downloading audio...");
    outputFilePath = path.join(os.tmpdir(), `temp_audio_${Date.now()}.mp3`);
    console.log("Output file path:", outputFilePath);
    await downloadAudio(videoId, outputFilePath);

    console.log("Transcribing audio...");
    const transcription = await transcribeAudioFile(outputFilePath);
    console.log("Transcription completed");

    return { title: videoTitle, transcription };
  } catch (error: any) {
    console.error("Error processing video:", error);
    throw error; // Propagate the original error
  } finally {
    // Clean up the temporary file
    if (outputFilePath && fs.existsSync(outputFilePath)) {
      try {
        fs.unlinkSync(outputFilePath);
        console.log("Temporary audio file deleted:", outputFilePath);
      } catch (unlinkError) {
        console.error("Error deleting temporary file:", unlinkError);
      }
    }
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

const downloadAudio = async (
  videoId: string,
  outputFilePath: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    let startTime = Date.now();
    let timeout = setTimeout(() => {
      stream.destroy();
      reject(new Error("Download timed out after 2 minutes"));
    }, 2 * 60 * 1000); // 2 minutes timeout

    const stream = ytdl(videoUrl, {
      quality: 'highestaudio',
      filter: 'audioonly',
    });

    let lastProgressTime = Date.now();

    stream.on('progress', (chunkLength, downloaded, total) => {
      const percent = (downloaded / total * 100).toFixed(2);
      const downloadedMinutes = (Date.now() - startTime) / 1000 / 60;
      const estimatedDownloadTime = (downloadedMinutes / (downloaded / total) - downloadedMinutes).toFixed(2);
      
      console.log(`Downloaded ${percent}% (${(downloaded / 1024 / 1024).toFixed(2)}MB) of ${(total / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Estimated download time: ${estimatedDownloadTime} minutes`);

      lastProgressTime = Date.now();
    });

    const checkProgress = setInterval(() => {
      if (Date.now() - lastProgressTime > 30000) { // No progress for 30 seconds
        clearInterval(checkProgress);
        clearTimeout(timeout);
        stream.destroy();
        reject(new Error("Download stalled"));
      }
    }, 5000);

    stream.pipe(fs.createWriteStream(outputFilePath))
      .on("finish", () => {
        clearTimeout(timeout);
        clearInterval(checkProgress);
        console.log("Audio download completed");
        resolve();
      })
      .on("error", (err: Error) => {
        clearTimeout(timeout);
        clearInterval(checkProgress);
        console.error("Error during audio download:", err);
        reject(err);
      });

    stream.on("error", (err: Error) => {
      clearTimeout(timeout);
      clearInterval(checkProgress);
      console.error("Error in ytdl stream:", err);
      console.error("Detailed error message:", err.message);
      console.error("Error in ytdl stream. Full error object:", JSON.stringify(err, null, 2));
      
      const errorHandler = new YTDLErrorHandler(err);
      const { message, code } = errorHandler.getError();
      
      console.error(message);
      reject({ message, code });
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
