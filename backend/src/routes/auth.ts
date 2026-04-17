import { Router } from "express";
import { isAuthEnabled, isAuthenticated, passwordMatches, setAuthCookie } from "../auth";

const router = Router();

router.get("/check", (req, res) => {
  if (!isAuthEnabled()) {
    return res.json({ required: false, authenticated: true });
  }
  return res.json({ required: true, authenticated: isAuthenticated(req) });
});

router.post("/login", (req, res) => {
  if (!isAuthEnabled()) {
    return res.json({ ok: true });
  }
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!passwordMatches(password)) {
    return res.status(401).json({ error: "Invalid password" });
  }
  setAuthCookie(req, res);
  return res.json({ ok: true });
});

export default router;
