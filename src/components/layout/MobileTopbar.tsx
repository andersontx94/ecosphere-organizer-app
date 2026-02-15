import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

type MobileTopbarProps = {
  onMenuClick: () => void;
};

export default function MobileTopbar({ onMenuClick }: MobileTopbarProps) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 bg-card/70 px-4 py-3 shadow-[var(--shadow-sm)] backdrop-blur md:hidden">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onMenuClick}
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="text-sm font-semibold tracking-tight text-foreground">
        EcoSphere Organizer
      </div>
      <div className="h-10 w-10" aria-hidden />
    </div>
  );
}
