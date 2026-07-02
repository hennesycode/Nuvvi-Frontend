import { motion } from "framer-motion";
import { Settings, User, Bell, Shield, Palette } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";

const sections = [
  { icon: User, title: "Perfil", description: "Información personal y credenciales" },
  { icon: Bell, title: "Notificaciones", description: "Preferencias de notificaciones" },
  { icon: Shield, title: "Seguridad", description: "2FA, sesiones y permisos" },
  { icon: Palette, title: "Apariencia", description: "Tema y personalización visual" },
];

export function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Configuración" subtitle="Gestiona tu cuenta y preferencias" />

      <div className="space-y-2">
        {sections.map((s, i) => (
          <motion.button
            key={s.title}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="w-full glass rounded-xl p-4 flex items-center gap-4 text-left hover:border-nuvvi/25 transition-all duration-200 group"
          >
            <div className="p-2.5 rounded-lg bg-nuvvi/10 group-hover:bg-nuvvi/20 transition-colors">
              <s.icon size={18} className="text-nuvvi" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{s.title}</p>
              <p className="text-xs text-muted mt-0.5">{s.description}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
