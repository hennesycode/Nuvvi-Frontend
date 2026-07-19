import { motion } from "framer-motion";
import { Users } from "lucide-react";

export function ClientsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#102F4B] font-manrope">Clientes</h1>
        <p className="text-sm text-[#6C8398] mt-1">Gestión de empresas registradas en Nuvvi</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#D9ECFA] p-8 text-center shadow-[0_2px_12px_rgba(79,159,240,0.04)]">
        <div className="w-16 h-16 rounded-2xl bg-[#F8FCFF] border border-[#D9ECFA] flex items-center justify-center mx-auto mb-4">
          <Users size={28} className="text-[#4F9FF0]" />
        </div>
        <h2 className="text-lg font-bold text-[#102F4B] font-manrope mb-2">Próximamente</h2>
        <p className="text-sm text-[#6C8398] max-w-[400px] mx-auto">
          La gestión de clientes estará disponible próximamente. Aquí podrás ver, crear y administrar todas las empresas registradas en la plataforma.
        </p>
      </div>
    </motion.div>
  );
}
