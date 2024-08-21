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
    
    let statusCode = 500;
    let errorType = "PROCESSING_ERROR";
    let errorMessage = "An unexpected error occurred";

    if (error.code) {
      switch (error.code) {
        case "FORBIDDEN_ACCESS":
        case "PRIVATE_VIDEO":
        case "AGE_RESTRICTED":
          statusCode = 403;
          errorType = error.code;
          break;
        case "VIDEO_UNAVAILABLE":
          statusCode = 404;
          errorType = error.code;
          break;
        case "INVALID_URL":
          statusCode = 400;
          errorType = error.code;
          break;
        case "DOWNLOAD_TIMEOUT":
          statusCode = 504;
          errorType = error.code;
          break;
      }
      errorMessage = error.message;
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
