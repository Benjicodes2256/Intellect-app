import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import AuthPanel from '@/components/landing/AuthPanel';
import HowItWorksTicker from '@/components/landing/HowItWorksTicker';
import Footer from '@/components/landing/Footer';

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  // If someone followed an invite link like /?invite=/debate/123
  // we pass the destination through to Clerk so they land there after sign-up
  const { invite } = await searchParams;

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
          padding: '52px 0 66px',
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <Hero />
        <AuthPanel redirectUrl={invite} />
      </main>

      {/* How it works ticker */}
      <HowItWorksTicker />

      {/* Footer */}
      <Footer />
    </>
  );
}

