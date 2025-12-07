import Image from "next/image";
import styles from "./page.module.css";

import Hero from '../components/Hero';
import LatestNews from '../components/LatestNews';
import CTASection from "../components/CTASection";

export default function Home() {
  return (
    <>
      <Hero />
      <LatestNews />
      <CTASection />
    </>
  );
}