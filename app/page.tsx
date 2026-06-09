import { Ticker } from "@/components/landing/ticker";
import { Hero } from "@/components/landing/hero";
import { Problem } from "@/components/landing/problem";
import { Formula } from "@/components/landing/formula";
import { HowItWorks } from "@/components/landing/how-it-works";
import { WhatsReal } from "@/components/landing/whats-real";
import { Opportunities } from "@/components/landing/opportunities";
import { RiskModel } from "@/components/landing/risk-model";
import { Protocols } from "@/components/landing/protocols";
import { PoweredBy } from "@/components/landing/powered-by";
import { Security } from "@/components/landing/security";
import { FAQ } from "@/components/landing/faq";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";
import { AntigravityField } from "@/components/landing/antigravity-field";
import { Stack, StackCard } from "@/components/landing/stack-section";

// Problem → CTA stack as glass cards over the shared particle field. Hero stays
// the standalone opener; Nav, Ticker, and Footer stay in normal flow.
const stacked = [
  Problem,
  Formula,
  HowItWorks,
  WhatsReal,
  Opportunities,
  RiskModel,
  Protocols,
  PoweredBy,
  Security,
  FAQ,
  CTA,
];

export default function Home() {
  return (
    <main className="flex-1">
      <AntigravityField />
      <Ticker />
      <Hero />
      <Stack count={stacked.length}>
        {stacked.map((Section, i) => (
          <StackCard key={Section.name} index={i}>
            <Section />
          </StackCard>
        ))}
      </Stack>
      <Footer />
    </main>
  );
}
