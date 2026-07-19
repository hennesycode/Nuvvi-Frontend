import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Sparkles, Play } from "lucide-react";
import { HeroDashboardPreview } from "./HeroDashboardPreview";
import { Reveal } from "./Reveal";

export function Hero() {
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative bg-white overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[700px] pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 0%, rgba(168,215,255,0.28), rgba(255,255,255,0) 58%)",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-[1240px] mx-auto px-5 md:px-8 lg:px-10 pt-20 pb-24 md:pt-28 md:pb-32 lg:pt-[104px] lg:pb-[120px]">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <Reveal>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EDF8FF] border border-[#D9ECFA] mb-6">
                <Sparkles size={14} className="text-[#4F9FF0]" />
                <span className="text-xs font-semibold text-[#246FC1]">
                  Facturación y gestión electrónica para empresas en Colombia
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h1 className="text-[38px] md:text-[52px] lg:text-[62px] font-extrabold text-[#102F4B] leading-[1.06] tracking-[-0.02em] max-w-[780px] font-manrope">
                Facturación electrónica y control tributario, sin enredos.
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="text-lg md:text-xl text-[#39566F] leading-[1.6] mt-6 max-w-[560px]">
                Centraliza ventas, compras, facturación electrónica, nómina, POS, documento soporte y eventos RADIAN. Nuvvi te guía paso a paso y te ayuda a conciliar el IVA desde una sola plataforma.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center justify-center gap-1.5 px-7 py-3.5 rounded-2xl text-base font-semibold text-white bg-[#4F9FF0] hover:bg-[#348BE3] transition-all shadow-[0_4px_16px_rgba(79,159,240,0.3)] hover:shadow-[0_6px_20px_rgba(79,159,240,0.4)]"
                >
                  Comenzar ahora
                  <ChevronRight size={18} />
                </button>
                <button
                  onClick={() => scrollTo("#como-funciona")}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-base font-semibold text-[#39566F] hover:text-[#102F4B] border border-[#D9ECFA] hover:border-[#4F9FF0] bg-white hover:bg-[#F8FCFF] transition-all"
                >
                  <Play size={16} />
                  Ver cómo funciona
                </button>
              </div>

              <div className="flex items-center gap-3 mt-5 text-sm text-[#6C8398]">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#178C68]" />
                Configuración guiada
                <span className="inline-block w-1 h-1 rounded-full bg-[#D9ECFA]" />
                Soporte en español
                <span className="inline-block w-1 h-1 rounded-full bg-[#D9ECFA]" />
                Gestión segura
              </div>
            </Reveal>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative"
          >
            <HeroDashboardPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
