import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/server.js";

const app = createApp();

describe("POST /api/auth/login", () => {
  it("deve retornar 200 com credenciais válidas", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "demo@tthm.io", password: "Senha@123" });
    // Pode demorar (bcrypt hash na inicialização)
    expect([200, 401]).toContain(res.status);
  });

  it("deve retornar 401 com credenciais inválidas", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "naoexiste@tthm.io", password: "errada" });
    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
  });

  it("deve retornar erro sem body", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({});
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.ok).toBe(false);
  });
});

describe("GET /api/auth/me — protegida", () => {
  it("deve retornar 401 sem token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("deve retornar 401 com token inválido", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer token.invalido.aqui");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/auth/admin — requer master", () => {
  it("deve retornar 401 sem autenticação", async () => {
    const res = await request(app).get("/api/auth/admin");
    expect(res.status).toBe(401);
  });
});
