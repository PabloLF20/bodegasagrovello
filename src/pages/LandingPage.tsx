import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { AboutSection } from '@/components/AboutSection';
import { WineSection } from '@/components/WineSection';
import { VisitsSection } from '@/components/VisitsSection';
import { BookingSection } from '@/components/BookingSection';
import { LocationSection } from '@/components/LocationSection';
import { FooterSection } from '@/components/FooterSection';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <WineSection />
        <VisitsSection />
        <BookingSection />
        <LocationSection />
      </main>
      <FooterSection />
    </div>
  );
}
