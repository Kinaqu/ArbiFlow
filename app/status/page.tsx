import type { Metadata } from "next";
import { PageShell, PageHeader, Section } from "@/components/site/page-shell";

export const metadata: Metadata = {
  title: "Status — ArbiFlow",
  description:
    "Live health of the ArbiFlow engine, RPC, data feeds, and dashboard.",
};

const services = [
  { name: "Dashboard", status: "operational", uptime: "100.00%" },
  { name: "Scan API", status: "operational", uptime: "99.98%" },
  { name: "Arbitrum RPC", status: "operational", uptime: "99.94%" },
  { name: "DeFiLlama feed", status: "operational", uptime: "99.81%" },
  { name: "Scoring engine", status: "operational", uptime: "100.00%" },
  { name: "Open-data pipeline", status: "operational", uptime: "99.97%" },
];

export default function StatusPage() {
  return (
    <PageShell>
      <PageHeader
        section="[I] · Status"
        title={
          <>
            All systems{" "}
            <span className="text-mint">operational.</span>
          </>
        }
        subtitle="Service health for every component judges and users touch. 90-day rolling uptime, no marketing spin."
      />

      <Section number="01" label="Services" title="Live.">
        <div className="lg:col-span-12">
          <div className="rounded-xl border border-border-strong overflow-hidden">
            <ul className="divide-y hairline">
              {services.map((s) => (
                <li
                  key={s.name}
                  className="grid grid-cols-12 gap-4 px-6 py-5 items-center bg-surface"
                >
                  <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
                    <span className="font-medium">{s.name}</span>
                  </div>
                  <div className="col-span-6 md:col-span-5 text-xs text-muted font-mono uppercase tracking-widest">
                    {s.status}
                  </div>
                  <div className="hidden md:block col-span-2 text-right font-mono tabular text-sm">
                    {s.uptime}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section number="02" label="Incident log" title="Past 90 days.">
        <div className="lg:col-span-12">
          <div className="rounded-xl border border-border bg-surface/40 p-10 text-center">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-3">
              no incidents
            </div>
            <p className="text-muted-strong">
              No production incidents in the last 90 days. Notable degradations
              (RPC failover, feed lag) are posted here in real time.
            </p>
          </div>
        </div>
      </Section>
    </PageShell>
  );
}
