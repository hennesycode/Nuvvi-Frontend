import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { env } from "@/config/env";
import { useLogin } from "@/hooks/use-auth";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError("");
    try {
      await loginMutation.mutateAsync(data);
      toast.success("Bienvenido a Nuvvi");
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Error al iniciar sesión";
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020f0b] p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,255,179,0.06)_0%,_transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-br from-nuvvi to-teal flex items-center justify-center">
              <span className="text-black font-bold text-lg">N</span>
            </div>
            <h1 className="text-2xl font-bold text-gradient">{env.APP_NAME}</h1>
            <p className="text-sm text-muted">by Hennesy</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs text-muted">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  placeholder="admin@nuvvi.local"
                  className={cn(
                    "w-full h-10 pl-10 pr-3 rounded-lg bg-white/5 border text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-nuvvi/30 transition-all",
                    errors.email ? "border-red-500/50" : "border-card-border"
                  )}
                />
              </div>
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  {...register("password")}
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={cn(
                    "w-full h-10 pl-10 pr-3 rounded-lg bg-white/5 border text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-nuvvi/30 transition-all",
                    errors.password ? "border-red-500/50" : "border-card-border"
                  )}
                />
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              <LogIn size={16} className="mr-2" />
              {isSubmitting ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted">
            Nuvvi by Hennesy — v1.0.0
          </p>
        </div>
      </motion.div>
    </div>
  );
}
