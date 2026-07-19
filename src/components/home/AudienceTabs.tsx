import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "./Reveal";
import { Building2, Calculator, Layers, Check } from "lucide-react";

const tabs = [
  {
    id: "empresas",
    icon: Building2,
    label: "Empresas y pymes",
    title: "Controla tu operación sin convertir cada proceso en un trámite.",
    benefits: ["Facturación diaria", "Ventas y compras organizadas", "Reportes comprensibles", "Alertas claras", "Menos tareas repetitivas"],
  },
  {
    id: "contadores",
    icon: Calculator,
    label: "Contadores",
    title: "Administra varios clientes desde una sola cuenta.",
    benefits: ["Cambio rápido entre empresas", "Pendientes por cliente", "Comparación por periodo", "Exportación de reportes", "Trazabilidad de revisiones"],
  },
  {
    id: "grupos",
    icon: Layers,
    label: "Grupos empresariales",
    title: "Obtén una visión organizada de varias razones sociales.",
    benefits: ["Gestión por empresa", "Roles y permisos", "Actividad centralizada", "Seguimiento operativo"],
  },
];

export function AudienceTabs() {
  const [active, setActive] = useState("empresas");

  return (
    <section id="perfiles" className="bg-white py-24 md:py-28 lg:py-[120px]">
      <div className="max-w-[1240px] mx-auto px-5 md:px-8 lg:px-10">
        <Reveal>
          <div className="text-center mb-14">
            <h2 className="text-[32px] md:text-[40px] lg:text-[46px] font-extrabold text-[#102F4B] leading-[1.12] font-manrope">
              Diseñado para quienes necesitan claridad.
            </h2>
          </div>
        </Reveal>

        <div className="hidden md:flex justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-semibold transition-all ${
                active === tab.id
                  ? "bg-white text-[#102F4B] border border-[#D9ECFA] shadow-[0_4px_16px_rgba(79,159,240,0.06)]"
                  : "text-[#6C8398] hover:text-[#102F4B] hover:bg-[#F8FCFF]"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="md:hidden space-y-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                active === tab.id
                  ? "bg-white text-[#102F4B] border border-[#D9ECFA] shadow-sm"
                  : "text-[#6C8398] bg-[#F8FCFF]"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-[#F8FCFF] rounded-2xl border border-[#D9ECFA] p-8 md:p-10"
          >
            {tabs.filter((t) => t.id === active).map((tab) => (
              <div key={tab.id} className="max-w-[640px] mx-auto">
                <h3 className="text-xl font-bold text-[#102F4B] mb-6 font-manrope">{tab.title}</h3>
                <div className="space-y-3">
                  {tab.benefits.map((b) => (
                    <div key={b} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#D8F5EB] flex items-center justify-center shrink-0">
                        <Check size={12} className="text-[#178C68]" />
                      </div>
                      <span className="text-[#39566F]">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
