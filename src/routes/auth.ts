/**
 * Rotas de autenticação usando @tthm/auth.
 *
 * Troque `inMemoryUserRepo` pelo seu repositório real (Postgres, Prisma, Drizzle…).
 * O AuthService não sabe de banco — ele só chama os métodos que você injeta.
 */
import { Router, type Request, type Response } from "express";
import {
  createAuthService,
  createAuthMiddleware,
  type IUserRepository,
  type RawUserForAuth,
  type SafeUser,
} from "@tthm/auth";
import { config } from "../config.js";

// ─── Repositório em memória (exemplo — troque pelo banco real) ────────────────

const users: RawUserForAuth[] = [];

const inMemoryUserRepo: IUserRepository = {
  async findByEmail(email: string): Promise<RawUserForAuth | null> {
    return users.find((u) => u.email === email) ?? null;
  },
  async findById(id: string): Promise<SafeUser | null> {
    const u = users.find((u) => u.id === id);
    if (!u) return null;
    const { passwordHash: _ph, failedLoginAttempts: _fa, lockedUntil: _lu, lastLoginIp: _li, ...safe } = u;
    return safe as SafeUser;
  },
  async onLoginFailure(userId: string, attempts: number, lockedUntil: Date | null): Promise<void> {
    const u = users.find((u) => u.id === userId);
    if (u) {
      u.failedLoginAttempts = attempts;
      u.lockedUntil = lockedUntil;
    }
  },
  async onLoginSuccess(userId: string, ip: string | null): Promise<void> {
    const u = users.find((u) => u.id === userId);
    if (u) {
      u.failedLoginAttempts = 0;
      u.lockedUntil = null;
      u.lastLoginIp = ip;
      u.lastLoginAt = new Date();
    }
  },
};

// ─── Auth Service + Middleware ────────────────────────────────────────────────

const authService = createAuthService(
  {
    jwtSecret: config.jwt.secret,
    jwtExpiresIn: config.jwt.expiresIn,
    jwtRefreshExpiresIn: config.jwt.refreshExpiresIn,
    bcryptRounds: 10,
  },
  inMemoryUserRepo
);

const { authenticate, requireRole } = createAuthMiddleware(authService);

// ─── Seed de usuário demo (só em dev) ─────────────────────────────────────────

async function seedDemoUser(): Promise<void> {
  if (users.length > 0) return;
  const hash = await authService.hashPassword("Senha@123");
  const now = new Date();
  users.push({
    id: "usr-demo-001",
    email: "demo@tthm.io",
    name: "Demo Owner",
    role: "owner",
    status: "active",
    productScope: null,
    avatarUrl: null,
    passwordHash: hash,
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastLoginAt: null,
    lastLoginIp: null,
    createdAt: now,
    updatedAt: now,
    createdBy: null,
  });
}

seedDemoUser().catch(console.error);

// ─── Rotas ────────────────────────────────────────────────────────────────────

export const authRouter = Router();

/** POST /api/auth/login */
authRouter.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.loginUser(req.body, { ipAddress: req.ip, userAgent: req.headers["user-agent"] });
    res.json({ ok: true, ...result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    const status = (err as { statusCode?: number }).statusCode
      ?? (msg.includes("inválid") || msg.includes("Credenciais") ? 401
         : msg.includes("bloqueada") ? 423 : 400);
    res.status(status).json({ ok: false, error: msg });
  }
});

/** POST /api/auth/refresh */
authRouter.post("/refresh", async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) { res.status(400).json({ ok: false, error: "refreshToken obrigatório" }); return; }
    const tokens = await authService.refreshAccessToken(refreshToken);
    res.json({ ok: true, ...tokens });
  } catch {
    res.status(401).json({ ok: false, error: "Refresh token inválido ou expirado" });
  }
});

/** GET /api/me — protegida */
authRouter.get("/me", authenticate, (req: Request, res: Response): void => {
  res.json({ ok: true, user: req.user });
});

/** GET /api/admin — requer role master ou acima */
authRouter.get("/admin", authenticate, requireRole("master"), (_req: Request, res: Response): void => {
  res.json({ ok: true, message: "Área administrativa — acesso concedido" });
});

export { authenticate, requireRole };
