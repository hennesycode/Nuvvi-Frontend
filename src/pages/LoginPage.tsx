import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const STAR_COUNT = 120;

function useStarfield() {
  return useMemo(() =>
    Array.from({ length: STAR_COUNT }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      delay: Math.random() * 6,
      duration: Math.random() * 3 + 2,
      opacityBase: Math.random() * 0.5 + 0.15,
      hue: Math.random() > 0.6 ? 213 : 0,
      saturation: Math.random() > 0.6 ? "50%" : "0%",
    })), []
  );
}
import { Mail, Lock, LogIn, AlertCircle, User, UserPlus, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { env } from "@/config/env";
import { useLogin, useRegister } from "@/hooks/use-auth";

const loginSchema = z.object({
  email: z.string().min(1, "Email o usuario requerido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

const registerSchema = z.object({
  nombres: z.string().min(2, "Mínimo 2 caracteres"),
  apellidos: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  tipo_identificacion: z.enum(["cedula", "nit"], { required_error: "Selecciona un tipo" }),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { tipo_identificacion: "cedula" },
  });

  const onLogin = async (data: LoginForm) => {
    setError("");
    try {
      await loginMutation.mutateAsync({ email: data.email, password: data.password });
      toast.success("Bienvenido a Nuvvi");
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Error al iniciar sesión";
      setError(msg);
      toast.error(msg);
    }
  };

  const onRegister = async (data: RegisterForm) => {
    setError("");
    try {
      await registerMutation.mutateAsync(data);
      toast.success("Registro exitoso. Revisa tu correo.");
      setMode("login");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Error al registrarse";
      setError(msg);
      toast.error(msg);
    }
  };

  const stars = useStarfield();

  const switchMode = (m: "login" | "register") => {
    setMode(m);
    setError("");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0C1E33] overflow-hidden p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#579BE9]/20 blur-[100px] animate-float-slow" />
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-[#80B9F7]/15 blur-[80px] animate-float-slower" />
        <div className="absolute top-1/3 right-1/4 w-[250px] h-[250px] rounded-full bg-[#94C8FC]/10 blur-[60px] animate-pulse-soft" />
        <div className="absolute bottom-1/4 left-1/3 w-[200px] h-[200px] rounded-full bg-[#69AAF0]/10 blur-[50px] animate-float-slow" style={{ animationDelay: "-3s" }} />

        <div className="absolute inset-0">
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute rounded-full"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                background: `hsl(${star.hue}, ${star.saturation}, 85%)`,
                boxShadow: `0 0 ${star.size * 2}px hsl(${star.hue}, ${star.saturation}, 75% / 0.3)`,
                "--tw-base": star.opacityBase * 0.6,
                "--tw-peak": Math.min(star.opacityBase * 2 + 0.2, 1),
                animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(87,155,233,0.08)_0%,_transparent_70%)]" />

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: var(--tw-base, 0.3); transform: scale(1); }
          50% { opacity: var(--tw-peak, 0.9); transform: scale(1.4); }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        <div className="glass rounded-[32px] p-8 md:p-10 space-y-6 shadow-2xl shadow-[#579BE9]/10">
          <div className="text-center space-y-3">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 180, damping: 14 }}
              className="flex justify-center"
            >
              <img
                src="/logo-favicon-nuvvi.png"
                alt="Nuvvi"
                className="h-28 w-28 md:h-32 md:w-32 object-contain drop-shadow-[0_0_20px_rgba(87,155,233,0.4)]"
              />
            </motion.div>
            <h1 className="text-3xl font-bold uppercase tracking-wider text-gradient mt-1">{env.APP_NAME}</h1>
            <p className="text-sm text-muted">by Hennesy</p>
          </div>

          <div className="flex bg-white/5 rounded-xl p-1">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={cn(
                  "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300",
                  mode === m
                    ? "bg-[#579BE9] text-white shadow-md shadow-[#579BE9]/30"
                    : "text-muted hover:text-foreground"
                )}
              >
                {m === "login" ? "Iniciar Sesión" : "Registrarse"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {mode === "login" ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                onSubmit={loginForm.handleSubmit(onLogin)}
                className="space-y-4"
              >
                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                    <AlertCircle size={16} className="shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs text-muted">Email o usuario</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      {...loginForm.register("email")}
                      type="text"
                      autoComplete="username"
                      placeholder="admin@nuvvi.local"
                      className={cn(
                        "w-full h-11 pl-10 pr-3 rounded-xl bg-white/5 border text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-[#579BE9]/30 transition-all",
                        loginForm.formState.errors.email ? "border-red-500/50" : "border-card-border"
                      )}
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-xs text-red-400">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted">Contraseña</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      {...loginForm.register("password")}
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className={cn(
                        "w-full h-11 pl-10 pr-3 rounded-xl bg-white/5 border text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-[#579BE9]/30 transition-all",
                        loginForm.formState.errors.password ? "border-red-500/50" : "border-card-border"
                      )}
                    />
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-xs text-red-400">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full h-11 rounded-xl" disabled={loginForm.formState.isSubmitting}>
                  <LogIn size={16} className="mr-2" />
                  {loginForm.formState.isSubmitting ? "Ingresando..." : "Ingresar"}
                </Button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                    className="text-sm text-[#69AAF0] hover:text-[#80B9F7] transition-colors hover:underline"
                  >
                    ¿No tienes cuenta? <span className="font-medium">Regístrate</span>
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={registerForm.handleSubmit(onRegister)}
                className="space-y-4"
              >
                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                    <AlertCircle size={16} className="shrink-0" />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted">Nombres</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                      <input
                        {...registerForm.register("nombres")}
                        type="text"
                        autoComplete="given-name"
                        placeholder="Juan"
                        className={cn(
                          "w-full h-11 pl-10 pr-3 rounded-xl bg-white/5 border text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-[#579BE9]/30 transition-all",
                          registerForm.formState.errors.nombres ? "border-red-500/50" : "border-card-border"
                        )}
                      />
                    </div>
                    {registerForm.formState.errors.nombres && (
                      <p className="text-xs text-red-400">{registerForm.formState.errors.nombres.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-muted">Apellidos</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                      <input
                        {...registerForm.register("apellidos")}
                        type="text"
                        autoComplete="family-name"
                        placeholder="Pérez"
                        className={cn(
                          "w-full h-11 pl-10 pr-3 rounded-xl bg-white/5 border text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-[#579BE9]/30 transition-all",
                          registerForm.formState.errors.apellidos ? "border-red-500/50" : "border-card-border"
                        )}
                      />
                    </div>
                    {registerForm.formState.errors.apellidos && (
                      <p className="text-xs text-red-400">{registerForm.formState.errors.apellidos.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted">Correo electrónico</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      {...registerForm.register("email")}
                      type="email"
                      autoComplete="email"
                      placeholder="correo@ejemplo.com"
                      className={cn(
                        "w-full h-11 pl-10 pr-3 rounded-xl bg-white/5 border text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-[#579BE9]/30 transition-all",
                        registerForm.formState.errors.email ? "border-red-500/50" : "border-card-border"
                      )}
                    />
                  </div>
                  {registerForm.formState.errors.email && (
                    <p className="text-xs text-red-400">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted">Tipo de identificación</label>
                  <div className="relative">
                    <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted z-10" />
                    <select
                      {...registerForm.register("tipo_identificacion")}
                      className={cn(
                        "w-full h-11 pl-10 pr-3 rounded-xl bg-white/5 border text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-[#579BE9]/30 transition-all",
                        registerForm.formState.errors.tipo_identificacion ? "border-red-500/50" : "border-card-border"
                      )}
                    >
                      <option value="cedula" className="bg-[#0C1E33]">Cédula</option>
                      <option value="nit" className="bg-[#0C1E33]">NIT</option>
                    </select>
                  </div>
                  {registerForm.formState.errors.tipo_identificacion && (
                    <p className="text-xs text-red-400">{registerForm.formState.errors.tipo_identificacion.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted">Contraseña</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      {...registerForm.register("password")}
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className={cn(
                        "w-full h-11 pl-10 pr-3 rounded-xl bg-white/5 border text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-[#579BE9]/30 transition-all",
                        registerForm.formState.errors.password ? "border-red-500/50" : "border-card-border"
                      )}
                    />
                  </div>
                  {registerForm.formState.errors.password && (
                    <p className="text-xs text-red-400">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full h-11 rounded-xl" disabled={registerForm.formState.isSubmitting}>
                  <UserPlus size={16} className="mr-2" />
                  {registerForm.formState.isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
                </Button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="text-sm text-[#69AAF0] hover:text-[#80B9F7] transition-colors hover:underline"
                  >
                    ¿Ya tienes cuenta? <span className="font-medium">Inicia sesión</span>
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
