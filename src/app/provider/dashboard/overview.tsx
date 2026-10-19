import { Star } from "lucide-react";

export default function Stars({ value }: { value: number }) {
  const n = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span
      role="img"
      aria-label={`${n} out of 5 stars`}
      className="inline-flex items-center gap-0.5 text-[#8E2B5C]"
    >
      {Array.from({ length: n }, (_, i) => (
        <Star key={i} size="1em" fill="currentColor" aria-hidden="true" />
      ))}
      <span className="inline-flex items-center gap-0.5 text-[#C99AB5]">
        {Array.from({ length: 5 - n }, (_, i) => (
          <Star key={i} size="1em" fill="currentColor" aria-hidden="true" />
        ))}
      </span>
    </span>
  );
}