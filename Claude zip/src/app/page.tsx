import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import AuthPanel from '@/components/landing/AuthPanel';
import HowItWorksTicker from '@/components/landing/HowItWorksTicker';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <>
      {/* Grain texture overlay */}
      <div className="grain" />

      {/* Fixed header */}
      <Navbar />

      {/* Main 2-col layout */}
      <main
        style={{
          position: 'relative',
          zIndex: 2,
          height: '100vh',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 0.95fr)',
          alignItems: 'center',
          padding: '52px 0 66px',   /* top = navbar, bottom = ticker + footer */
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <Hero />
        <AuthPanel />
      </main>

      {/* How it works ticker */}
      <HowItWorksTicker />

      {/* Footer */}
      <Footer />
    </>
  );
}
