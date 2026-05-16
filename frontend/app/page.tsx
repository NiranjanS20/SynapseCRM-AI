import { GlassNavbar } from "@/components/navigation/glass-navbar";
import { HeroSection } from "@/features/landing/hero-section";
import { BentoFeatures } from "@/features/landing/bento-features";
import { WhyChooseUs } from "@/features/landing/why-choose-us";
import { AboutSection } from "@/features/landing/about-section";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <GlassNavbar />
      <HeroSection />
      <BentoFeatures />
      <WhyChooseUs />
      <AboutSection />
      
      <footer className="border-t border-white/10 bg-slate-950 py-12">
        <div className="container mx-auto px-4 text-center text-slate-500">
          <p>&copy; {new Date().getFullYear()} SynapseCRM AI. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
