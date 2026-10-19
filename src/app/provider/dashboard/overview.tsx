export default function Stars({ value }: { value: number }) {
  const n = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span
      role="img"
      aria-label={`${n} out of 5 stars`}
      className="tracking-wider text-[#8E2B5C]"
    >
      {"★".repeat(n)}
      <span className="text-[#C99AB5]">{"★".repeat(5 - n)}</span>
    </span>
  );
}