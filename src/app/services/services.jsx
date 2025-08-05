import { db } from "../api";
import dynamic from "next/dynamic";
import "./services.css";

import { Star, Users, Award, Zap, CheckCircle } from "lucide-react";
import { Suspense } from "react";
const ServicesClient = dynamic(() => import("./ServicesClient"), { ssr: false });

export const metadata = {
  title: "خدمات ساخت شهربازی | تجهیزات شهربازی | مشاوره و راه اندازی | فان تک",
  description: "ساخت شهربازی، فروش تجهیزات شهربازی، مشاوره راه اندازی شهربازی، خانه بازی کودک، نصب و راه‌اندازی دستگاه شهربازی با بهترین قیمت و کیفیت توسط تیم تخصصی فان تک.",
  keywords: [
    "ساخت شهربازی", "تجهیزات شهربازی", "خرید وسایل شهربازی", "راه اندازی شهربازی", "خانه بازی کودک", "دستگاه شهربازی", "قیمت تجهیزات شهربازی", "مشاوره شهربازی", "فروش دستگاه شهربازی", "تعمیر تجهیزات شهربازی"
  ]
};

export default async function Services() {
  // Server-side data fetching for SEO and performance
  let allServices = [];
  try {
    allServices = await db.getServices();
  } catch {}
  if (!allServices || !Array.isArray(allServices)) allServices = [];

  const BASE_URL = "https://funtec.ir";
  const mappedServices = allServices.map((service) => {
    let processedImages = [];
    const rawImagesFromAPI = service.images;
    if (Array.isArray(rawImagesFromAPI)) {
      processedImages = rawImagesFromAPI;
    } else if (typeof rawImagesFromAPI === "string" && rawImagesFromAPI.trim() !== "") {
      processedImages = rawImagesFromAPI.split(",").map((img) => img.trim());
    }
    const finalImages = processedImages
      .filter((img) => img && typeof img === "string" && img.trim() !== "")
      .map((img) => {
        const path = img.trim().startsWith("/") ? img.trim() : `/${img.trim()}`;
        return `${BASE_URL}${path}`;
      });
    let mainImage =
      finalImages.length > 0
        ? finalImages[0]
        : `/placeholder.svg?height=600&width=600&text=${encodeURIComponent(service.title || "خدمت")}`;
    if (finalImages.length === 0 && service.image && typeof service.image === "string") {
      const path = service.image.trim().startsWith("/") ? service.image.trim() : `/${service.image.trim()}`;
      mainImage = `${BASE_URL}${path}`;
    }
    return {
      ...service,
      images: finalImages,
      mainImage: mainImage,
    };
  });

  return (
    <div className="services-page">
      {/* SEO content for bots only, visually hidden from users */}
      <div style={{position:'absolute',left:'-9999px',width:'1px',height:'1px',overflow:'hidden'}} aria-hidden="true">
        <h1>ساخت شهربازی | تجهیزات شهربازی | مشاوره راه اندازی شهربازی | خانه بازی کودک | فان تک</h1>
        <section>
          <h2>خدمات تخصصی ساخت شهربازی و تجهیزات شهربازی</h2>
          <ul>
            <li>ساخت شهربازی روباز و سرپوشیده</li>
            <li>فروش تجهیزات شهربازی و خانه بازی کودک</li>
            <li>نصب و راه‌اندازی دستگاه شهربازی</li>
            <li>مشاوره رایگان راه اندازی شهربازی</li>
            <li>تعمیر و نگهداری تجهیزات شهربازی</li>
            <li>قیمت تجهیزات شهربازی و دستگاه شهربازی</li>
          </ul>
        </section>
        <section>
          <h2>سوالات متداول خدمات شهربازی</h2>
          <dl>
            <dt>هزینه ساخت شهربازی چقدر است؟</dt>
            <dd>هزینه ساخت شهربازی بسته به متراژ، نوع تجهیزات و امکانات متفاوت است. برای دریافت مشاوره و برآورد قیمت تماس بگیرید.</dd>
            <dt>آیا تجهیزات شهربازی گارانتی دارند؟</dt>
            <dd>بله، تمامی تجهیزات شهربازی فان تک دارای گارانتی و خدمات پس از فروش هستند.</dd>
            <dt>آیا امکان مشاوره و طراحی سه‌بعدی وجود دارد؟</dt>
            <dd>بله، مشاوره و طراحی سه‌بعدی رایگان ارائه می‌شود.</dd>
          </dl>
        </section>
      </div>
      {/* Hero Section (static, SEO-friendly) */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Star className="hero-badge-icon" />
            <span>شرکت پیشرو در صنعت شهربازی</span>
          </div>
          <h1 className="hero-title">
            <span className="hero-title-main">چگونه یک شهربازی</span>
            <span className="hero-title-highlight">از صفر تا صد</span>
            <span className="hero-title-main">بسازیم؟</span>
          </h1>
          <p className="hero-subtitle">
            راهنمای کامل ساخت شهربازی با بهترین تجهیزات و خدمات تخصصی
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <Users className="hero-stat-icon" />
              <span className="hero-stat-number">500+</span>
              <span className="hero-stat-label">پروژه موفق</span>
            </div>
            <div className="hero-stat">
              <Award className="hero-stat-icon" />
              <span className="hero-stat-number">15+</span>
              <span className="hero-stat-label">سال تجربه</span>
            </div>
            <div className="hero-stat">
              <Zap className="hero-stat-icon" />
              <span className="hero-stat-number">24/7</span>
              <span className="hero-stat-label">پشتیبانی</span>
            </div>
          </div>
        </div>
      </section>
      {/* About Section (static, SEO-friendly) */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-content">
            <h2 className="about-title">شرکت فان تک، همراه شما در ساخت بهترین شهربازی</h2>
            <div className="about-text">
              <p>
                <strong>شرکت فان تک</strong> با بیش از 15 سال تجربه در زمینه طراحی، ساخت و نصب تجهیزات شهربازی،
                یکی از پیشروترین شرکت‌های ایران در این حوزه محسوب می‌شود. ما تمامی مراحل ساخت شهربازی از
                مشاوره اولیه تا راه‌اندازی نهایی را پوشش می‌دهیم.
              </p>
              <p>
                تیم متخصص ما شامل مهندسان مکانیک، برق، عمران و طراحان صنعتی است که با استفاده از
                جدیدترین تکنولوژی‌ها و استانداردهای بین‌المللی ایمنی، بهترین کیفیت را برای شما فراهم می‌کنند.
              </p>
            </div>
            <div className="about-features">
              <div className="about-feature">
                <CheckCircle className="about-feature-icon" />
                <span>استانداردهای بین‌المللی ایمنی</span>
              </div>
              <div className="about-feature">
                <CheckCircle className="about-feature-icon" />
                <span>گارانتی و خدمات پس از فروش</span>
              </div>
              <div className="about-feature">
                <CheckCircle className="about-feature-icon" />
                <span>طراحی سفارشی و منحصر به فرد</span>
              </div>
              <div className="about-feature">
                <CheckCircle className="about-feature-icon" />
                <span>مشاوره رایگان و بازدید محل</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Services List (Client) */}
      <Suspense fallback={<div>در حال بارگذاری خدمات...</div>}>
        <ServicesClient services={mappedServices} />
      </Suspense>
      {/* CTA Section (static, SEO-friendly) */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">منتظر چی هستی؟</h2>
            <p className="cta-subtitle">همین الان بیا انجامش بدیم!</p>
            <p className="cta-description">
              تیم متخصص فان تک آماده همکاری با شما برای ساخت بهترین شهربازی است.
              از مشاوره رایگان تا راه‌اندازی کامل، ما در کنار شما هستیم.
            </p>
            <div className="cta-buttons">
              <a href="tel:02112345678" className="cta-button primary">
                <Phone size={20} />
                تماس فوری
              </a>
              <a href="mailto:info@funtech.ir" className="cta-button secondary">
                مشاوره رایگان
              </a>
            </div>
            <div className="cta-contact">
              <p>📞 تماس: 021-12345678</p>
              <p>📧 ایمیل: info@funtech.ir</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}