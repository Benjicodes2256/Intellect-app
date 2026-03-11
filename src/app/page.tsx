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

      {/* Main layout — responsive via CSS class */}
      <main className="landing-main">
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

