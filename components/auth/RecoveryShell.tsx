import Link from "next/link";
import { Brand } from "./Brand";

export function RecoveryShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-white px-5 py-7 text-[#0f1419] sm:px-8">
      <header className="mx-auto flex w-full max-w-[1180px] items-center">
        <Link href="/login" aria-label="Bandhanaa login">
          <Brand compact />
        </Link>
      </header>
      <section className="mx-auto flex min-h-[calc(100dvh-110px)] w-full max-w-[430px] items-center py-10">
        <div className="w-full">{children}</div>
      </section>
    </main>
  );
}
