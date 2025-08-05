"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { Sparkles, CheckCircle, Phone } from "lucide-react";
import "./services.css";

const ServiceItem = memo(({ service, index }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isEven = index % 2 === 0;

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    const element = document.getElementById(`service-${service.id}`);
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, [service.id]);

  return (
    <section
      id={`service-${service.id}`}
      className={`service-section ${isEven ? "even" : "odd"} ${isVisible ? "visible" : ""}`}
    >
      <div className="service-content-wrapper">
        <div className="service-image-container">
          <img
            src={service.mainImage}
            alt={service.title || "خدمت"}
            className={`service-image ${imageLoaded ? "loaded" : ""}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
          {service.is_featured && (
            <div className="service-featured-badge">
              <Sparkles size={20} />
              <span>ویژه</span>
            </div>
          )}
          <div className="service-overlay">
            <div className="service-overlay-content">
              <Sparkles size={40} />
              <span>مشاهده جزئیات</span>
            </div>
          </div>
        </div>
        <div className="service-text-container">
          <h3 className="service-title">{service.title || "خدمت بدون نام"}</h3>
          <p className="service-description">{service.description || "توضیحی برای این خدمت موجود نیست."}</p>
          <div className="service-benefits">
            <div className="service-benefit">
              <CheckCircle size={16} />
              <span>کیفیت بالا</span>
            </div>
            <div className="service-benefit">
              <CheckCircle size={16} />
              <span>گارانتی معتبر</span>
            </div>
            <div className="service-benefit">
              <CheckCircle size={16} />
              <span>نصب تخصصی</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
ServiceItem.displayName = "ServiceItem";

export default function ServicesClient({ services }) {
  return (
    <main className="services-main-content">
      {services.length > 0 ? (
        services.map((service, index) => (
          <ServiceItem key={service.id} service={service} index={index} />
        ))
      ) : (
        <div className="services-empty-state">
          <div className="services-empty-content">
            <div className="services-empty-icon">
              <Sparkles size={80} />
            </div>
            <h3>خدمتی یافت نشد</h3>
            <p>در حال حاضر خدمتی برای نمایش موجود نیست. لطفاً بعداً دوباره بررسی کنید.</p>
          </div>
        </div>
      )}
    </main>
  );
}
