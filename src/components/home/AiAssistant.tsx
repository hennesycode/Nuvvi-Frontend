import { useNavigate } from "react-router-dom";
import { Reveal } from "./Reveal";
import { Bot, User, Sparkles } from "lucide-react";

export function AiAssistant() {
  const navigate = useNavigate();

  return (
    <section className="bg-white py-24 md:py-28 lg:py-[120px]">
      <div className="max-w-[1240px] mx-auto px-5 md:px-8 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <Reveal>
            <div>
              <p className="text-sm font-semibold text-[#246FC1] uppercase tracking-wider mb-3">Ayuda en el momento correcto</p>
              <h2 className="text-[32px] md:text-[40px] font-extrabold text-[#102F4B] leading-[1.12] font-manrope">
                Una inteligencia artificial que te explica, no que te complica.
              </h2>
              <p className="text-lg text-[#39566F] leading-[1.6] mt-4">
                El asistente de Nuvvi acompaña cada proceso con explicaciones claras, validaciones contextuales y sugerencias sobre el siguiente paso.
              </p>

              <div className="grid grid-cols-2 gap-2 mt-6 text-sm text-[#39566F]">
                {[
                  "Explicar campos y conceptos",
                  "Resumir pendientes",
                  "Señalar datos inusuales",
                  "Guiar correcciones",
                  "Sugerir el siguiente paso",
                  "Ayudar a encontrar documentos",
                  "Interpretar estados del sistema",
                  "Conectar al soporte humano",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4F9FF0]" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-[#FFFBE6] rounded-xl p-4 border border-[#F5E6C8] text-xs text-[#6C8398] leading-relaxed">
                <strong className="text-[#0B2944]">Importante:</strong> El asistente no ejecuta cambios fiscales críticos sin confirmación, no reemplaza el criterio de un contador o asesor tributario, y mantiene registro de las acciones realizadas.
              </div>

              <button onClick={() => navigate("/login")} className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-[#4F9FF0] hover:bg-[#348BE3] transition-all shadow-[0_2px_8px_rgba(79,159,240,0.25)]">
                Conocer el asistente Nuvvi
                <Sparkles size={16} />
              </button>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="bg-[#F8FCFF] rounded-2xl border border-[#D9ECFA] p-5 space-y-4 shadow-[0_4px_24px_rgba(79,159,240,0.04)]">
              <div className="flex items-center gap-2 pb-3 border-b border-[#EDF8FF]">
                <Bot size={18} className="text-[#4F9FF0]" />
                <span className="text-sm font-bold text-[#102F4B] font-manrope">Asistente Nuvvi</span>
                <span className="text-[10px] bg-[#E8F0FE] text-[#246FC1] px-2 py-0.5 rounded-full font-semibold">Beta</span>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#4F9FF0] flex items-center justify-center shrink-0">
                  <User size={13} className="text-white" />
                </div>
                <div className="bg-white rounded-xl rounded-tl-sm p-3 text-sm text-[#39566F] shadow-sm border border-[#EDF8FF]">
                  ¿Por qué este documento aparece por revisar?
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#D8EEFF] flex items-center justify-center shrink-0">
                  <Sparkles size={13} className="text-[#4F9FF0]" />
                </div>
                <div className="bg-[#EDF8FF] rounded-xl rounded-tl-sm p-3 text-sm text-[#102F4B] border border-[#D8EEFF]">
                  Encontré una diferencia entre el valor registrado en compras y el valor del documento electrónico. Puedes comparar ambos valores antes de confirmar el ajuste.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#4F9FF0] flex items-center justify-center shrink-0">
                  <User size={13} className="text-white" />
                </div>
                <div className="bg-white rounded-xl rounded-tl-sm p-3 text-sm text-[#39566F] shadow-sm border border-[#EDF8FF]">
                  ¿Qué debo revisar?
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#D8EEFF] flex items-center justify-center shrink-0">
                  <Sparkles size={13} className="text-[#4F9FF0]" />
                </div>
                <div className="bg-[#EDF8FF] rounded-xl rounded-tl-sm p-3 text-sm text-[#102F4B] border border-[#D8EEFF]">
                  Verifica la base gravable, la tarifa de IVA, el tercero y la fecha del documento. No realizaré cambios sin tu confirmación.
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
