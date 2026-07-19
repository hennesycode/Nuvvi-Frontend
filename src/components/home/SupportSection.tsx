import { useNavigate } from "react-router-dom";
import { Reveal } from "./Reveal";
import { BookOpen, Bot, HeadphonesIcon } from "lucide-react";

export function SupportSection() {
  const navigate = useNavigate();

  const cards = [
    { icon: BookOpen, title: "Centro de ayuda", text: "Guías claras para configurar y utilizar cada módulo." },
    { icon: Bot, title: "Asistente Nuvvi", text: "Respuestas contextuales dentro de la plataforma." },
    { icon: HeadphonesIcon, title: "Soporte humano", text: "Acompañamiento para resolver casos que requieren revisión." },
  ];

  return (
    <section id="soporte" className="bg-[#EDF8FF] py-24 md:py-28 lg:py-[120px]">
      <div className="max-w-[1240px] mx-auto px-5 md:px-8 lg:px-10">
        <Reveal>
          <div className="text-center mb-14">
            <h2 className="text-[32px] md:text-[40px] lg:text-[46px] font-extrabold text-[#102F4B] leading-[1.12] font-manrope">
              No tienes que resolverlo todo solo.
            </h2>
            <p className="text-lg text-[#39566F] leading-[1.6] mt-4 max-w-[560px] mx-auto">
              Encuentra respuestas dentro de la plataforma, consulta documentación o comunícate con nuestro equipo cuando necesites acompañamiento.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5 max-w-[960px] mx-auto mb-10">
          {cards.map((card) => (
            <Reveal key={card.title}>
              <div className="bg-white rounded-2xl border border-[#D9ECFA] p-6 text-center shadow-[0_2px_12px_rgba(79,159,240,0.04)] h-full">
                <div className="w-12 h-12 rounded-xl bg-[#EDF8FF] flex items-center justify-center mx-auto mb-4">
                  <card.icon size={22} className="text-[#4F9FF0]" />
                </div>
                <h3 className="text-base font-bold text-[#102F4B] mb-2 font-manrope">{card.title}</h3>
                <p className="text-sm text-[#6C8398] leading-relaxed">{card.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="flex justify-center gap-4">
            <button onClick={() => navigate("/login")} className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-[#4F9FF0] hover:bg-[#348BE3] transition-all shadow-[0_2px_8px_rgba(79,159,240,0.25)]">
              Explorar ayudas
            </button>
            <button onClick={() => navigate("/login")} className="px-6 py-3 rounded-xl text-sm font-semibold text-[#39566F] hover:text-[#102F4B] border border-[#D9ECFA] hover:border-[#4F9FF0] bg-white transition-all">
              Contactar soporte
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
