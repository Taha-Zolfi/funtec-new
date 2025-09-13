// src/app/[locale]/about/About.js
"use client"; // Required because it uses the useTranslation hook.

import dynamic from "next/dynamic";
import { useTranslation } from 'react-i18next';
import "./About.css";

// Dynamically import the client component to ensure it's not rendered on the server.
// This is crucial for animations and hooks like useEffect/useState.
const AboutClient = dynamic(() => import("./AboutClient"), {
  ssr: false,
  loading: () => <div className="about-loading"><div className="loading-spinner"></div></div>,
});

export default function AboutPage() {
  const { t } = useTranslation('about');

  // Fetch and structure all the data from the 'about.json' namespace.
  // The { returnObjects: true } option is essential for fetching arrays and objects.
  const pageData = {
    hero: t('hero', { returnObjects: true }),
    statData: t('statData', { returnObjects: true }),
    vision: t('vision', { returnObjects: true }),
    mission: t('mission', { returnObjects: true }),
    whyChooseUs: t('whyChooseUs', { returnObjects: true }),
    features: t('features', { returnObjects: true }),
    values: t('values', { returnObjects: true }),
    valuesData: t('valuesData', { returnObjects: true }),
    process: t('process', { returnObjects: true }),
    team: t('team', { returnObjects: true }),
    timeline: t('timeline', { returnObjects: true }),
    cta: t('cta', { returnObjects: true }),
    ctaFeatures: t('ctaFeatures', { returnObjects: true }),
  };

  // Pass the single, organized data object to the client component.
  return <AboutClient data={pageData} />;
}