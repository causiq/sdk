import { NextApiRequest, NextApiResponse } from "next"

export default function logary(_: NextApiRequest, res: NextApiResponse) {
  res.status(201).json({
    error: false,
    message: ''
  })
}