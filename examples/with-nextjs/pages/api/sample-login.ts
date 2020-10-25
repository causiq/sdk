import { setCookie } from "logary/dist/esm/utils/cookies";
import { CookieName } from "logary";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * This sample login shows how you can set a cookie on the response to make Logary
 * properly identify your own users (rather than just using its own user id generator)
 */
export default function sampleLogin(req: NextApiRequest, res: NextApiResponse) {
  setCookie({ res }, CookieName, "user-123456789")
}