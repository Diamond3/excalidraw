import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";

const APP_PASSWORD = process.env.APP_PASSWORD;
const COOKIE_NAME = "excalidraw-auth";

export const isAuthEnabled = () => Boolean(APP_PASSWORD);

export const expectedCookieValue = () => {
  if (!APP_PASSWORD) {
    return null;
  }
  return crypto
    .createHash("sha256")
    .update(`${APP_PASSWORD}::excalidraw-auth`)
    .digest("hex");
};

const parseCookies = (header: string | undefined) => {
  const out: Record<string, string> = {};
  if (!header) {
    return out;
  }
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) {
      continue;
    }
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    out[k] = decodeURIComponent(v);
  }
  return out;
};

export const isAuthenticated = (req: { headers: { cookie?: string } }) => {
  if (!APP_PASSWORD) {
    return true;
  }
  const cookies = parseCookies(req.headers.cookie);
  const got = cookies[COOKIE_NAME];
  const want = expectedCookieValue();
  if (!got || !want || got.length !== want.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(got), Buffer.from(want));
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (isAuthenticated(req)) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized" });
};

const sha256 = (value: string) =>
  crypto.createHash("sha256").update(value).digest();

export const passwordMatches = (candidate: string) => {
  if (!APP_PASSWORD) {
    return false;
  }
  return crypto.timingSafeEqual(sha256(candidate), sha256(APP_PASSWORD));
};

const isSecureRequest = (req: Request) => {
  if (req.secure) {
    return true;
  }
  const forwarded = req.headers["x-forwarded-proto"];
  const proto = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return proto?.split(",")[0].trim() === "https";
};

export const setAuthCookie = (req: Request, res: Response) => {
  const value = expectedCookieValue();
  if (!value) {
    return;
  }
  const oneYear = 60 * 60 * 24 * 365;
  const secure = isSecureRequest(req) ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${oneYear}${secure}`,
  );
};
