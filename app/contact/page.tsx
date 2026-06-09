import type { Metadata } from "next";
import { MessageSquare, Code2 } from "lucide-react";
import { PageShell, PageHeader, Section } from "@/components/site/page-shell";

export const metadata: Metadata = {
  title: "Contact — ArbiFlow",
  description: "How to reach ArbiFlow — the project is open source on GitHub.",
};

const channels = [
  {
    icon: Code2,
    name: "GitHub",
    handle: "github.com/Kinaqu/ArbiFlow",
    href: "https://github.com/Kinaqu/ArbiFlow",
    desc: "Source, the on-chain demo, and the public issue tracker. The fastest way to reach us.",
  },
  {
    icon: MessageSquare,
    name: "Issues & discussion",
    handle: "github.com/Kinaqu/ArbiFlow/issues",
    href: "https://github.com/Kinaqu/ArbiFlow/issues",
    desc: "Bug reports, feature requests, partnership and integration questions.",
  },
];

export default function ContactPage() {
  return (
    <PageShell>
      <PageHeader
        section="[K] · Contact"
        title={
          <>
            Reach the{" "}
            <span className="gradient-text-gold">team.</span>
          </>
        }
        subtitle="No support form. The project is open source — reach us on GitHub."
      />

      <Section number="01" label="Channels" title="Pick the one that fits.">
        <div className="lg:col-span-12 grid sm:grid-cols-2 gap-3">
          {channels.map((c) => {
            const Icon = c.icon;
            return (
              <a
                key={c.name}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noopener" : undefined}
                className="rounded-xl border border-border bg-surface p-6 hover:border-border-strong transition-colors flex items-start gap-5"
              >
                <Icon className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium">{c.name}</div>
                  <div className="font-mono text-xs text-muted mt-0.5 truncate">
                    {c.handle}
                  </div>
                  <p className="mt-3 text-sm text-muted-strong leading-relaxed">
                    {c.desc}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </Section>
    </PageShell>
  );
}
