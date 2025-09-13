// مسیر: src/app/[locale]/Nav/LanguageSwitcher.jsx

"use client";

import React from 'react';
import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { Globe, Check } from 'lucide-react';
import './LanguageSwitcher.css';

const languages = {
  fa: { name: 'فارسی' },
  en: { name: 'English' },
  ar: { name: 'العربية' },
};

const locales = ['fa', 'en', 'ar'];

const LanguageSwitcher = () => {
  const pathname = usePathname();
  const params = useParams();
  const [locale, setLocale] = React.useState('fa');

  React.useEffect(() => {
    try {
      const pLocale = params?.locale;
      if (pLocale) setLocale(pLocale);
      else if (pathname) {
        const parts = pathname.split('/').filter(Boolean);
        if (parts && parts.length > 0) setLocale(parts[0]);
      }
    } catch (e) {
      setLocale('fa');
    }
  }, [params, pathname]);

  const getRedirectedPath = (newLocale) => {
    if (!pathname) return '/';
    const segments = pathname.split('/');
    segments[1] = newLocale;
    return segments.join('/');
  };

  return (
    // منطق نمایش منو اکنون کاملا با CSS کنترل می‌شود
    <div className="language-switcher-sleek">
      <button 
        className="sleek-toggle" 
        aria-label="Change language" 
        aria-haspopup="true" 
      >
        <Globe className="globe-icon" size={22} />
      </button>

      {/* حذف شرط isOpen باعث می‌شود این بخش همیشه رندر شود و CSS بتواند آن را در موبایل نمایش دهد */}
      <div className="sleek-dropdown">
        <div className="dropdown-options">
          {locales.map((lang) => {
            const { name } = languages[lang];
            const isActive = lang === locale;
            return (
              <Link
                key={lang}
                href={getRedirectedPath(lang)}
                className={`sleek-item ${isActive ? 'active' : ''}`}
                style={{ pointerEvents: isActive ? 'none' : 'auto' }}
              >
                <span>{name}</span>
                {isActive && <Check size={18} className="check-icon" />}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;