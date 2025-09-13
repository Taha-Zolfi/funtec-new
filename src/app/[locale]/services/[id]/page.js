"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle2, Star } from 'lucide-react';
import Link from 'next/link';
import "./service-detail.css";

export default function ServiceDetailPage({ params }) {
  const { t } = useTranslation('services');
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (params.id) {
      api.getService(params.id)
        .then(data => {
          setService(data);
export default function ServiceDetailPage() {
  const params = useParams();
  const { t } = useTranslation('services');
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);
  const id = params?.id;
  const locale = params?.locale || 'fa';

  useEffect(() => {
    if (id) {
      api.getService(id)
        .then(data => {
          setService(data);
          return api.getServices({});
        })
        .then(list => {
          const items = Array.isArray(list) ? list : [];
          const rel = items
            .filter(s => s.id !== id)
            .slice(0, 4);
          setRelated(rel);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);
  if (!service) {
    return (
      <div className="service-detail-error">
        <h1>{t('serviceDetail.notFound')}</h1>
        <Link href="/services" className="back-link">
          <ArrowLeft size={20} />
          <span>{t('serviceDetail.backToServices')}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="service-detail-page" dir="rtl">
      <div className="service-detail-hero">
        <img 
          src={service.images || '/placeholder.webp'} 
          alt={service.name} 
          className="service-detail-image" 
        />
        <div className="service-detail-overlay">
          <Link href={`/${params?.locale}/services`} className="back-link">
            <ArrowLeft size={20} />
            <span>بازگشت به خدمات</span>
          </Link>
          <h1 className="service-detail-title">{service.name}</h1>
          <Link href={`/${locale}/services`} className="back-link">
      </div>

      <div className="service-detail-content">
        <div className="service-detail-features">
          <div className="feature">
            <CheckCircle2 size={20} />
            <span>کیفیت تضمینی</span>
          </div>
          <div className="feature">
            <Star size={20} />
            <span>پشتیبانی ۲۴/۷</span>
          </div>
        </div>

        <div className="service-detail-description">
          <h2>توضیحات</h2>
          <div className="description-content">{service.description}</div>
        </div>

        <div className="service-detail-cta">
          <h3>علاقه‌مند به استفاده از این خدمات هستید؟</h3>
          <p>برای کسب اطلاعات بیشتر و مشاوره رایگان با ما تماس بگیرید</p>
          <div className="cta-buttons">
            <a href="tel:09904772771" className="cta-button primary">
              تماس مستقیم
            </a>
            <a href="https://wa.me/989191771727" target="_blank" rel="noopener noreferrer" className="cta-button secondary">
              ارتباط در واتساپ
            </a>
          </div>
        </div>

        {related.length > 0 && (
          <div className="related-services">
            <h3>خدمات مرتبط</h3>
            <div className="related-grid">
              {related.map((item) => (
                <Link key={item.id} href={`/${params?.locale}/services/${item.id}`} className="related-card">
                  <img src={item.images || '/placeholder.webp'} alt={item.name} />
                  <div className="related-info">
              {related.map((item) => (
                <Link key={item.id} href={`/${locale}/services/${item.id}`} className="related-card">
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
