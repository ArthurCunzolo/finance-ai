import type { ReactNode } from "react";
import { WizardProvider } from "@/lib/wizard/WizardContext";
import { WizardShell } from "@/components/wizard/WizardShell";

export default function WizardLayout({ children }: { children: ReactNode }) {
  return (
    <WizardProvider>
      <WizardShell>{children}</WizardShell>
    </WizardProvider>
  );
}
