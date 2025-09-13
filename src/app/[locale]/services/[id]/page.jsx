"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle2, Star } from 'lucide-react';
import Link from 'next/link';
import './service-detail.css';

export default function ServiceDetailPage() {
  const params = useParams();
  const { t } = useTranslation('services');
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);

  const id = params?.id;
  const locale = params?.locale || 'fa';

  useEffect(() => {
    setLoading(true);
    if (!id) return setLoading(false);
    api.getService(id)
      .then(data => {
        setService(data || null);
        return api.getServices({});
      })
      .then(list => {
        const items = Array.isArray(list) ? list : [];
        const rel = items.filter(s => String(s.id) !== String(id)).slice(0, 4);
        setRelated(rel);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="service-detail-loading">در حال بارگذاری...</div>;

  if (!service) {
    return (
      <div className="service-detail-error">
        <h1>{t('serviceDetail.notFound') || 'خدمت پیدا نشد'}</h1>
        <Link href={`/${locale}/services`} className="back-link">
          <ArrowLeft size={20} />
          <span>{t('serviceDetail.backToServices') || 'بازگشت به خدمات'}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="service-detail-page" dir={locale === 'fa' || locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="service-detail-hero">
        <img src={service.images || '/placeholder.webp'} alt={service.name} className="service-detail-image" />
        <div className="service-detail-overlay">
          <Link href={`/${locale}/services`} className="back-link">
            <ArrowLeft size={20} />
            <span>بازگشت به خدمات</span>
          </Link>
          <h1 className="service-detail-title">{service.name}</h1>
        </div>
      </div>

      <div className="service-detail-content">
        <div className="service-detail-features">
          <div className="feature"><CheckCircle2 size={20} /><span>کیفیت تضمینی</span></div>
          <div className="feature"><Star size={20} /><span>پشتیبانی ۲۴/۷</span></div>
        </div>

        <div className="service-detail-description">
          <h2>توضیحات</h2>
          <div className="description-content" dangerouslySetInnerHTML={{ __html: service.description || '' }} />
        </div>

        <div className="service-detail-cta">
          <h3>علاقه‌مند به استفاده از این خدمت هستید؟</h3>
          <p>برای کسب اطلاعات بیشتر و مشاوره رایگان با ما تماس بگیرید</p>
          <div className="cta-buttons">
            <a href="tel:09904772771" className="cta-button primary">تماس مستقیم</a>
            <a href="https://wa.me/989191771727" target="_blank" rel="noopener noreferrer" className="cta-button secondary">ارتباط در واتساپ</a>
          </div>
        </div>

        {related.length > 0 && (
          <div className="related-services">
            <h3>خدمات مرتبط</h3>
            <div className="related-grid">
              {related.map(item => (
                <Link key={item.id} href={`/${locale}/services/${item.id}`} className="related-card">
                  <img src={item.images || '/placeholder.webp'} alt={item.name} />
                  <div className="related-info"><h4>{item.name}</h4></div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
