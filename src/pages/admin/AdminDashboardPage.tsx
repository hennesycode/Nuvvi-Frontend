import { motion } from "framer-motion";
import { useCurrentUser } from "@/hooks/use-auth";
import {
  Building2,
  TrendingUp,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const statCards = [
  { icon: Building2, label: "Empresas activas", value: "—", color: "text-[#4F9FF0]", bg: "bg-[#E8F0FE]" },
  { icon: Users, label: "Usuarios", value: "—", color: "text-[#178C68]", bg: "bg-[#D8F5EB]" },
  { icon: FileText, label: "Documentos", value: "—", color: "text-[#B97812]", bg: "bg-[#FFF3E0]" },
  { icon: TrendingUp, label: "Transacciones", value: "—", color: "text-[#246FC1]", bg: "bg-[#EDF8FF]" },
];

export function AdminDashboardPage() {
  const { data: user } = useCurrentUser();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-extrabold text-[#102F4B] font-manrope">
          Bienvenido{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-sm text-[#6C8398] mt-1">
          Panel de administración de Nuvvi
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-[#D9ECFA] p-5 shadow-[0_2px_12px_rgba(79,159,240,0.04)]">
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon size={20} className={card.color} />
            </div>
            <p className="text-xs font-semibold text-[#6C8398] uppercase tracking-wide">{card.label}</p>
            <p className="text-2xl font-bold text-[#102F4B] font-manrope mt-1 tabular-nums">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#D9ECFA] p-6 shadow-[0_2px_12px_rgba(79,159,240,0.04)]">
          <h2 className="text-sm font-bold text-[#102F4B] font-manrope mb-4">Estado del sistema</h2>
          <div className="space-y-3">
            {[
              { label: "API Gateway", status: "Operativo", color: "bg-[#178C68]" },
              { label: "Base de datos", status: "Operativo", color: "bg-[#178C68]" },
              { label: "Redis", status: "Operativo", color: "bg-[#178C68]" },
              { label: "Autenticación", status: "Operativo", color: "bg-[#178C68]" },
            ].map((svc) => (
              <div key={svc.label} className="flex items-center justify-between py-2 border-b border-[#F8FCFF] last:border-0">
                <span className="text-sm text-[#39566F]">{svc.label}</span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-[#178C68]">
                  <span className={`w-1.5 h-1.5 rounded-full ${svc.color}`} />
                  {svc.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#D9ECFA] p-6 shadow-[0_2px_12px_rgba(79,159,240,0.04)]">
          <h2 className="text-sm font-bold text-[#102F4B] font-manrope mb-4">Actividad reciente</h2>
          <div className="space-y-4">
            {[
              { icon: CheckCircle2, text: "Superadmin inició sesión", time: "Ahora", color: "text-[#178C68] bg-[#D8F5EB]" },
              { icon: AlertTriangle, text: "Configuración pendiente", time: "Hace 2 min", color: "text-[#B97812] bg-[#FFF3E0]" },
              { icon: CheckCircle2, text: "Backup completado", time: "Hace 10 min", color: "text-[#4F9FF0] bg-[#E8F0FE]" },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg ${item.color.split(" ")[1]} flex items-center justify-center shrink-0`}>
                  <item.icon size={14} className={item.color.split(" ")[0]} />
                </div>
                <div>
                  <p className="text-sm text-[#102F4B] font-medium">{item.text}</p>
                  <p className="text-xs text-[#6C8398]">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
