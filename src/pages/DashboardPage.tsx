import { motion } from "framer-motion";
import { Users, Building2, FileText, RefreshCw } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { PageHeader } from "@/components/common/PageHeader";
import { NuvviOrb } from "@/components/3d/NuvviOrb";

const stats = [
  { title: "Clientes activos", value: "1,234", icon: Users, trend: "+12% este mes" },
  { title: "Tenants", value: "48", icon: Building2, trend: "3 pendientes" },
  { title: "Suscripciones", value: "52", icon: RefreshCw, trend: "94% activas" },
  { title: "Documentos / mes", value: "8,920", icon: FileText, trend: "+23% vs mes anterior" },
];

export function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle="Bienvenido a Nuvvi by Hennesy — panel de control central"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 glass rounded-xl p-6"
        >
          <h2 className="text-sm font-semibold text-muted mb-4">Vista General</h2>
          <NuvviOrb />
          <div className="mt-4 text-center">
            <p className="text-gradient text-lg font-bold">Nuvvi by Hennesy</p>
            <p className="text-xs text-muted mt-1">
              Plataforma SaaS de facturación electrónica, inventario y ventas
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass rounded-xl p-6 space-y-4"
        >
          <h2 className="text-sm font-semibold text-muted">Estado del Sistema</h2>
          {[
            { label: "API Gateway", status: "Operativo", color: "bg-nuvvi" },
            { label: "Base de datos", status: "Operativo", color: "bg-nuvvi" },
            { label: "Redis", status: "Operativo", color: "bg-nuvvi" },
            { label: "DIAN Sandbox", status: "En espera", color: "bg-yellow-500" },
            { label: "MATIAS API", status: "En espera", color: "bg-yellow-500" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sm text-muted">{item.label}</span>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${item.color}`} />
                <span className="text-xs text-foreground">{item.status}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
