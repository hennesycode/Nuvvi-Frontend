import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020f0b]">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-gradient">404</h1>
        <p className="text-muted">Página no encontrada</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-nuvvi hover:underline"
        >
          <Home size={16} />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
