import { useMemo } from "react";
import HomeClient from "./HomeClient";

export const metadata = {
  title: "فان تک: مرکز لیزرتگ، لیزرماز و اتاق وحشت | رزرو آنلاین",
  description:
    "به دنبال نهایت هیجان و آدرنالین هستید؟ فان تک، بزرگترین مرکز بازی‌های گروهی لیزرتگ، لیزر ماز و ترسناک‌ترین اتاق‌های فرار. برای یک تجربه بی‌نظیر، آنلاین رزرو کنید.",
  openGraph: {
    title: "فان تک: تولید و فروش وسایل شهربازی ، لیزرتگ، لیزرماز و اتاق وحشت",
    description: "تجربه هیجان واقعی با مدرن‌ترین بازی‌های گروهی.",
    url: "https://funtec.ir",
    images: [
      { url: "https://funtec.ir/logo.png" },
    ],
    type: "website",
  },
};

export default function Home() {
  const schemaData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "EntertainmentBusiness",
    name: "فان تک",
    description: "مرکز سرگرمی‌های هیجانی شامل لیزرتگ، لیزر ماز و اتاق‌های فرار ترسناک.",
    url: "https://funtec.ir",
    telephone: "+989191771727",
    address: {
      "@type": "PostalAddress",
      streetAddress: "میدان ولی عصر نبش خیابان فتحی شقاقی برج بلورین",
      addressLocality: "تهران",
      addressRegion: "تهران",
      addressCountry: "IR",
    },
    makesOffer: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "بازی لیزرتگ" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "بازی لیزر ماز" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "اتاق وحشت (اتاق فرار)" } },
    ],
    image: "https://funtec.ir/logo.png",
  }), []);

  return (
    <HomeClient
      title="فان تک"
      subtitle="ساخت و فروش دستگاه های شهربازی"
      productButtonText="مشاهده محصولات"
      contactButtonText="تماس با ما"
      schemaData={schemaData}
    />
  );
}