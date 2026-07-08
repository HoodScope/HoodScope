import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { AnalyzeSection } from "@/components/landing/analyze-section";
import { InstallSection } from "@/components/landing/install-section";
import { StatsBar } from "@/components/landing/sections";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/sections";
import { FAQ } from "@/components/landing/faq";
import { CtaSection } from "@/components/landing/sections";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <AnalyzeSection />
        <InstallSection />
        <StatsBar />
        <Features />
        <HowItWorks />
        <FAQ />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
