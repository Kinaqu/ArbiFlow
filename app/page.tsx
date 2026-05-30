import { Nav } from "@/components/landing/nav";
import { Ticker } from "@/components/landing/ticker";
import { Hero } from "@/components/landing/hero";
import { Problem } from "@/components/landing/problem";
import { Formula } from "@/components/landing/formula";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Opportunities } from "@/components/landing/opportunities";
import { RiskModel } from "@/components/landing/risk-model";
import { Protocols } from "@/components/landing/protocols";
import { PoweredBy } from "@/components/landing/powered-by";
import { Security } from "@/components/landing/security";
import { FAQ } from "@/components/landing/faq";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="flex-1">
      <Nav />
      <Ticker />
      <Hero />
      <Problem />
      <Formula />
      <HowItWorks />
      <Opportunities />
      <RiskModel />
      <Protocols />
      <PoweredBy />
      <Security />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
