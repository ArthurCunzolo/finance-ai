import { Resend } from "resend";

let client: Resend | null = null;

/** Retorna null se RESEND_API_KEY não estiver configurada (dev sem e-mail configurado). */
export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new Resend(apiKey);
  return client;
}
