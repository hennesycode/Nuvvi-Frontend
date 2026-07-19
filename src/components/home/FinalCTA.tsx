import { useNavigate } from "react-router-dom";
import { Reveal } from "./Reveal";
import { ChevronRight, Sparkles } from "lucide-react";

export function FinalCTA() {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 md:py-28 lg:py-[120px] overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, #348BE3 0%, #63B2F7 48%, #A8D7FF 100%)",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)" }} aria-hidden="true" />

      <div className="relative max-w-[1240px] mx-auto px-5 md:px-8 lg:px-10 text-center">
        <Reveal>
          <div className="mx-auto w-20 h-20 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center mb-8 shadow-[0_8px_32px_rgba(255,255,255,0.15)]">
            <img src="/logo-favicon-nuvvi.png" alt="" className="h-12 w-12" />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="text-[34px] md:text-[44px] lg:text-[52px] font-extrabold text-white leading-[1.1] max-w-[700px] mx-auto font-manrope">
            Haz que gestionar tu empresa se sienta más ligero.
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="text-lg text-white/90 leading-[1.6] mt-5 max-w-[580px] mx-auto">
            Centraliza tus documentos electrónicos, ventas, compras y pendientes con una plataforma diseñada para guiarte paso a paso.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-[#246FC1] bg-white hover:bg-white/95 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_28px_rgba(0,0,0,0.15)]"
            >
              Comenzar con Nuvvi
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white border border-white/30 hover:bg-white/10 transition-all"
            >
              Iniciar sesión
              <Sparkles size={16} />
            </button>
          </div>
          <p className="text-sm text-white/70 mt-4">Crea tu cuenta y configura tu primera empresa.</p>
        </Reveal>
      </div>
    </section>
  );
}
