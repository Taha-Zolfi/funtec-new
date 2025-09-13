// src/app/[locale]/About/About.js

"use client"; // چون از هوک استفاده می‌کند

import dynamic from "next/dynamic";
import "./About.css";
import { useTranslation } from 'react-i18next'; // <-- استفاده از پکیج صحیح

const AboutClient = dynamic(() => import("./AboutClient"), {
  ssr: false,
  loading: () => <div className="about-loading"><div className="loading-spinner"></div></div>,
});

// ===== تابع getStaticProps و ایمپورت serverSideTranslations کاملاً حذف شده‌اند =====

export default function AboutPage() {
  const { t } = useTranslation('about');

  const missionData = {
    title: t('mission.title'),
    description: t('mission.description'),
    points: t('mission.points', { returnObjects: true })
  };

  const features = t('features', { returnObjects: true });
  const statData = t('statData', { returnObjects: true });
  const ctaFeatures = t('ctaFeatures', { returnObjects: true });

  return (
    <AboutClient
      missionData={missionData}
      features={features}
      statData={statData}
      ctaFeatures={ctaFeatures}
    />
  );
}