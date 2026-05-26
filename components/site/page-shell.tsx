import { ReactNode } from "react";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

export function PageHeader({
  section,
  title,
  subtitle,
}: {
  section: string;
  title: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <header className="border-b border-border bg-surface/30">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-20 lg:py-28">
        <div className="text-[11px] font-mono uppercase tracking-widest text-muted mb-5">
          {section}
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-[-0.03em] font-semibold leading-[1.04] max-w-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-7 text-lg text-muted-strong max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}

export function Section({
  number,
  label,
  title,
  children,
}: {
  number?: string;
  label?: string;
  title?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-20 lg:py-28">
        {(number || label) && (
          <div className="text-[11px] font-mono uppercase tracking-widest text-muted mb-4">
            {number && <span>[{number}] · </span>}
            {label}
          </div>
        )}
        {title && (
          <h2 className="text-2xl lg:text-4xl tracking-[-0.03em] font-semibold leading-[1.1] mb-10 max-w-3xl">
            {title}
          </h2>
        )}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">{children}</div>
      </div>
    </section>
  );
}
