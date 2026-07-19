import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppRoutes } from "@/routes";

function SessionGuard() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = () => {
      if (location.pathname !== "/login") {
        navigate("/login", { replace: true });
      }
    };
    window.addEventListener("nuvvi:session-expired", handler);
    return () => window.removeEventListener("nuvvi:session-expired", handler);
  }, [navigate, location.pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <SessionGuard />
      <AppRoutes />
    </>
  );
}
