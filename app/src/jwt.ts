import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "./config";

const accessSecret = config.jwt.accessSecret;

export function generateAccessToken(userId: number) {
  return jwt.sign({ userId: userId }, accessSecret, { expiresIn: "1h" });
}

export function verifyAccessToken(accessToken: string) {
  return jwt.verify(accessToken, accessSecret);
}
