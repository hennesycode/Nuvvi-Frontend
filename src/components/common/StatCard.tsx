import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("glass rounded-xl p-5 space-y-3 group hover:border-nuvvi/25 transition-all duration-300", className)}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted font-medium tracking-wide uppercase">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-nuvvi/10 group-hover:bg-nuvvi/20 transition-colors">
          <Icon size={20} className="text-nuvvi" />
        </div>
      </div>
      {trend && (
        <p className="text-xs text-muted">{trend}</p>
      )}
    </motion.div>
  );
}
