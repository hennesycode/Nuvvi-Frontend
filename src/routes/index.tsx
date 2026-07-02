import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { TenantsPage } from "@/pages/TenantsPage";
import { PlansPage } from "@/pages/PlansPage";
import { SubscriptionsPage } from "@/pages/SubscriptionsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("access_token");
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
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
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
