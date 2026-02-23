import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  return res.status(200).json({
    version: "1.0.0",
    name: "Shield AI",
    build: process.env.BUILD_ID || "development",
    environment: process.env.NODE_ENV,
  });
}