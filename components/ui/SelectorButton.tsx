import { cn } from "@/lib/utils/cn";

interface SelectorButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function SelectorButton({ label, selected, onClick }: SelectorButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "px-3 py-2 rounded-sm border transition-all duration-150 whitespace-nowrap cursor-pointer text-center",
        "font-mohave text-body-sm min-h-[44px] min-w-[56px] flex-1",
        selected
          ? "bg-white border-white text-[#0A0A0A]"
          : "bg-background-input border-border text-text-secondary hover:border-[rgba(255,255,255,0.25)] hover:text-text-primary"
      )}
    >
      {label}
    </button>
  );
}
