import { Reveal } from "./Reveal";
import { FileText, Users, Monitor, FileCheck, RefreshCw, ArrowLeftRight, Building2 } from "lucide-react";

const modules = [
  { icon: FileText, label: "Facturación" },
  { icon: Users, label: "Nómina" },
  { icon: Monitor, label: "POS" },
  { icon: FileCheck, label: "Doc. Soporte" },
  { icon: RefreshCw, label: "RADIAN" },
  { icon: ArrowLeftRight, label: "Ventas y Compras" },
  { icon: Building2, label: "Multiempresa" },
];

export function IntegralProposition() {
  return (
    <section className="bg-white py-12 border-b border-[#D9ECFA]">
      <div className="max-w-[1240px] mx-auto px-5 md:px-8 lg:px-10">
        <Reveal>
          <h2 className="text-center text-sm font-semibold text-[#6C8398] uppercase tracking-wider mb-8">
            Una sola plataforma para toda tu operación electrónica
          </h2>
        </Reveal>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {modules.map((mod) => (
            <Reveal key={mod.label}>
              <div className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-xl bg-[#F8FCFF] border border-[#D9ECFA] flex items-center justify-center group-hover:border-[#4F9FF0] group-hover:bg-[#EDF8FF] transition-all">
                  <mod.icon size={20} className="text-[#4F9FF0]" />
                </div>
                <span className="text-xs font-medium text-[#39566F]">{mod.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
