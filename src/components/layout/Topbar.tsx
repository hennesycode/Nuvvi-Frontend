import { Menu, Bell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/use-auth";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { logout } = useLogout();
  const navigate = useNavigate();

  return (
    <header className="flex h-16 items-center justify-between border-b border-card-border bg-[#010a07]/80 backdrop-blur-xl px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="text-muted hover:text-foreground lg:hidden transition-colors"
        >
          <Menu size={22} />
        </button>
        <div className="hidden lg:flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-nuvvi animate-glow-pulse" />
          <span className="text-xs text-muted">Sistema operativo</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell size={18} />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => { logout(); navigate("/login"); }}>
          <User size={18} />
        </Button>
      </div>
    </header>
  );
}
