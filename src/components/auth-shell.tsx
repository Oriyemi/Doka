export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-white md:grid md:grid-cols-2">
      <section className="relative overflow-hidden rounded-b-[28px] bg-[#701E47] px-6 pb-7 pt-12 text-white md:flex md:flex-col md:rounded-none md:px-14 md:py-12">
        <div>
          <h1 className="text-2xl font-extrabold md:text-3xl">
            Doka<span className="text-white/60">.</span>
          </h1>
          <p className="mt-1 text-xs text-white/70 md:hidden">
            Every service. One market.
          </p>
        </div>

        <p className="hidden text-5xl font-extrabold leading-tight md:my-auto md:block">
          Every service.
          <br />
          One market.
        </p>

        <div className="absolute -bottom-32 -right-24 hidden h-80 w-80 rounded-full bg-[#8C2B5C] md:block" />
      </section>

      <section className="flex justify-center px-6 py-8 md:items-center md:px-10">
        <div className="w-full max-w-sm">{children}</div>
      </section>
    </main>
  );
}