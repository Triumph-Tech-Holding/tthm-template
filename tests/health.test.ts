import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/server.js";

const app = createApp();

describe("GET /api/health", () => {
  it("deve retornar ok: true", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("deve incluir version e timestamp", async () => {
    const res = await request(app).get("/api/health");
    expect(res.body.version).toBeDefined();
    expect(res.body.timestamp).toBeDefined();
  });

  it("deve ter timestamp no formato ISO", async () => {
    const res = await request(app).get("/api/health");
    expect(() => new Date(res.body.timestamp as string)).not.toThrow();
  });
});
