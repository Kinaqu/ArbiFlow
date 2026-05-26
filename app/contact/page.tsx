import type { Metadata } from "next";
import { Mail, MessageSquare, Code2, Hash } from "lucide-react";
import { PageShell, PageHeader, Section } from "@/components/site/page-shell";

export const metadata: Metadata = {
  title: "Contact — ArbiFlow",
  description: "How to reach the ArbiFlow team — email, social, GitHub.",
};

const channels = [
  {
    icon: Mail,
    name: "Email",
    handle: "hi@arbiflow.xyz",
    href: "mailto:hi@arbiflow.xyz",
    desc: "Best for partnership, integration, and press.",
  },
  {
    icon: Hash,
    name: "Twitter / X",
    handle: "@arbiflow",
    href: "https://twitter.com/arbiflow",
    desc: "Shipping updates and engine recalibrations.",
  },
  {
    icon: Code2,
    name: "GitHub",
    handle: "github.com/arbiflow",
    href: "https://github.com/arbiflow",
    desc: "Open data, public issue tracker, contributions welcome.",
  },
  {
    icon: MessageSquare,
    name: "Telegram",
    handle: "t.me/arbiflow",
    href: "https://t.me/arbiflow",
    desc: "Community chat and direct support.",
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
        subtitle="No support form. Just direct channels. We read everything that comes in."
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
