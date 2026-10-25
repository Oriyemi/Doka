import Image from "next/image";

export default function StoreAvatar({
  name,
  logoUrl,
  className = "h-20 w-20 rounded-3xl text-4xl",
}: {
  name: string;
  logoUrl: string | null;
  className?: string;
}) {
  const initial = name.trim()[0]?.toUpperCase() ?? "D";

  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-[#6F1D44] font-semibold text-white ring-4 ring-white ${className}`}
    >
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={`${name} logo`}
          fill
          sizes="96px"
          className="object-cover"
        />
      ) : (
        initial
      )}
    </span>
  );
}