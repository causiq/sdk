import { NextApiRequest, NextApiResponse } from "next"

export default function logary(req: NextApiRequest, res: NextApiResponse) {
  res.status(201).json({
    error: false,
    message: ''
  })
}