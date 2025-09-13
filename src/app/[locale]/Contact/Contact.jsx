// src/app/[locale]/Contact/Contact.jsx
"use client";
import ContactClient from './ContactClient';
import './Contact.css';
import { useTranslation } from 'react-i18next';

export default function ContactPage() {
  const { t, i18n } = useTranslation('contact'); // i18n را برای دسترسی به زبان فعلی اضافه می‌کنیم

  const departments = t('departments', { returnObjects: true });
  const socialLinks = t('socialLinks', { returnObjects: true });
  const addresses = t('addresses', { returnObjects: true });
  const footerText = t('footerText');

  return (
    // [مهم] اضافه کردن div اصلی با کلاس زبان برای کنترل کامل استایل
    <div className={`contact-page-wrapper lang-${i18n.language}`}>
      <ContactClient
        departments={departments}
        socialLinks={socialLinks}
        addresses={addresses}
        footerText={footerText}
      />
    </div>
  );
}