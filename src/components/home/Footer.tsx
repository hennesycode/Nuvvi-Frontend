import { Link } from "react-router-dom";

const footerColumns = [
  {
    title: "Productos",
    links: [
      "Facturación electrónica",
      "Nómina electrónica",
      "POS electrónico",
      "Documento soporte",
      "Eventos RADIAN",
      "Ventas y compras",
      "Dashboard multicliente",
    ],
  },
  {
    title: "Soluciones",
    links: [
      "Para empresas",
      "Para pymes",
      "Para contadores",
      "Para grupos empresariales",
      "Conciliación de IVA",
      "Asistente con IA",
    ],
  },
  {
    title: "Recursos",
    links: [
      "Centro de ayuda",
      "Guías",
      "Preguntas frecuentes",
      "Blog",
      "Contactar soporte",
      "Estado del servicio",
      "Novedades",
    ],
  },
  {
    title: "Empresa",
    links: [
      "Acerca de Nuvvi",
      "Contacto",
      "Trabaja con nosotros",
      "Seguridad",
    ],
  },
  {
    title: "Legal",
    links: [
      "Términos y condiciones",
      "Política de privacidad",
      "Tratamiento de datos",
      "Política de cookies",
      "Uso de inteligencia artificial",
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#D9ECFA]">
      <div className="max-w-[1240px] mx-auto px-5 md:px-8 lg:px-10 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo-favicon-nuvvi.png" alt="Nuvvi" className="h-10 w-10" />
              <span className="text-[#102F4B] font-bold text-lg font-manrope">NUVVI</span>
            </div>
            <p className="text-sm text-[#6C8398] leading-relaxed mb-3">
              Facturación electrónica, documentos y control operativo en una plataforma diseñada para hacerlo más sencillo.
            </p>
            <p className="text-xs text-[#6C8398]">Colombia</p>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold text-[#6C8398] uppercase tracking-wider mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link to="#" className="text-sm text-[#39566F] hover:text-[#246FC1] transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-[#D9ECFA] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#6C8398]">
            &copy; {new Date().getFullYear()} Nuvvi. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link to="#" className="text-xs text-[#6C8398] hover:text-[#246FC1] transition-colors">
              Estado del servicio
            </Link>
            <Link to="#" className="text-xs text-[#6C8398] hover:text-[#246FC1] transition-colors">
              soporte@nuvvi.co
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
