import { NextApiRequest, NextApiResponse } from "next";
import requestIp from "request-ip";
import Cors from 'cors';

// Inicializamos el middleware de CORS
const cors = Cors({
  origin: 'https://resumyt.com',
  methods: ['GET', 'HEAD'],
});

// Función auxiliar para ejecutar el middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ejecutamos el middleware de CORS
  await runMiddleware(req, res, cors);

  const detectedIp =
    requestIp.getClientIp(req) ||
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    "unknown";
  res.status(200).json({ ip: detectedIp });
}