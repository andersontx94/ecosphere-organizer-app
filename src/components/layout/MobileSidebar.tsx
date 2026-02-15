import { useEffect } from "react";
import { X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";

type MobileSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <button
        type="button"
        aria-label="Fechar menu"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        className="relative h-full w-64"
        onClick={(event) => event.stopPropagation()}
      >
        <Sidebar className="h-full shadow-2xl" onNavigate={onClose} />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Fechar menu"
          className="absolute right-3 top-3 text-[hsl(var(--sidebar-foreground))]"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
