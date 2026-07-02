import { motion } from "framer-motion";
import { RefreshCw, Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";

const subscriptions = [
  { tenant: "Empresa Demo 1", plan: "Pro", status: "active", period: "Jun 1 — Jul 1, 2026", billing: "monthly" },
  { tenant: "Comercio ABC", plan: "Enterprise", status: "active", period: "May 15 — Jun 15, 2026", billing: "monthly" },
  { tenant: "Servicios XYZ", plan: "Básico", status: "past_due", period: "May 1 — Jun 1, 2026", billing: "yearly" },
];

const statusLabels: Record<string, string> = {
  active: "Activo",
  trialing: "Prueba",
  past_due: "Vencido",
  suspended: "Suspendido",
  canceled: "Cancelado",
};

const statusColors: Record<string, string> = {
  active: "bg-nuvvi/20 text-nuvvi border-nuvvi/30",
  trialing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  past_due: "bg-red-500/20 text-red-400 border-red-500/30",
  suspended: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  canceled: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Suscripciones" subtitle="Administración de suscripciones activas" />

      <div className="glass rounded-xl overflow-hidden">
        <div className="p-4 border-b border-card-border">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              placeholder="Buscar suscripción..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-white/5 border border-card-border text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-nuvvi/30"
            />
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-card-border text-left">
              <th className="p-4 text-xs text-muted font-medium">Tenant</th>
              <th className="p-4 text-xs text-muted font-medium">Plan</th>
              <th className="p-4 text-xs text-muted font-medium">Estado</th>
              <th className="p-4 text-xs text-muted font-medium">Periodo</th>
              <th className="p-4 text-xs text-muted font-medium">Ciclo</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((s, i) => (
              <motion.tr
                key={s.tenant}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-card-border/50 hover:bg-card-hover transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-nuvvi/10">
                      <RefreshCw size={16} className="text-nuvvi" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{s.tenant}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-muted">{s.plan}</td>
                <td className="p-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full border ${statusColors[s.status]}`}>
                    {statusLabels[s.status]}
                  </span>
                </td>
                <td className="p-4 text-sm text-muted">{s.period}</td>
                <td className="p-4 text-sm text-muted capitalize">{s.billing}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
