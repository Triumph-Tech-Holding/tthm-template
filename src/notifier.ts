/**
 * Configuração do notifier — primário QuantaFlow (WhatsApp), fallback Email.
 * Usa MockProvider quando as envs de produção não estão configuradas.
 *
 * Credenciais NUNCA hardcoded — todas via Secrets do projeto.
 */
import {
  createNotifier,
  QuantaFlowProvider,
  EmailProvider,
  MockProvider,
  formatAlertaUptime,
  formatAlertaSistema,
  type Notifier,
  type AlertaUptimeInput,
} from "@tthm/notify";
import { config } from "./config.js";

function buildNotifier(): Notifier {
  const hasPrimary = Boolean(config.notify.evolutionBaseUrl && config.notify.evolutionApiKey);
  const hasFallback = Boolean(config.notify.smtpHost && config.notify.smtpUser);

  if (!hasPrimary) {
    console.warn("[notify] EVOLUTION_BASE_URL/API_KEY não configuradas → usando MockProvider");
    return createNotifier({ primary: MockProvider() });
  }

  const primary = QuantaFlowProvider({
    baseUrl: config.notify.evolutionBaseUrl,
    apiKey: config.notify.evolutionApiKey,
    instance: config.notify.evolutionInstance,
  });

  if (!hasFallback) {
    return createNotifier({ primary });
  }

  const fallback = EmailProvider({
    host: config.notify.smtpHost,
    port: config.notify.smtpPort,
    secure: config.notify.smtpPort === 465,
    auth: { user: config.notify.smtpUser, pass: config.notify.smtpPass },
    from: config.notify.smtpFrom,
  });

  return createNotifier({ primary, fallback });
}

export const notifier = buildNotifier();

/** Dispara alerta de uptime para o número configurado em ALERT_PHONE */
export async function alertaUptime(input: AlertaUptimeInput): Promise<void> {
  if (!config.notify.alertPhone) return;
  const msg = formatAlertaUptime(input);
  const result = await notifier.notify({ ...msg, to: config.notify.alertPhone });
  if (!result.ok) {
    console.error("[notify] Falha ao enviar alerta de uptime:", result.error);
  }
}

/** Dispara alerta de sistema (deploy, erro, evento) */
export async function alertaSistema(params: {
  tipo: "deploy" | "erro" | "evento";
  mensagem: string;
}): Promise<void> {
  if (!config.notify.alertPhone) return;
  const msg = formatAlertaSistema({
    ...params,
    projeto: config.app.name,
  });
  await notifier.notify({ ...msg, to: config.notify.alertPhone });
}
