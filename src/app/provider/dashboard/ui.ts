// Heading font (Fraunces)
export const display = "font-[family-name:var(--font-display)]";

export const card =
  "rounded-3xl bg-white p-5 ring-1 ring-[#EBD3E0]/70 shadow-[0_1px_2px_rgba(111,29,68,0.06),0_16px_40px_-20px_rgba(111,29,68,0.28)] sm:p-7";

export const cardTitle = `${display} text-xl font-semibold tracking-tight text-[#2B0F20] sm:text-2xl`;

export const input =
  "w-full rounded-2xl border border-[#E3C6D6] bg-white px-4 py-3.5 text-base text-[#2B0F20] outline-none transition placeholder:text-[#B796A8] focus:border-[#8E2B5C] focus:ring-4 focus:ring-[#8E2B5C]/10";

const btn =
  "inline-flex min-h-12 items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#8E2B5C]/25 disabled:opacity-60";

export const btnPrimary = `${btn} bg-[#8E2B5C] text-white hover:bg-[#7a2548]`;
export const btnOutline = `${btn} border border-[#8E2B5C] bg-white text-[#8E2B5C] hover:bg-[#F6E6F0]`;
export const btnDanger = `${btn} bg-red-600 text-white hover:bg-red-700`;