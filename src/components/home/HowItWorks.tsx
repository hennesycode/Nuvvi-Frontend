import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Reveal } from "./Reveal";
import { Settings, Plug, BarChart3, Search } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Settings,
    title: "Configura tu empresa",
    desc: "Registra la información necesaria y completa una lista guiada de configuración.",
  },
  {
    number: "02",
    icon: Plug,
    title: "Conecta tus procesos",
    desc: "Habilita los módulos que necesitas y organiza tus numeraciones, documentos y usuarios.",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Opera todos los días",
    desc: "Gestiona ventas, compras y documentos electrónicos desde un mismo espacio.",
  },
  {
    number: "04",
    icon: Search,
    title: "Revisa y concilia",
    desc: "Consulta alertas, diferencias, tareas pendientes y reportes por periodo.",
  },
];

export function HowItWorks() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = document.getElementById("como-funciona");
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 1;
      });
    }, 20);
    if (progress >= 100) clearTimeout(timer);
    return () => clearTimeout(timer);
  }, [progress, visible]);

  return (
    <section id="como-funciona" className="bg-[#EDF8FF] py-24 md:py-28 lg:py-[120px]">
      <div className="max-w-[1240px] mx-auto px-5 md:px-8 lg:px-10">
        <Reveal>
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#246FC1] uppercase tracking-wider mb-3">Empieza sin procesos confusos</p>
            <h2 className="text-[32px] md:text-[40px] lg:text-[46px] font-extrabold text-[#102F4B] leading-[1.12] font-manrope">
              De la configuración al control diario, paso a paso.
            </h2>
          </div>
        </Reveal>

        <Reveal>
          <div className="bg-white rounded-2xl border border-[#D9ECFA] p-8 md:p-10 shadow-[0_4px_24px_rgba(79,159,240,0.04)]">
            <div className="h-1.5 bg-[#EDF8FF] rounded-full mb-10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#4F9FF0] to-[#A8D7FF] rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, i) => (
                <div key={step.number} className="text-center sm:text-left">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 mx-auto sm:mx-0 transition-colors duration-500 ${progress >= (i + 1) * 25 ? "bg-[#4F9FF0]" : "bg-[#EDF8FF]"}`}>
                    <step.icon size={22} className={progress >= (i + 1) * 25 ? "text-white" : "text-[#6C8398]"} />
                  </div>
                  <p className="text-xs font-bold text-[#6C8398] mb-1">{step.number}</p>
                  <h3 className="text-base font-bold text-[#102F4B] font-manrope mb-1.5">{step.title}</h3>
                  <p className="text-sm text-[#6C8398] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="text-center mt-10">
            <button onClick={() => navigate("/login")} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-[#4F9FF0] hover:bg-[#348BE3] transition-all shadow-[0_2px_8px_rgba(79,159,240,0.25)]">
              Comenzar configuración
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
