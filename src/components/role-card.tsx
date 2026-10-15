import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type RoleCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  selected: boolean;
  onSelect: () => void;
};

export function RoleCard({
  title,
  description,
  icon: Icon,
  selected,
  onSelect,
}: RoleCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`relative flex w-full items-center gap-4 rounded-2xl border-2 bg-white p-4 text-left transition md:flex-col md:items-start md:gap-5 md:p-6 ${
        selected
          ? "border-[#8C2B5C] ring-4 ring-[#8C2B5C]/10"
          : "border-transparent shadow-sm hover:border-[#D9A3BD]"
      }`}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#8C2B5C] text-white md:h-14 md:w-14">
        <Icon className="h-6 w-6" />
      </span>

      <span>
        <span className="block text-sm font-bold text-[#2A0A1B] md:text-base">
          {title}
        </span>
        <span className="mt-0.5 block text-xs text-gray-500 md:text-sm">
          {description}
        </span>
      </span>

      {selected && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#8C2B5C] text-white">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}