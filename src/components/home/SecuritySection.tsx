import { Reveal } from "./Reveal";
import { Shield, Lock, History, Database, UserCheck, Monitor } from "lucide-react";

const items = [
  { icon: Lock, text: "Conexiones cifradas" },
  { icon: UserCheck, text: "Control de acceso por usuario" },
  { icon: History, text: "Registro de actividad" },
  { icon: Database, text: "Copias de respaldo" },
  { icon: Layers, text: "Separación lógica por empresa" },
  { icon: Monitor, text: "Monitoreo de disponibilidad" },
];

function Layers({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 22 8.5 12 15 2 8.5 12 2" />
      <polyline points="2 15.5 12 22 22 15.5" />
    </svg>
  );
}

export function SecuritySection() {
  return (
    <section className="bg-[#EDF8FF] py-24 md:py-28 lg:py-[120px]">
      <div className="max-w-[1240px] mx-auto px-5 md:px-8 lg:px-10">
        <Reveal>
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-[#246FC1] uppercase tracking-wider mb-3">Seguridad y trazabilidad desde el diseño</p>
            <h2 className="text-[32px] md:text-[40px] lg:text-[46px] font-extrabold text-[#102F4B] leading-[1.12] font-manrope max-w-[680px] mx-auto">
              Tu información necesita claridad, control y responsabilidad.
            </h2>
            <p className="text-lg text-[#39566F] leading-[1.6] mt-4 max-w-[620px] mx-auto">
              Estamos diseñando Nuvvi con prácticas de seguridad, control de acceso y trazabilidad apropiadas para la gestión de información empresarial.
            </p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-[960px] mx-auto">
          {items.map((item) => (
            <Reveal key={item.text}>
              <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-[#D9ECFA]">
                <item.icon size={18} className="text-[#4F9FF0] shrink-0" />
                <span className="text-sm text-[#39566F] font-medium">{item.text}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
