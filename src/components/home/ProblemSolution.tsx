import { motion } from "framer-motion";
import { Reveal, RevealItem } from "./Reveal";
import { X, Check } from "lucide-react";

const problems = [
  "Información repetida en múltiples lugares",
  "Documentos dispersos entre carpetas y correos",
  "Diferencias detectadas demasiado tarde",
  "Cambios constantes al alternar entre empresas",
  "Procesos difíciles de explicar al equipo",
  "Más trabajo manual del necesario",
];

const solutions = [
  "Información organizada por empresa y periodo",
  "Documentos con estado y trazabilidad clara",
  "Alertas sobre posibles inconsistencias",
  "Ventas y compras relacionadas automáticamente",
  "Procesos guiados paso a paso",
  "Tareas pendientes claramente priorizadas",
];

export function ProblemSolution() {
  return (
    <section className="bg-[#EDF8FF] py-24 md:py-28 lg:py-[120px]">
      <div className="max-w-[1240px] mx-auto px-5 md:px-8 lg:px-10">
        <Reveal>
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#246FC1] uppercase tracking-wider mb-3">Menos fragmentación. Más claridad.</p>
            <h2 className="text-[32px] md:text-[40px] lg:text-[46px] font-extrabold text-[#102F4B] leading-[1.12] tracking-[-0.01em] max-w-[700px] mx-auto font-manrope">
              Deja de perseguir información entre archivos, correos y plataformas.
            </h2>
            <p className="text-lg text-[#39566F] leading-[1.6] mt-4 max-w-[620px] mx-auto">
              Cuando las ventas, las compras y los documentos electrónicos viven separados, revisar impuestos y detectar pendientes toma más tiempo. Nuvvi organiza cada movimiento y mantiene la trazabilidad en un mismo lugar.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="bg-white rounded-2xl border border-[#F5E6C8] p-6 md:p-8">
            <h3 className="text-lg font-bold text-[#B97812] mb-5 font-manrope">Sin una operación centralizada</h3>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }} className="space-y-3">
              {problems.map((item) => (
                <motion.div key={item} variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FDE8E8] flex items-center justify-center shrink-0 mt-0.5">
                    <X size={12} className="text-[#C94455]" />
                  </div>
                  <span className="text-sm text-[#39566F]">{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="bg-white rounded-2xl border border-[#D9ECFA] p-6 md:p-8 shadow-[0_4px_24px_rgba(79,159,240,0.06)]">
            <h3 className="text-lg font-bold text-[#246FC1] mb-5 font-manrope">Con Nuvvi</h3>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }} className="space-y-3">
              {solutions.map((item) => (
                <motion.div key={item} variants={{ hidden: { opacity: 0, x: 8 }, visible: { opacity: 1, x: 0 } }} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#D8F5EB] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} className="text-[#178C68]" />
                  </div>
                  <span className="text-sm text-[#39566F]">{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
