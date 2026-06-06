/**
 * Template Ouro — Triumph Tech Holding
 * Node 20+ · TypeScript ESM · Express 5 · pnpm
 *
 * Consome: @tthm/auth · @tthm/seo · @tthm/notify
 */
import express from "express";
import { config } from "./config.js";
import { healthRouter } from "./routes/health.js";
import { authRouter } from "./routes/auth.js";
import { seoRouter } from "./routes/seo.js";

export function createApp() {
  const app = express();

  // ─── Middlewares globais ─────────────────────────────────────────────────────
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // CORS básico (configure por ambiente)
  app.use((_req, res, next) => {
    res.setHeader("X-Powered-By", "Triumph Tech Holding");
    next();
  });

  // ─── SEO (raiz — antes da api) ───────────────────────────────────────────────
  app.use("/", seoRouter);

  // ─── API ──────────────────────────────────────────────────────────────────────
  app.use("/api", healthRouter);
  app.use("/api/auth", authRouter);

  // ─── 404 ──────────────────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ ok: false, error: "Rota não encontrada" });
  });

  // ─── Error handler ────────────────────────────────────────────────────────────
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("[error]", err);
    res.status(500).json({ ok: false, error: config.isDev ? err.message : "Erro interno" });
  });

  return app;
}

// ─── Entrypoint ───────────────────────────────────────────────────────────────
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`[${config.app.name}] 🚀 http://localhost:${config.port}`);
    console.log(`  env: ${config.nodeEnv}  version: ${config.app.version}`);
  });
}
