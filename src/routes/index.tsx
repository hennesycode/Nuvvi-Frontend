import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { TenantsPage } from "@/pages/TenantsPage";
import { PlansPage } from "@/pages/PlansPage";
import { SubscriptionsPage } from "@/pages/SubscriptionsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { ClientsPage } from "@/pages/admin/ClientsPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { CreatePasswordPage } from "@/pages/CreatePasswordPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { LegalPlaceholderPage } from "@/pages/LegalPlaceholderPage";

const legalRoutes = [
  "terminos-y-condiciones",
  "politica-de-privacidad",
  "politica-de-tratamiento-de-datos",
  "politica-de-cookies",
  "politica-de-uso-de-ia",
  "seguridad",
];

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("access_token");
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/crear-contrasena/:token" element={<CreatePasswordPage />} />
      {legalRoutes.map((path) => (
        <Route key={path} path={`/${path}`} element={<LegalPlaceholderPage />} />
      ))}
      <Route
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/clientes" element={<ClientsPage />} />
        <Route path="/admin/usuarios" element={<AdminUsersPage />} />
      </Route>
      <Route
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tenants" element={<TenantsPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
