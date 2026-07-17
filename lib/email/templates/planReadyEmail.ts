interface PlanReadyEmailParams {
  name: string;
  monthLabel: string;
  dashboardUrl: string;
  totalIncome: string;
  totalExpense: string;
  balance: string;
  healthScore: number;
}

/**
 * HTML de e-mail transacional: tabelas + estilos inline (não usa CSS externo
 * nem flexbox/grid) porque é o único subconjunto que renderiza de forma
 * previsível em clientes como Outlook/Gmail.
 */
export function planReadyEmailHtml(params: PlanReadyEmailParams): string {
  const { name, monthLabel, dashboardUrl, totalIncome, totalExpense, balance, healthScore } =
    params;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background-color:#08090b;font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#08090b;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#101318;border:1px solid rgba(237,238,235,0.12);border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px 0 32px;">
                <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;background-color:#2fbf83;color:#08090b;font-weight:bold;font-size:12px;border-radius:999px;">ƒ</span>
                <span style="color:#edeeeb;font-size:14px;font-weight:600;margin-left:8px;">Finance AI</span>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 0 32px;">
                <h1 style="color:#edeeeb;font-size:20px;margin:0 0 6px 0;">${name}, seu plano de ${monthLabel} está pronto</h1>
                <p style="color:#9aa0a6;font-size:13px;line-height:1.5;margin:0 0 24px 0;">
                  O PDF completo está anexado a este e-mail. Você também pode ver tudo online, com gráficos e a linha do tempo do mês.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="33%" style="border:1px solid rgba(237,238,235,0.12);border-radius:10px;padding:12px;">
                      <p style="color:#5b6167;font-size:10px;margin:0 0 4px 0;">ENTRADAS</p>
                      <p style="color:#edeeeb;font-size:14px;margin:0;font-family:monospace;">${totalIncome}</p>
                    </td>
                    <td width="12"></td>
                    <td width="33%" style="border:1px solid rgba(237,238,235,0.12);border-radius:10px;padding:12px;">
                      <p style="color:#5b6167;font-size:10px;margin:0 0 4px 0;">SAÍDAS</p>
                      <p style="color:#edeeeb;font-size:14px;margin:0;font-family:monospace;">${totalExpense}</p>
                    </td>
                    <td width="12"></td>
                    <td width="33%" style="border:1px solid rgba(237,238,235,0.12);border-radius:10px;padding:12px;">
                      <p style="color:#5b6167;font-size:10px;margin:0 0 4px 0;">SOBRA</p>
                      <p style="color:#8cf2c0;font-size:14px;margin:0;font-family:monospace;">${balance}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 0 32px;">
                <p style="color:#9aa0a6;font-size:12px;margin:0;">Health Score deste mês: <strong style="color:#c9a227;">${healthScore}/100</strong></p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 32px 32px;">
                <a href="${dashboardUrl}" style="display:inline-block;background-color:#2fbf83;color:#08090b;text-decoration:none;font-size:13px;font-weight:600;padding:12px 22px;border-radius:999px;">
                  Ver plano completo online
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 28px 32px;border-top:1px solid rgba(237,238,235,0.08);padding-top:16px;">
                <p style="color:#5b6167;font-size:11px;margin:0;">
                  Você recebeu este e-mail porque preencheu o planejamento financeiro no Finance AI.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}
