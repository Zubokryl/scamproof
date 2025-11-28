import Image from "next/image";
import styles from "./page.module.css";

import Hero from '../components/Hero';
import LatestNews from '../components/LatestNews';
import CTASection from "../components/CTASection";
import LayoutWithNavAndFooter from "./layout-with-nav-footer";

export default function Home() {
  return (
    <LayoutWithNavAndFooter>
      <Hero />
      <LatestNews />
      <CTASection />
    </LayoutWithNavAndFooter>
  );
}