import { display } from "./ui";

export default function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1
          className={`${display} text-3xl font-semibold tracking-tight text-[#2B0F20] sm:text-4xl lg:text-5xl`}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6B4A5C] sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}