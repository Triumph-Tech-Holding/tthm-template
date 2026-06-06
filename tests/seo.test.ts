import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/server.js";

const app = createApp();

describe("GET /robots.txt", () => {
  it("deve retornar Content-Type text/plain", async () => {
    const res = await request(app).get("/robots.txt");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/plain");
  });

  it("deve conter User-agent e Sitemap", async () => {
    const res = await request(app).get("/robots.txt");
    expect(res.text).toContain("User-agent:");
    expect(res.text).toContain("Sitemap:");
  });

  it("deve bloquear GPTBot por padrão (allowTraining=false)", async () => {
    const res = await request(app).get("/robots.txt");
    const lines = res.text.split("\n");
    const gptBotIdx = lines.findIndex((l) => l.includes("GPTBot"));
    expect(gptBotIdx).toBeGreaterThan(-1);
    const disallowLine = lines.slice(gptBotIdx).find((l) => l.startsWith("Disallow:"));
    expect(disallowLine).toContain("/");
  });
});

describe("GET /sitemap.xml", () => {
  it("deve retornar XML válido", async () => {
    const res = await request(app).get("/sitemap.xml");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("xml");
    expect(res.text).toContain('<?xml version="1.0"');
    expect(res.text).toContain("<urlset");
  });

  it("deve conter ao menos uma <url>", async () => {
    const res = await request(app).get("/sitemap.xml");
    expect(res.text).toContain("<url>");
  });
});

describe("GET /llms.txt", () => {
  it("deve retornar texto simples", async () => {
    const res = await request(app).get("/llms.txt");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/plain");
  });

  it("deve começar com # nome do projeto", async () => {
    const res = await request(app).get("/llms.txt");
    expect(res.text.startsWith("#")).toBe(true);
  });
});
