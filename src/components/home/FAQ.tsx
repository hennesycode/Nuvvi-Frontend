import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "./Reveal";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "¿Qué es Nuvvi?",
    a: "Nuvvi es una plataforma para centralizar procesos de facturación electrónica, documentos electrónicos, ventas, compras y gestión multiempresa. Sus funcionalidades disponibles dependerán del plan y de la etapa de lanzamiento de cada módulo.",
  },
  {
    q: "¿Qué documentos podré gestionar?",
    a: "Nuvvi está diseñado para integrar facturación electrónica, nómina electrónica, POS electrónico, documento soporte y eventos RADIAN. La disponibilidad de cada módulo se mostrará claramente dentro de la plataforma.",
  },
  {
    q: "¿Puedo gestionar más de una empresa?",
    a: "El dashboard multicliente está pensado para contadores, equipos administrativos y grupos empresariales que necesitan cambiar entre varias empresas desde una misma cuenta.",
  },
  {
    q: "¿Cómo funciona la conciliación de IVA?",
    a: "Nuvvi relaciona información de ventas y compras por periodo, tercero, documento y tipo de impuesto para facilitar la revisión y señalar posibles diferencias. Los resultados deben ser verificados por el usuario o su asesor contable.",
  },
  {
    q: "¿La inteligencia artificial reemplaza a mi contador?",
    a: "No. El asistente de Nuvvi ofrece explicaciones, orientación y apoyo operativo, pero no reemplaza el criterio de un contador, asesor tributario o profesional jurídico.",
  },
  {
    q: "¿Cómo comienzo?",
    a: "Crea una cuenta, registra tu empresa y sigue la configuración guiada. Nuvvi te mostrará las tareas necesarias según los módulos que utilices.",
  },
  {
    q: "¿Nuvvi ofrece soporte?",
    a: "Nuvvi contará con recursos de ayuda y canales de soporte. Los horarios, medios y condiciones se publicarán según el plan contratado.",
  },
  {
    q: "¿Mis datos están protegidos?",
    a: "Nuvvi aplicará medidas técnicas y organizativas para proteger la información. Los detalles sobre tratamiento, almacenamiento y derechos de los titulares estarán disponibles en sus políticas legales.",
  },
];

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border border-[#D9ECFA] rounded-2xl bg-white overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F9FF0] focus-visible:ring-offset-2 rounded-2xl"
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-[#102F4B] pr-4">{q}</span>
        <ChevronDown
          size={20}
          className={`text-[#6C8398] shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 text-[#39566F] leading-[1.7]">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-white py-24 md:py-28 lg:py-[120px]">
      <div className="max-w-[800px] mx-auto px-5 md:px-8 lg:px-10">
        <Reveal>
          <div className="text-center mb-14">
            <h2 className="text-[32px] md:text-[40px] lg:text-[46px] font-extrabold text-[#102F4B] leading-[1.12] font-manrope">
              Preguntas frecuentes sobre Nuvvi
            </h2>
          </div>
        </Reveal>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <Reveal key={i} delay={i * 0.04}>
              <FaqItem
                q={faq.q}
                a={faq.a}
                open={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
