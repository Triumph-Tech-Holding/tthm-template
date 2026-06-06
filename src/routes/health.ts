import { Router } from "express";
import { config } from "../config.js";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({
    ok: true,
    version: config.app.version,
    commit: config.app.commit,
    env: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});
