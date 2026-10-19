import { LoaderCircle } from "lucide-react";

type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  label?: string;
  fullScreen?: boolean;
  className?: string;
};

const sizes = { sm: 20, md: 40, lg: 64 };

export default function Spinner({
  size = "md",
  label = "Loading...",
  fullScreen = true,
  className = "",
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 ${
        fullScreen ? "min-h-screen w-full" : "w-full py-8"
      } ${className}`}
    >
      <LoaderCircle
        size={sizes[size]}
        className="animate-spin text-[#6F1D44]"
        aria-hidden="true"
      />
      {label && <p className="text-sm text-[#6B4A5C]">{label}</p>}
      <span className="sr-only">{label}</span>
    </div>
  );
}