/**
 * Configuração central — lida de variáveis de ambiente.
 * No projeto real, use Zod para validação das envs.
 */
export const config = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  isDev: (process.env.NODE_ENV ?? "development") === "development",

  jwt: {
    secret: process.env.JWT_SECRET ?? "dev-secret-change-in-production",
    expiresIn: process.env.JWT_EXPIRES_IN ?? "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  },

  app: {
    name: process.env.APP_NAME ?? "Template Ouro",
    url: process.env.APP_URL ?? "http://localhost:3000",
    version: process.env.npm_package_version ?? "0.1.0",
    commit: process.env.GIT_COMMIT ?? "local",
  },

  notify: {
    evolutionBaseUrl: process.env.EVOLUTION_BASE_URL ?? "",
    evolutionApiKey: process.env.EVOLUTION_API_KEY ?? "",
    evolutionInstance: process.env.EVOLUTION_INSTANCE ?? "default",
    smtpHost: process.env.SMTP_HOST ?? "",
    smtpPort: Number(process.env.SMTP_PORT ?? 587),
    smtpUser: process.env.SMTP_USER ?? "",
    smtpPass: process.env.SMTP_PASS ?? "",
    smtpFrom: process.env.SMTP_FROM ?? "noreply@tthm.io",
    alertPhone: process.env.ALERT_PHONE ?? "",
  },
} as const;
