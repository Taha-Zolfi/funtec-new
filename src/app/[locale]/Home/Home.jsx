// مسیر: src/app/[locale]/Home/Home.jsx

"use client";

import HomeClient from './HomeClient';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home({ onReady }) {
  const { t, i18n } = useTranslation('home');
  const router = useRouter();

  const createLocalizedPath = (path) => {
    if (path.startsWith('#')) {
      return `/${i18n.language}/${path}`;
    }
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `/${i18n.language}${cleanPath}`;
  };

  return (
    <>
      {/* پاس دادن زبان فعلی به HomeClient */}
      <HomeClient onReady={onReady} locale={i18n.language}>
        <div className="content-container">
          <div className="main">
            <h1 className="h-title">{t('mainTitle')}</h1>
            <p className="subtitle">{t('subtitle')}</p>

            <div className="home-buttons">
              <Link href={createLocalizedPath('/products')} className="home-btn gallery">
                {t('galleryButton')}
              </Link>
              
              <button 
                className="home-btn contact" 
                type="button" 
                onClick={() => router.push(createLocalizedPath('/#contact'))}
              >
                {t('contactButton')}
              </button>
            </div>
          </div>

          <div className="visually-hidden" aria-hidden="true">
            <section itemScope itemType="https://schema.org/Organization">
              <h2 itemProp="name">{t('seo.title')}</h2>
              <p itemProp="description">{t('seo.description')}</p>
              <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                <span itemProp="addressLocality">{t('seo.addressLocality')}</span>
                <span itemProp="streetAddress">{t('seo.streetAddress')}</span>
              </div>
              <div itemProp="contactPoint" itemScope itemType="https://schema.org/ContactPoint">
                <span itemProp="telephone">+989191771727</span>
              </div>
            </section>
          </div>
        </div>
      </HomeClient>
    </>
  );
}