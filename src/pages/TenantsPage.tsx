import { motion } from "framer-motion";
import { Building2, Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";

const tenants = [
  { name: "Empresa Demo 1", nit: "900.123.456-1", email: "contacto@demo1.co", status: "active" },
  { name: "Comercio ABC", nit: "800.987.654-2", email: "info@abc.co", status: "active" },
  { name: "Servicios XYZ", nit: "901.456.789-3", email: "admin@xyz.co", status: "suspended" },
];

const statusColors: Record<string, string> = {
  active: "bg-nuvvi/20 text-nuvvi border-nuvvi/30",
  suspended: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  pending: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  blocked: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function TenantsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Tenants" subtitle="Gestión de empresas emisoras" />

      <div className="glass rounded-xl overflow-hidden">
        <div className="p-4 border-b border-card-border">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              placeholder="Buscar tenant..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-white/5 border border-card-border text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-nuvvi/30"
            />
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-card-border text-left">
              <th className="p-4 text-xs text-muted font-medium">Nombre</th>
              <th className="p-4 text-xs text-muted font-medium">NIT</th>
              <th className="p-4 text-xs text-muted font-medium">Email</th>
              <th className="p-4 text-xs text-muted font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t, i) => (
              <motion.tr
                key={t.nit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-card-border/50 hover:bg-card-hover transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-nuvvi/10">
                      <Building2 size={16} className="text-nuvvi" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{t.name}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-muted">{t.nit}</td>
                <td className="p-4 text-sm text-muted">{t.email}</td>
                <td className="p-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full border ${statusColors[t.status]}`}>
                    {t.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
