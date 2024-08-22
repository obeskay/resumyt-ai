import { NextApiRequest, NextApiResponse } from "next";
import requestIp from "request-ip";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const detectedIp =
    requestIp.getClientIp(req) ||
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    "unknown";
  res.status(200).json({ ip: detectedIp });
}
