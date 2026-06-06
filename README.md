# tthm-template — Template Ouro

**Node 20+ · TypeScript ESM · Express 5 · pnpm**

Template de projeto padrão da **Triumph Tech Holding**.
Consome os 3 módulos do [`tthm-foundation-kit`](https://github.com/Triumph-Tech-Holding/tthm-foundation-kit) e nasce com auth, SEO, notificações e CI prontos.

---

## O que já vem pronto

| Módulo | Versão | O que entrega |
|---|---|---|
| `@tthm/auth` | `0.1.0` | JWT + RBAC, middleware Express, lockout, `IUserRepository` plugável |
| `@tthm/seo` | `0.1.0` | `robots.txt`, `sitemap.xml`, `llms.txt`, meta tags, JSON-LD |
| `@tthm/notify` | `0.1.0` | WhatsApp (Quanta Flow), Email SMTP, MockProvider, alertas de uptime |
| CI | — | GitHub Actions: typecheck + testes a cada push/PR |
| `tthm-status.json` | v2 | Checklist de fases (Início → MVP → Produção) |
| `scripts/auto-push.sh` | — | Push automático com mensagem de commit |

### Endpoints prontos

| Endpoint | Descrição |
|---|---|
| `GET /api/health` | Health check — ok, versão, commit |
| `POST /api/auth/login` | Login — retorna accessToken + refreshToken |
| `POST /api/auth/refresh` | Renova o accessToken |
| `GET /api/me` | Perfil do usuário autenticado (Bearer token) |
| `GET /api/admin` | Área protegida (role ≥ master) |
| `GET /robots.txt` | Controle de crawlers de IA |
| `GET /sitemap.xml` | Sitemap XML |
| `GET /llms.txt` | Discovery para agentes (llmstxt.org) |

---

## Como criar um projeto novo a partir deste template

### 1. Clonar ou usar como template

```bash
# Opção A — usar como template no GitHub
# Clique em "Use this template" no GitHub

# Opção B — clonar direto
git clone https://github.com/Triumph-Tech-Holding/tthm-template meu-projeto
cd meu-projeto
```

### 2. Instalar dependências

```bash
pnpm install
```

Os módulos `@tthm/auth`, `@tthm/seo` e `@tthm/notify` são instalados automaticamente
do repositório `tthm-foundation-kit` via dependência git do pnpm:

```json
"@tthm/auth": "github:Triumph-Tech-Holding/tthm-foundation-kit#path:packages/auth"
```

> **Método de consumo:** pnpm `github:` com seletor `#path:` — referencia o subdiretório
> do monorepo diretamente. O pnpm baixa o pacote, instala as dependências declaradas no
> `package.json` do subdiretório e usa o campo `exports` para resolver imports.
> Não requer publicação em registry — basta a dependência estar no GitHub.

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Edite .env com seus valores reais
```

Variáveis obrigatórias:

| Variável | Descrição |
|---|---|
| `JWT_SECRET` | Secret JWT forte — `openssl rand -hex 64` |
| `APP_URL` | URL pública do app (ex: `https://meuapp.com`) |
| `APP_NAME` | Nome do projeto |

Variáveis opcionais (notificações):

| Variável | Descrição |
|---|---|
| `EVOLUTION_BASE_URL` | URL base da Evolution API (Quanta Flow / WhatsApp) |
| `EVOLUTION_API_KEY` | API Key da Evolution API |
| `EVOLUTION_INSTANCE` | Nome da instância (padrão: `default`) |
| `SMTP_HOST` | Host SMTP para email de fallback |
| `SMTP_PORT` | Porta SMTP (padrão: 587) |
| `SMTP_USER` / `SMTP_PASS` | Credenciais SMTP |
| `ALERT_PHONE` | Número para alertas de uptime (`+5511999999999`) |

### 4. Iniciar em desenvolvimento

```bash
pnpm dev
# → http://localhost:3000
```

### 5. Verificar

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/robots.txt
curl http://localhost:3000/sitemap.xml
```

---

## Onde plugar o banco real

O `inMemoryUserRepo` em `src/routes/auth.ts` implementa a interface `IUserRepository`:

```typescript
export interface IUserRepository {
  findByEmail(email: string): Promise<RawUserForAuth | null>;
  findById(id: string): Promise<SafeUser | null>;
  onLoginFailure(userId: string, attempts: number, lockedUntil: Date | null): Promise<void>;
  onLoginSuccess(userId: string, ip: string | null): Promise<void>;
  writeAuditLog?(params: AuditLogParams): Promise<void>; // opcional
}
```

**Para trocar pelo banco real:**

```typescript
// src/repositories/userRepository.ts (Prisma/Drizzle/etc.)
import type { IUserRepository } from "@tthm/auth";

export const userRepository: IUserRepository = {
  async findByEmail(email) {
    return db.user.findUnique({ where: { email } });
  },
  // ... outros métodos
};

// src/routes/auth.ts — substitua inMemoryUserRepo por userRepository
import { userRepository } from "../repositories/userRepository.js";
```

---

## Adicionar novos provedores de notificação

```typescript
// src/providers/slackProvider.ts
import type { INotificationProvider } from "@tthm/notify";

export function SlackProvider(webhookUrl: string): INotificationProvider {
  return {
    name: "SlackProvider",
    channel: "webhook",
    async send(msg) {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: msg.text }),
      });
      return { ok: res.ok, channel: "webhook", provider: "SlackProvider" };
    },
  };
}
```

---

## CI / CD

O CI (`.github/workflows/ci.yml`) roda a cada push e PR:

1. `pnpm install` — instala todas as deps incluindo os módulos `@tthm/*`
2. `pnpm typecheck` — TypeScript strict, zero erros obrigatório
3. `pnpm test` — vitest, merge bloqueado se falhar

---

## Stack

- **Runtime**: Node 20+ (ESM nativo)
- **Framework**: Express 5
- **Language**: TypeScript 5.x (ESM, NodeNext, strict)
- **Package manager**: pnpm 9+
- **Tests**: Vitest 2.x + Supertest
- **CI**: GitHub Actions

---

## Licença

MIT © Triumph Tech Holding
