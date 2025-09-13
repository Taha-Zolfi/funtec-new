// src/app/i18n.js

import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next/initReactI18next';
import resourcesToBackend from 'i18next-resources-to-backend';

// تابع باید اولین ورودی‌اش locale باشد، نه params
const initTranslations = async (locale, namespaces, i18nInstance, resources) => {
  const finalLocale = locale || 'fa';

  i18nInstance = i18nInstance || createInstance();
  i18nInstance.use(initReactI18next);

  if (!resources) {
    i18nInstance.use(resourcesToBackend((language, namespace) => 
      import(`@/locales/${language}/${namespace}.json`)
    ));
  }

  await i18nInstance.init({
    lng: finalLocale,
    resources,
    fallbackLng: 'fa',
    supportedLngs: ['fa', 'en', 'ar'],
    defaultNS: namespaces[0],
    fallbackNS: namespaces[0],
    ns: namespaces,
    preload: resources ? Object.keys(resources) : ['fa', 'en', 'ar'],
  });

  return {
    i18n: i18nInstance,
    resources: i18nInstance.services.resourceStore.data,
    t: i18nInstance.t,
  };
};

export default initTranslations;