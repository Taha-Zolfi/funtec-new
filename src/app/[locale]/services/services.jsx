// مسیر: src/app/locale/services/services.jsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { useTranslation } from 'react-i18next';
import { ArrowRight, X, Star, CheckCircle2, Info, XCircle, MessageSquare } from 'lucide-react';
import "./services.css";

// Toast Notification
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icon = type === 'success'
    ? <CheckCircle2 size={20} />
    : <XCircle size={20} />;

  return (
    <div className={`aurora-toast ${type}`} role="status">
      {icon}
      <span>{message}</span>
    </div>
  );
};

// Loading Screen
const LoadingScreen = () => (
  <div className="aurora-loading">
    <div className="aurora-spinner"></div>
  </div>
);

// stripHtml
const stripHtml = (html = '') => {
  try {
    return html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
  } catch {
    return html || '';
  }
};

// ==========================================================
// ServiceCard Component
// ==========================================================
const ServiceCard = ({ service, index }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const cardRef = useRef(null);

  // 3D Tilt Effect Logic
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const { left, top, width, height } = card.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    const mouseX = (x / width) * 100;
    const mouseY = (y / height) * 100;
    card.style.setProperty('--mouse-x', `${mouseX}%`);
    card.style.setProperty('--mouse-y', `${mouseY}%`);

    const rotateX = (mouseY / 50 - 1) * -8;
    const rotateY = (mouseX / 50 - 1) * 8;
    card.style.setProperty('--rotate-x', `${rotateX}deg`);
    card.style.setProperty('--rotate-y', `${rotateY}deg`);
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty('--rotate-x', '0deg');
    card.style.setProperty('--rotate-y', '0deg');
  };

  const openModal = () => setIsModalOpen(true);
  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message || !service?.id) return;
    try {
      setSubmitting(true);
      const res = await fetch('/api/simple-service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          serviceName: service.name,
          message
        })
      });
      if (!res.ok) throw new Error('REQUEST_FAILED');
      
      setIsModalOpen(false);
      setMessage('');
      setToast({ message: 'درخواست شما با موفقیت ثبت شد', type: 'success' });
    } catch (error) { // <<<<<<<<<<<<<<<<<<<<< ERROR FIXED HERE (removed =>)
      setToast({ message: 'خطا در ثبت درخواست. لطفاً دوباره تلاش کنید.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <article
        ref={cardRef}
        className="aurora-card"
        style={{ '--delay': `${index * 0.08}s` }}
        onClick={openModal}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-label={`نمایش جزئیات ${service.name}`}
      >
        <div className="aurora-card-border"></div>
        <div className="aurora-card-content">
          <img src={service.images || '/placeholder.webp'} alt={service.name || 'Service Image'} className="aurora-card-img" loading="lazy" />
          <div className="aurora-card-body">
            <h3 className="aurora-card-title">{service.name}</h3>
            <p className="aurora-card-excerpt">{stripHtml(service.description) || 'توضیحات این سرویس به زودی اضافه خواهد شد.'}</p>
            <div className="aurora-card-footer">
              <div className="aurora-card-features">
                <span><CheckCircle2 size={14} /> کیفیت تضمینی</span>
                <span><Star size={14} /> پشتیبانی ۲۴/۷</span>
              </div>
              <button className="aurora-action-btn" onClick={(e) => { e.stopPropagation(); openModal(); }}>
                <span>درخواست سرویس</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </article>

      {isModalOpen && (
        <div className="aurora-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="aurora-modal" onClick={e => e.stopPropagation()}>
            <button className="aurora-modal-close" onClick={() => setIsModalOpen(false)} aria-label="بستن مدال">
              <X size={22} />
            </button>
            <div className="aurora-modal-header">
              <h2 className="aurora-modal-title">{service.name}</h2>
              <p className="aurora-modal-subtitle">{stripHtml(service.description) || 'جزئیات این خدمت به صورت خلاصه در بالا آمده است.'}</p>
            </div>
            <form onSubmit={handleSubmit} className="aurora-form">
              <div className="aurora-form-group">
                <label htmlFor="message">
                  <MessageSquare size={16} />
                  <span>جزئیات درخواست</span>
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="5"
                  placeholder="لطفاً تمام جزئیات مورد نیاز را اینجا وارد کنید..."
                  required
                />
              </div>
              <button type="submit" className="aurora-submit-btn" disabled={submitting}>
                {submitting ? 'در حال ارسال…' : 'ارسال نهایی'}
              </button>
            </form>
          </div>
        </div>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
};

// ==========================================================
// ServicesPage Component
// ==========================================================
const ServicesPage = ({ initialServices = [] }) => {
  const { t } = useTranslation('services');
  const [services, setServices] = useState(initialServices || []);
  const [loading, setLoading] = useState(!initialServices || initialServices.length === 0);

  useEffect(() => {
    let mounted = true;
    if (!initialServices || initialServices.length === 0) {
      setLoading(true);
      api.getServices({})
        .then(data => { if (mounted) setServices(data || []); })
        .catch(() => {})
        .finally(() => { if (mounted) setLoading(false); });
    } else {
      setLoading(false);
    }
    return () => { mounted = false; };
  }, [initialServices]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="aurora-page" dir="rtl">
      <div className="aurora-bg">
        <div className="aurora-shape shape1"></div>
        <div className="aurora-shape shape2"></div>
        <div className="aurora-shape shape3"></div>
      </div>
      
      <header className="aurora-hero">
        <h1 className="aurora-hero-title">
          {t('servicesSection.title.part1')} <span className="aurora-hero-highlight">{t('servicesSection.title.highlight')}</span> {t('servicesSection.title.part2')}
        </h1>
        <p className="aurora-hero-subtitle">{t('servicesSection.subtitle')}</p>
      </header>

      <main className="aurora-main-content">
        {services.length === 0 ? (
          <div className="aurora-empty-state">
            <Info size={40} />
            <h3>{t('servicesSection.empty')}</h3>
            <p>در حال حاضر سرویسی برای نمایش وجود ندارد. لطفاً بعداً دوباره مراجعه کنید.</p>
          </div>
        ) : (
          <div className="aurora-grid">
            {services.map((svc, idx) => (
              <ServiceCard key={svc.id || idx} service={svc} index={idx} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ServicesPage;