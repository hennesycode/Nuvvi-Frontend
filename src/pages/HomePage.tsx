import { useEffect } from "react";
import { Header } from "@/components/home/Header";
import { Hero } from "@/components/home/Hero";
import { IntegralProposition } from "@/components/home/IntegralProposition";
import { ProblemSolution } from "@/components/home/ProblemSolution";
import { ProductEcosystem } from "@/components/home/ProductEcosystem";
import { VatReconciliation } from "@/components/home/VatReconciliation";
import { AiAssistant } from "@/components/home/AiAssistant";
import { HowItWorks } from "@/components/home/HowItWorks";
import { MultiCompanyDashboard } from "@/components/home/MultiCompanyDashboard";
import { AudienceTabs } from "@/components/home/AudienceTabs";
import { SecuritySection } from "@/components/home/SecuritySection";
import { SupportSection } from "@/components/home/SupportSection";
import { FAQ } from "@/components/home/FAQ";
import { FinalCTA } from "@/components/home/FinalCTA";
import { Footer } from "@/components/home/Footer";
import { CloudBackground } from "@/components/home/CloudBackground";

export function HomePage() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    return () => {
      document.documentElement.classList.add("dark");
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#39566F] font-sans antialiased">
      <SkipLink />
      <Header />
      <main id="main-content">
        <Hero />
        <IntegralProposition />
        <ProblemSolution />
        <div className="relative">
          <CloudBackground />
          <ProductEcosystem />
        </div>
        <VatReconciliation />
        <AiAssistant />
        <HowItWorks />
        <MultiCompanyDashboard />
        <AudienceTabs />
        <SecuritySection />
        <SupportSection />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Nuvvi",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description:
              "Plataforma para centralizar facturación electrónica, documentos electrónicos, ventas, compras y gestión multiempresa en Colombia.",
            url: "http://localhost:8002/",
            offers: {
              "@type": "Offer",
              availability: "https://schema.org/PreOrder",
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              { "@type": "Question", name: "¿Qué es Nuvvi?", acceptedAnswer: { "@type": "Answer", text: "Nuvvi es una plataforma para centralizar procesos de facturación electrónica, documentos electrónicos, ventas, compras y gestión multiempresa." } },
              { "@type": "Question", name: "¿Cómo funciona la conciliación de IVA?", acceptedAnswer: { "@type": "Answer", text: "Nuvvi relaciona información de ventas y compras por periodo, tercero, documento y tipo de impuesto para facilitar la revisión y señalar posibles diferencias." } },
              { "@type": "Question", name: "¿Puedo gestionar más de una empresa?", acceptedAnswer: { "@type": "Answer", text: "El dashboard multicliente está pensado para contadores, equipos administrativos y grupos empresariales que necesitan cambiar entre varias empresas desde una misma cuenta." } },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Nuvvi",
            url: "http://localhost:8002/",
            description: "Facturación electrónica DIAN y control de IVA",
          }),
        }}
      />
    </div>
  );
}

function SkipLink() {
  return (
    <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#4F9FF0] focus:text-white focus:rounded-xl focus:font-semibold focus:text-sm">
      Saltar al contenido
    </a>
  );
}
