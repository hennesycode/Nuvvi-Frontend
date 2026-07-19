import { useNavigate } from "react-router-dom";
import { Reveal } from "./Reveal";
import { CheckCircle2, AlertTriangle, Clock, FileSearch } from "lucide-react";

export function VatReconciliation() {
  const navigate = useNavigate();

  const states = [
    { icon: CheckCircle2, label: "Conciliado", color: "text-[#178C68] bg-[#D8F5EB]", count: 24 },
    { icon: AlertTriangle, label: "Por revisar", color: "text-[#B97812] bg-[#FFF3E0]", count: 3 },
    { icon: FileSearch, label: "Posible duplicado", color: "text-[#C94455] bg-[#FDE8E8]", count: 1 },
    { icon: Clock, label: "Doc. faltante", color: "text-[#6C8398] bg-[#F5F5F5]", count: 2 },
  ];

  return (
    <section className="relative bg-white py-24 md:py-28 lg:py-[120px]">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #EDF8FF 50%, #FFFFFF 100%)" }} aria-hidden="true" />

      <div className="relative max-w-[1240px] mx-auto px-5 md:px-8 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <Reveal>
            <div className="bg-white rounded-2xl border border-[#D9ECFA] shadow-[0_8px_40px_rgba(79,159,240,0.08)] p-5 md:p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#102F4B] font-manrope">Conciliación de IVA del periodo</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#EDF8FF] text-[#6C8398]">
                      <th className="text-left py-2 pr-4 font-medium">Documento</th>
                      <th className="text-left py-2 pr-4 font-medium">Tercero</th>
                      <th className="text-left py-2 pr-4 font-medium">Tipo</th>
                      <th className="text-right py-2 pr-4 font-medium">Base</th>
                      <th className="text-right py-2 pr-4 font-medium">IVA</th>
                      <th className="text-left py-2 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { doc: "FEV-89012", tercero: "Distribuidora ABC", tipo: "Venta", base: "$12.5M", iva: "$2.3M", estado: 0 },
                      { doc: "FEC-00451", tercero: "Proveedor XYZ", tipo: "Compra", base: "$8.2M", iva: "$1.5M", estado: 1 },
                      { doc: "NC-00123", tercero: "Cliente Corp", tipo: "N. Crédito", base: "$1.0M", iva: "$190K", estado: 2 },
                      { doc: "FEV-90134", tercero: "Servicios SA", tipo: "Venta", base: "$5.4M", iva: "$1.0M", estado: 0 },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-[#F8FCFF] text-[#39566F]">
                        <td className="py-2.5 pr-4 font-medium">{row.doc}</td>
                        <td className="py-2.5 pr-4">{row.tercero}</td>
                        <td className="py-2.5 pr-4">{row.tipo}</td>
                        <td className="py-2.5 pr-4 text-right">{row.base}</td>
                        <td className="py-2.5 pr-4 text-right">{row.iva}</td>
                        <td className="py-2.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${states[row.estado].color}`}>
                            {states[row.estado].label}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-[#F8FCFF] rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-[#6C8398]">Ventas registradas</span><p className="font-bold text-[#102F4B]">$48.250.000</p></div>
                <div><span className="text-[#6C8398]">Compras registradas</span><p className="font-bold text-[#102F4B]">$31.840.000</p></div>
                <div><span className="text-[#6C8398]">IVA generado</span><p className="font-bold text-[#102F4B]">$9.167.500</p></div>
                <div><span className="text-[#6C8398]">IVA descontable</span><p className="font-bold text-[#102F4B]">$6.049.600</p></div>
                <div className="col-span-2 pt-2 border-t border-[#D9ECFA]">
                  <span className="text-[#6C8398]">Diferencia estimada</span>
                  <p className="font-extrabold text-[#246FC1] text-lg">$3.117.900</p>
                </div>
              </div>

              <p className="text-[10px] text-center text-[#6C8398]">Los resultados son herramientas de apoyo y deben ser verificados por el usuario o su asesor contable.</p>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div>
              <p className="text-sm font-semibold text-[#246FC1] uppercase tracking-wider mb-3">Ventas y compras conectadas</p>
              <h2 className="text-[32px] md:text-[38px] font-extrabold text-[#102F4B] leading-[1.12] font-manrope">
                Haz que ambos lados de tu operación hablen el mismo idioma.
              </h2>
              <p className="text-lg text-[#39566F] leading-[1.6] mt-4">
                Nuvvi reúne los documentos de ventas y compras por empresa, tercero, periodo y tipo de impuesto para facilitar la conciliación y detectar posibles diferencias antes del cierre.
              </p>

              <div className="grid grid-cols-2 gap-2 mt-6 text-sm text-[#39566F]">
                {["Comparación por periodo", "Agrupación por tercero", "Identificación de duplicados", "Alertas de documentos faltantes", "Resumen de IVA generado y descontable", "Exportación de reportes"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4F9FF0]" />
                    {item}
                  </div>
                ))}
              </div>

              <button onClick={() => navigate("/login")} className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-[#4F9FF0] hover:bg-[#348BE3] transition-all shadow-[0_2px_8px_rgba(79,159,240,0.25)]">
                Descubrir el control de IVA
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
