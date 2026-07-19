import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/api/client";
import { Button } from "@/components/ui/button";
import { env } from "@/config/env";
import { cn } from "@/lib/utils";

const STAR_COUNT = 110;

function useStarfield() {
  return useMemo(() => Array.from({ length: STAR_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 2.2 + 0.5,
    delay: Math.random() * 6,
    duration: Math.random() * 3 + 2,
    opacityBase: Math.random() * 0.5 + 0.15,
  })), []);
}

function validatePassword(password: string, confirmPassword: string) {
  const errors: { password?: string; confirmPassword?: string } = {};
  if (password.length < 8) errors.password = "La contraseña debe tener mínimo 8 caracteres.";
  if (confirmPassword && password !== confirmPassword) errors.confirmPassword = "Las contraseñas no coinciden.";
  if (!confirmPassword) errors.confirmPassword = "Confirma tu contraseña.";
  return errors;
}

export function CreatePasswordPage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const stars = useStarfield();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState({ password: false, confirmPassword: false });
  const errors = validatePassword(password, confirmPassword);

  const invitationQuery = useQuery({
    queryKey: ["password-setup", token],
    queryFn: async () => {
      const { data } = await apiClient.get<{ full_name: string; email: string }>(`/auth/set-password/${token}/`);
      return data;
    },
    retry: false,
    enabled: !!token,
  });

  const setupMutation = useMutation({
    mutationFn: async () => apiClient.post(`/auth/set-password/${token}/`, {
      password,
      password_confirm: confirmPassword,
    }),
    onSuccess: () => {
      toast.success("Contraseña creada correctamente. Ahora puedes iniciar sesión.");
      navigate("/login", { replace: true });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "No se pudo crear la contraseña.");
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setTouched({ password: true, confirmPassword: true });
    if (Object.keys(errors).length) return;
    setupMutation.mutate();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0C1E33] p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] animate-float-slow rounded-full bg-[#579BE9]/20 blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 h-[420px] w-[420px] animate-float-slower rounded-full bg-[#80B9F7]/15 blur-[85px]" />
        <div className="absolute inset-0">
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacityBase,
                animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: .2; transform: scale(1); }
          50% { opacity: .9; transform: scale(1.35); }
        }
      `}</style>

      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.55, ease: "easeOut" }} className="relative w-full max-w-md">
        <div className="glass rounded-[32px] p-8 shadow-2xl shadow-[#579BE9]/10 md:p-10">
          <div className="text-center">
            <motion.img initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15, type: "spring", stiffness: 180, damping: 14 }} src="/logo-favicon-nuvvi.png" alt="Nuvvi" className="mx-auto h-28 w-28 object-contain drop-shadow-[0_0_20px_rgba(87,155,233,0.4)]" />
            <h1 className="mt-2 text-3xl font-bold uppercase tracking-wider text-gradient">{env.APP_NAME}</h1>
            <p className="mt-1 text-sm text-muted">Activación de cuenta administrativa</p>
          </div>

          {invitationQuery.isLoading && (
            <div className="mt-8 rounded-2xl border border-card-border bg-white/5 p-4 text-center text-sm text-muted">Validando enlace seguro...</div>
          )}

          {invitationQuery.isError && (
            <div className="mt-8 space-y-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-center">
              <AlertCircle className="mx-auto text-red-400" size={28} />
              <h2 className="font-bold text-foreground">Enlace no disponible</h2>
              <p className="text-sm leading-6 text-muted">El enlace no existe, expiró o ya fue utilizado. Solicita una nueva invitación al equipo administrador.</p>
              <Button onClick={() => navigate("/login")} className="h-11 rounded-xl">Ir al login</Button>
            </div>
          )}

          {invitationQuery.data && (
            <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} onSubmit={submit} className="mt-8 space-y-5">
              <div className="rounded-2xl border border-[#579BE9]/25 bg-[#579BE9]/10 p-4">
                <div className="mb-2 flex items-center gap-2 text-[#9CCBFF]"><ShieldCheck size={18} /><span className="text-sm font-bold">Enlace seguro verificado</span></div>
                <p className="text-sm leading-6 text-muted">Hola <strong className="text-foreground">{invitationQuery.data.full_name}</strong>, necesitas crear una contraseña para activar tu cuenta administrativa.</p>
              </div>

              <label className="block space-y-1.5">
                <span className="text-xs text-muted">Nueva contraseña</span>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input type="password" autoComplete="new-password" value={password} onBlur={() => setTouched((current) => ({ ...current, password: true }))} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo 8 caracteres" className={cn("h-11 w-full rounded-xl border bg-white/5 pl-10 pr-3 text-sm text-foreground outline-none transition-all placeholder:text-muted/50 focus:ring-2 focus:ring-[#579BE9]/30", touched.password && errors.password ? "border-red-500/50" : "border-card-border")} />
                </div>
                {touched.password && errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs text-muted">Confirmar contraseña</span>
                <div className="relative">
                  <CheckCircle2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input type="password" autoComplete="new-password" value={confirmPassword} onBlur={() => setTouched((current) => ({ ...current, confirmPassword: true }))} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repite tu contraseña" className={cn("h-11 w-full rounded-xl border bg-white/5 pl-10 pr-3 text-sm text-foreground outline-none transition-all placeholder:text-muted/50 focus:ring-2 focus:ring-[#579BE9]/30", touched.confirmPassword && errors.confirmPassword ? "border-red-500/50" : "border-card-border")} />
                </div>
                {touched.confirmPassword && errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword}</p>}
              </label>

              <Button type="submit" disabled={setupMutation.isPending} className="h-11 w-full rounded-xl">
                {setupMutation.isPending ? "Guardando..." : "Guardar contraseña"}
              </Button>
            </motion.form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
