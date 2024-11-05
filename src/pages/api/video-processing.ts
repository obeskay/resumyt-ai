import { NextApiRequest, NextApiResponse } from "next";
import { getVideoDetails } from "@/lib/videoProcessing";

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { videoUrl } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: "Video URL is required" });
    }

    const details = await getVideoDetails(videoUrl);
    return res.status(200).json(details);
  } catch (error) {
    console.error("Error processing video:", error);
    return res
      .status(500)
      .json({ error: "Failed to process video", details: error });
  }
}
