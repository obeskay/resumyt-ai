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
    const videoInfo = await ytdl.getInfo(videoURL);
    const videoTitle = videoInfo.videoDetails.title;
    console.log("Video Title:", videoTitle);

    console.log("Downloading audio...");
    const outputFilePath = path.resolve("temp_audio.mp3");
    await downloadAudio(videoURL, outputFilePath);

    console.log("Transcribing audio...");
    const transcription = await transcribeAudioFile(outputFilePath);
    console.log("Transcription completed");

    // Clean up the temporary file
    fs.unlinkSync(outputFilePath);
    console.log("Temporary audio file deleted:", outputFilePath);

    return { title: videoTitle, transcription };
  } catch (error: any) {
    console.error("Error processing video:", error);
    if (error.statusCode === 403) {
      throw new Error(`Access to the video is forbidden. This could be due to age restrictions or the video being private.`);
    } else {
      throw new Error(`Error in processing video: ${error.message}`);
    }
  }
};


const downloadAudio = (
  videoURL: string,
  outputFilePath: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const stream = ytdl(videoURL, { quality: 'highestaudio' });
    const fileStream = fs.createWriteStream(outputFilePath);

    stream.pipe(fileStream);

    fileStream.on("finish", () => {
      console.log("Audio download completed");
      resolve();
    });

    stream.on("error", (err) => {
      console.error("Error during audio download:", err);
      reject(err);
    });

    fileStream.on("error", (err) => {
      console.error("Error writing audio file:", err);
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
