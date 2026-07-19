import { useNavigate } from "react-router-dom";
import { Reveal } from "./Reveal";
import { Building2, Bell, ListChecks, Shield } from "lucide-react";

export function MultiCompanyDashboard() {
  const navigate = useNavigate();

  return (
    <section className="bg-white py-24 md:py-28 lg:py-[120px]">
      <div className="max-w-[1240px] mx-auto px-5 md:px-8 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <Reveal>
            <div className="bg-white rounded-2xl border border-[#D9ECFA] shadow-[0_4px_24px_rgba(79,159,240,0.04)] overflow-hidden">
              <div className="flex">
                <div className="w-48 bg-[#F8FCFF] border-r border-[#D9ECFA] p-4 space-y-3">
                  <div className="flex items-center gap-2 pb-3 border-b border-[#D9ECFA]">
                    <Building2 size={16} className="text-[#4F9FF0]" />
                    <span className="text-xs font-bold text-[#102F4B]">Empresas</span>
                  </div>
                  {["Distribuidora ABC", "Servicios XYZ SA", "Comercial 123", "Grupo Delta"].map((name, i) => (
                    <div key={name} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${i === 0 ? "bg-[#E8F0FE] text-[#246FC1]" : "text-[#39566F] hover:bg-[#F8FCFF]"}`}>
                      {name}
                    </div>
                  ))}
                  <div className="pt-2">
                    <span className="text-[10px] text-[#4F9FF0] font-semibold cursor-pointer">+ Agregar empresa</span>
                  </div>
                </div>

                <div className="flex-1 p-4 space-y-3">
                  <p className="text-xs font-bold text-[#102F4B] font-manrope">Distribuidora ABC</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#F8FCFF] rounded-xl p-2.5 border border-[#EDF8FF]">
                      <Bell size={14} className="text-[#B97812] mb-1" />
                      <p className="text-[10px] text-[#6C8398]">Alertas activas</p>
                      <p className="text-sm font-bold text-[#102F4B]">3</p>
                    </div>
                    <div className="bg-[#F8FCFF] rounded-xl p-2.5 border border-[#EDF8FF]">
                      <ListChecks size={14} className="text-[#4F9FF0] mb-1" />
                      <p className="text-[10px] text-[#6C8398]">Pendientes</p>
                      <p className="text-sm font-bold text-[#102F4B]">7</p>
                    </div>
                  </div>
                  <div className="text-[10px] space-y-1.5">
                    <div className="flex justify-between text-[#39566F]"><span>Documentos emitidos</span><span className="font-medium">142</span></div>
                    <div className="flex justify-between text-[#39566F]"><span>Documentos recibidos</span><span className="font-medium">89</span></div>
                    <div className="flex justify-between text-[#39566F]"><span>Por revisar este mes</span><span className="font-medium text-[#B97812]">5</span></div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div>
              <p className="text-sm font-semibold text-[#246FC1] uppercase tracking-wider mb-3">Una vista para todas tus empresas</p>
              <h2 className="text-[32px] md:text-[38px] font-extrabold text-[#102F4B] leading-[1.12] font-manrope">
                Cambia de empresa sin perder el contexto.
              </h2>
              <p className="text-lg text-[#39566F] leading-[1.6] mt-4">
                Ideal para contadores, equipos administrativos y grupos empresariales que necesitan controlar varias operaciones desde una misma cuenta.
              </p>

              <div className="grid grid-cols-2 gap-2 mt-6 text-sm text-[#39566F]">
                {["Selector rápido de empresa", "Alertas agrupadas", "Tareas por prioridad", "Permisos por usuario", "Actividad reciente", "Filtros por periodo"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4F9FF0]" />
                    {item}
                  </div>
                ))}
              </div>

              <button onClick={() => navigate("/login")} className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-[#4F9FF0] hover:bg-[#348BE3] transition-all shadow-[0_2px_8px_rgba(79,159,240,0.25)]">
                Explorar el dashboard
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
