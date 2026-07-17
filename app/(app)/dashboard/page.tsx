import { redirect } from "next/navigation";

/**
 * Sem login, não há como saber "o plano mais recente do usuário" a partir
 * de uma sessão — cada plano vive no próprio link (/dashboard/[planId]),
 * recebido por e-mail ou guardado pelo navegador ao final do wizard.
 */
export default function DashboardIndexPage() {
  redirect("/wizard/passo-1-dados");
}
