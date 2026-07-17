import type { DashboardPlan } from "@/lib/data/plan";
import { generatePlanPdfBuffer, planPdfFilename } from "@/lib/pdf/generatePlanPdfBuffer";
import { getResendClient } from "./resendClient";
import { planReadyEmailHtml } from "./templates/planReadyEmail";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export interface SendPlanEmailResult {
  sent: boolean;
  skippedReason?: string;
  error?: string;
}

/**
 * Envia o plano em PDF por e-mail automaticamente, sem exigir nenhuma ação do
 * usuário. Nunca lança: falha de e-mail não pode derrubar o fluxo de geração
 * do plano — o download direto no navegador (rota /api/pdf) continua
 * funcionando mesmo se o envio por e-mail falhar.
 */
export async function sendPlanEmail(params: {
  toEmail: string;
  plan: DashboardPlan;
  appUrl: string;
}): Promise<SendPlanEmailResult> {
  const resend = getResendClient();
  if (!resend) {
    return { sent: false, skippedReason: "RESEND_API_KEY não configurada." };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "Finance AI <onboarding@resend.dev>";

  try {
    const pdfBuffer = await generatePlanPdfBuffer(params.plan);
    const monthLabel = new Date(params.plan.referenceMonth).toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
    const dashboardUrl = `${params.appUrl.replace(/\/$/, "")}/dashboard/${params.plan.id}`;

    const html = planReadyEmailHtml({
      name: params.plan.ownerName,
      monthLabel,
      dashboardUrl,
      totalIncome: formatBRL(params.plan.totalIncome),
      totalExpense: formatBRL(params.plan.totalExpense),
      balance: formatBRL(params.plan.balance),
      healthScore: params.plan.healthScore,
    });

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [params.toEmail],
      subject: `Seu plano financeiro de ${monthLabel} está pronto`,
      html,
      attachments: [
        {
          filename: planPdfFilename(params.plan),
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      return { sent: false, error: error.message };
    }
    return { sent: true };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
