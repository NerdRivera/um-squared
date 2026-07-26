import jwt from "jsonwebtoken";
import { env } from "../config";

export interface AccessTokenPayload {
  id: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  id: string; // user id
  jti: string; // refresh token record id
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_TTL,
  } as jwt.SignOptions);
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}

export function signEmailVerificationToken(userId: string): string {
  return jwt.sign({ sub: userId, purpose: "email_verification" }, env.JWT_ACCESS_SECRET, {
    expiresIn: "1d",
  });
}

export function verifyEmailVerificationToken(token: string): string {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
    sub: string;
    purpose: string;
  };
  if (decoded.purpose !== "email_verification") {
    throw new Error("Invalid token purpose");
  }
  return decoded.sub;
}
