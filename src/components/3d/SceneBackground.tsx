import { env } from "@/config/env";

interface SceneBackgroundProps {
  className?: string;
}

export function SceneBackground({ className }: SceneBackgroundProps) {
  if (!env.ENABLE_3D) return null;

  return (
    <div className={className}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020f0b]/60 to-[#020f0b]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,255,179,0.03)_0%,_transparent_70%)]" />
    </div>
  );
}
