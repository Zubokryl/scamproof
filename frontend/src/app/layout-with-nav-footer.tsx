import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function LayoutWithNavAndFooter({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      {children}
      <Footer />
    </>
  );
}