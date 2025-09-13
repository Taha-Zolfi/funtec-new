'use client';

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';

export default function TranslationsProvider({ children, locale = 'fa', namespaces = ['common'], resources = null }) {
  const [i18n, setI18n] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Dynamically import heavy i18n modules on the client only
        const [{ default: initTranslations }, i18nextModule] = await Promise.all([
          import('@/app/i18n'),
          import('i18next')
        ]);
        const { createInstance } = i18nextModule;
        const i18nInstance = createInstance();
        await initTranslations(locale, namespaces, i18nInstance, resources);
        if (mounted) setI18n(i18nInstance);
      } catch (err) {
        console.error('Failed to initialize translations:', err);
      }
    })();
    return () => { mounted = false; };
  }, [locale, JSON.stringify(namespaces), resources]);

  // Until i18n is ready, render children so server-side layout still works.
  if (!i18n) return <>{children}</>;

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}