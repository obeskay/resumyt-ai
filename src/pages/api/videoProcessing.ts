import { processYouTubeVideo } from "../../lib/videoProcessing";
import { NextApiRequest, NextApiResponse } from "next";

interface VideoProcessingRequestBody {
  videoUrl: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("Received request body:", req.body);

  let videoUrl: string | undefined;
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const requestBody = body as VideoProcessingRequestBody;
    videoUrl = requestBody.videoUrl;
  } catch (error) {
    console.error("Error parsing request body:", error);
    return res.status(400).json({ error: "Invalid request body" });
  }

  console.log("Extracted videoUrl:", videoUrl);

  if (!videoUrl) {
    return res.status(400).json({ error: "Missing videoUrl in request body" });
  }

  if (typeof videoUrl !== "string" || !videoUrl.trim()) {
    return res
      .status(400)
      .json({ error: "Invalid videoUrl: must be a non-empty string" });
  }

  console.log("Processing video:", videoUrl);
  
  try {
    const result = await processYouTubeVideo(videoUrl);
    console.log("Processing result:", result);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error in processing request:", error);
    const errorMessage = error.message || "An unexpected error occurred";
    
    let statusCode = 500;
    let errorType = "PROCESSING_ERROR";

    if (errorMessage.includes("Access to this video is forbidden")) {
      statusCode = 403;
      errorType = "ACCESS_FORBIDDEN";
    } else if (errorMessage.includes("This video is unavailable")) {
      statusCode = 404;
      errorType = "VIDEO_UNAVAILABLE";
    } else if (errorMessage.includes("Invalid YouTube URL")) {
      statusCode = 400;
      errorType = "INVALID_URL";
    } else if (errorMessage.includes("This video is private")) {
      statusCode = 403;
      errorType = "PRIVATE_VIDEO";
    } else if (errorMessage.includes("age-restricted")) {
      statusCode = 403;
      errorType = "AGE_RESTRICTED";
    } else if (errorMessage.includes("Download timed out") || errorMessage.includes("Download stalled")) {
      statusCode = 504;
      errorType = "DOWNLOAD_TIMEOUT";
    }

    // Add more detailed logging
    console.error(`Error Type: ${errorType}`);
    console.error(`Status Code: ${statusCode}`);
    console.error(`Error Details: ${errorMessage}`);

    const errorDetails = {
      error: "Failed to process video",
      type: errorType,
      details: errorMessage,
    };
    console.error("Detailed error:", errorDetails);
    res.status(statusCode).json(errorDetails);
  }
}
