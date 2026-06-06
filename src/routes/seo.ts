/**
 * Rotas SEO usando @tthm/seo.
 * Serve robots.txt, sitemap.xml e llms.txt prontos.
 * Personalize as entradas do sitemap e o conteúdo do llms.txt para cada projeto.
 */
import { Router } from "express";
import {
  buildRobots,
  buildSitemap,
  buildLlmsTxt,
  buildHeadMeta,
  buildOrganizationSchema,
  buildWebsiteSchema,
  jsonLdScript,
} from "@tthm/seo";
import { config } from "../config.js";

export const seoRouter = Router();

/** GET /robots.txt — controle explícito de crawlers de busca-IA e treino-IA */
seoRouter.get("/robots.txt", (_req, res) => {
  const robots = buildRobots({
    host: new URL(config.app.url).hostname,
    sitemapUrl: `${config.app.url}/sitemap.xml`,
    allowSearch: true,    // OAI-SearchBot, PerplexityBot, Claude-SearchBot: Allow /
    allowTraining: false, // GPTBot, ClaudeBot, Google-Extended, CCBot: Disallow /
    disallow: ["/api/", "/admin/", "/.env"],
  });
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send(robots);
});

/** GET /sitemap.xml */
seoRouter.get("/sitemap.xml", (_req, res) => {
  const sitemap = buildSitemap([
    {
      loc: `${config.app.url}/`,
      changefreq: "weekly",
      priority: 1.0,
      lastmod: new Date().toISOString().split("T")[0],
    },
    {
      loc: `${config.app.url}/sobre`,
      changefreq: "monthly",
      priority: 0.7,
    },
    {
      loc: `${config.app.url}/contato`,
      changefreq: "monthly",
      priority: 0.5,
    },
  ]);
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.send(sitemap);
});

/** GET /llms.txt — discovery para agentes de IA (llmstxt.org) */
seoRouter.get("/llms.txt", (_req, res) => {
  const llms = buildLlmsTxt({
    name: config.app.name,
    summary: "Plataforma da Triumph Tech Holding. Built with tthm-foundation-kit.",
    sections: [
      {
        title: "API Pública",
        links: [
          { label: "Health Check", url: `${config.app.url}/api/health` },
          { label: "Sitemap", url: `${config.app.url}/sitemap.xml` },
        ],
      },
      {
        title: "Foundation Kit",
        links: [
          { label: "GitHub — tthm-foundation-kit", url: "https://github.com/Triumph-Tech-Holding/tthm-foundation-kit" },
          { label: "Template Ouro", url: "https://github.com/Triumph-Tech-Holding/tthm-template" },
        ],
      },
    ],
  });
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send(llms);
});

/** Helper: meta + JSON-LD para a home (use no seu servidor de views/SSR) */
export function buildHomeHead() {
  const meta = buildHeadMeta({
    title: `${config.app.name} — Triumph Tech Holding`,
    description: "Plataforma premium da Triumph Tech Holding.",
    canonicalUrl: config.app.url,
    siteName: "Triumph Tech Holding",
    ogType: "website",
  });

  const orgSchema = buildOrganizationSchema({
    name: "Triumph Tech Holding",
    url: config.app.url,
    logo: `${config.app.url}/logo.png`,
    sameAs: ["https://github.com/Triumph-Tech-Holding"],
  });

  const websiteSchema = buildWebsiteSchema({
    name: config.app.name,
    url: config.app.url,
  });

  return {
    meta,
    jsonLd: [jsonLdScript(orgSchema), jsonLdScript(websiteSchema)],
  };
}
