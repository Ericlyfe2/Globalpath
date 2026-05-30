import type { Request, Response, NextFunction } from "express";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const allowed = process.env.CORS_ORIGIN || "http://localhost:3000";

  const validOrigin = origin && origin === allowed;
  const validReferer = referer && referer.startsWith(allowed);

  if (!validOrigin && !validReferer) {
    return res.status(403).json({ error: "CSRF validation failed" });
  }

  next();
}
