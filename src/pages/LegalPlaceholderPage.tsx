export function LegalPlaceholderPage() {
  return (
    <div className="min-h-screen bg-white pt-28 pb-20">
      <div className="max-w-[780px] mx-auto px-5 md:px-8 lg:px-10">
        <div className="bg-[#FFFBE6] rounded-2xl p-6 border border-[#F5E6C8] mb-8">
          <p className="text-sm text-[#6C8398]">
            <strong className="text-[#0B2944]">Aviso:</strong> Este documento debe ser revisado y aprobado por el equipo jurídico de Nuvvi antes de su publicación definitiva.
          </p>
        </div>

        <div className="prose prose-slate max-w-none">
          <h1 className="text-2xl font-bold text-[#102F4B] font-manrope" id="page-title">Documento legal</h1>
          <p className="text-[#6C8398]">
            Este espacio está reservado para el contenido legal correspondiente. Los textos definitivos serán publicados una vez aprobados por el equipo jurídico de Nuvvi.
          </p>

          <div className="mt-8 p-6 bg-[#F8FCFF] rounded-xl border border-[#D9ECFA] space-y-3 text-sm text-[#6C8398]">
            <p><strong className="text-[#0B2944]">Información requerida para completar este documento:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Razón social</li>
              <li>NIT</li>
              <li>Dirección</li>
              <li>Ciudad</li>
              <li>Correo legal</li>
              <li>Correo de privacidad</li>
              <li>Responsable del tratamiento</li>
              <li>Fecha de vigencia</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
