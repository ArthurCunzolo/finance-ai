import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ComputedPlan } from "@/lib/types/plan";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    color: "#111315",
    fontSize: 10,
    fontFamily: "Helvetica",
    padding: 40,
  },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  brand: { fontSize: 12, fontWeight: 700, color: "#2fbf83" },
  brandMuted: { fontSize: 9, color: "#6b7280" },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 2 },
  subtitle: { fontSize: 11, color: "#6b7280", marginBottom: 24 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginTop: 22,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 4,
  },
  cardsRow: { flexDirection: "row", gap: 10, marginBottom: 4 },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    padding: 10,
  },
  cardLabel: { fontSize: 8, color: "#6b7280", marginBottom: 3 },
  cardValue: { fontSize: 13, fontWeight: 700 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f2f4",
    paddingVertical: 5,
  },
  rowLeft: { flexDirection: "row", gap: 8, alignItems: "center" },
  rowDate: { fontSize: 8, color: "#9ca3af", width: 30 },
  rowName: { fontSize: 9.5 },
  rowAmount: { fontSize: 9.5, fontWeight: 700 },
  rowStatus: { fontSize: 8, color: "#6b7280", width: 60, textAlign: "right" },
  insightBox: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
    fontSize: 9.5,
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#9ca3af",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
});

function statusLabel(status: string): string {
  switch (status) {
    case "PAGO":
      return "Pago";
    case "RECEBIDO":
      return "Recebido";
    case "ADIADA":
      return "Adiada";
    case "DEFICIT":
      return "Déficit";
    default:
      return status;
  }
}

export function PlanReport({ plan }: { plan: ComputedPlan }) {
  const monthLabel = new Date(plan.referenceMonth).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  const sortedTimeline = [...plan.timeline].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <Document title={`Finance AI — Plano de ${monthLabel}`} author="Finance AI">
      <Page size="A4" style={styles.page}>
        <View style={styles.brandRow}>
          <Text style={styles.brand}>ƒ Finance AI</Text>
          <Text style={styles.brandMuted}>Relatório gerado automaticamente</Text>
        </View>

        <Text style={styles.title}>
          {plan.ownerName} — Plano de {monthLabel}
        </Text>
        <Text style={styles.subtitle}>
          Calculado a partir de {plan.incomesCount} entrada(s) e {plan.expensesCount} saída(s).
        </Text>

        <View style={styles.cardsRow}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Entradas</Text>
            <Text style={styles.cardValue}>{formatBRL(plan.totalIncome)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Saídas</Text>
            <Text style={styles.cardValue}>{formatBRL(plan.totalExpense)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Sobra</Text>
            <Text style={styles.cardValue}>{formatBRL(plan.balance)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Health Score</Text>
            <Text style={styles.cardValue}>{plan.healthScore}/100</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Reserva de emergência</Text>
        <View style={styles.cardsRow}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Custo essencial/mês</Text>
            <Text style={styles.cardValue}>
              {formatBRL(plan.emergencyFundStatus.essentialMonthlyCost)}
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Meta</Text>
            <Text style={styles.cardValue}>{formatBRL(plan.emergencyFundStatus.targetAmount)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Cobertura atual</Text>
            <Text style={styles.cardValue}>{plan.emergencyFundStatus.coverageDays} dias</Text>
          </View>
        </View>

        {plan.insights.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Insights</Text>
            {plan.insights.map((insight, i) => (
              <View key={i} style={styles.insightBox}>
                <Text>{insight.message}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>Linha do tempo do mês</Text>
        {sortedTimeline.map((event) => (
          <View key={event.id} style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowDate}>
                {String(event.date.getDate()).padStart(2, "0")}/
                {String(event.date.getMonth() + 1).padStart(2, "0")}
              </Text>
              <Text style={styles.rowName}>{event.name}</Text>
            </View>
            <View style={styles.rowLeft}>
              <Text style={styles.rowAmount}>{formatBRL(event.amount)}</Text>
              <Text style={styles.rowStatus}>{statusLabel(event.status)}</Text>
            </View>
          </View>
        ))}

        <View style={styles.footer} fixed>
          <Text>Finance AI — financeai.app</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
