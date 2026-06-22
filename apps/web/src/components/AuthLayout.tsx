import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-stone-50">
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-black lg:flex">
        {/* ghost "26" numerals */}
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center select-none text-[28rem] font-black leading-none text-white/[0.06]"
        >
          26
        </div>

        <div className="relative z-10 flex flex-col items-center px-8">
          <img
            src="/fifa-trophy.png"
            alt="FIFA World Cup trophy"
            className="w-64 max-w-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
          />
          <p className="mt-6 text-3xl font-extrabold tracking-tight text-white">FIFA</p>
        </div>

        <p className="absolute bottom-14 left-0 right-0 text-center text-xl font-extrabold uppercase tracking-wide text-white">
          FIFA World Cup
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">{children}</div>
    </div>
  );
}
