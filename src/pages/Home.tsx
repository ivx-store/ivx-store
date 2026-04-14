import { lazy, Suspense } from "react";
import { PageLayout } from "../components/PageLayout";
import { Hero } from "../components/Hero";
import { AboutUs } from "../components/AboutUs";
import { Services } from "../components/Services";
import { OffersSection } from "../components/OffersSection";
import { Packages } from "../components/Packages";
import { WhyChooseUs } from "../components/WhyChooseUs";
import { PartnersSection } from "../components/PartnersSection";
import { OurServices } from "../components/OurServices";

// Lazy load heavy components (Recharts is ~200KB)
const DataSection = lazy(() => import("../components/DataSection").then(m => ({ default: m.DataSection })));

export function Home() {
  return (
    <PageLayout>
      <section id="home"><Hero /></section>
      <section id="about"><AboutUs /></section>
      <section id="services"><Services /></section>
      <section id="our-services"><OurServices /></section>
      <section id="offers"><OffersSection /></section>
      <section id="packages"><Packages /></section>
      <section id="why-us"><WhyChooseUs /></section>
      <section id="partners"><PartnersSection /></section>
      <section id="stats">
        <Suspense fallback={<div className="h-[400px] bg-black" />}>
          <DataSection />
        </Suspense>
      </section>
    </PageLayout>
  );
}
