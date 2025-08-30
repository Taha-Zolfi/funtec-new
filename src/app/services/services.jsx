"use client"

import React, { useState, useEffect, useRef } from "react"
import { api } from "@/lib/api"
import { BarChart, Star, Wrench, CheckCircle, Phone, ArrowLeft } from "lucide-react"
import "./services.css"

// ============================================================================
// Loading Component
// ============================================================================
const LoadingScreen = () => (
  <div className="services-loading">
    <div className="loading-spinner"></div>
  </div>
)

// ============================================================================
// Service Card Component
// ============================================================================
const ServiceCard = ({ service, index }) => {
  const cardRef = useRef(null)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const rotateX = (y - centerY) / 10
      const rotateY = (centerX - x) / 10

      card.style.transform = `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`
    }

    const handleMouseLeave = () => {
      card.style.transform = "perspective(1500px) rotateX(0deg) rotateY(0deg) scale(1)"
    }

    card.addEventListener("mousemove", handleMouseMove)
    card.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      card.removeEventListener("mousemove", handleMouseMove)
      card.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  return (
    <div
      ref={cardRef}
      className="service-card"
      style={{ "--animation-delay": `${index * 0.15}s` }}
    >
      <div className="service-card-glow"></div>
      <div className="card-image-wrapper">
        <img
          src={service.images || "https://images.pexels.com/photos/1038916/pexels-photo-1038916.jpeg?auto=compress&cs=tinysrgb&w=800"}
          alt={service.name}
          className="service-image"
        />
      </div>
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{service.name}</h3>
          <div className="card-status-badge">جدید</div>
        </div>
        <p className="card-description">{service.description}</p>
        <div className="card-actions">
          <button className="action-button">
            <span>اطلاعات بیشتر</span>
            <ArrowLeft size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// ===== کامپوننت جدید: کارت محصول =====
// ============================================================================
const ProductCard = ({ product, index }) => {
  // انتخاب اولین تصویر به عنوان تصویر کارت یا استفاده از پلیس‌هولدر
  const imageUrl = (product.images && product.images.length > 0)
    ? product.images[0]
    : "https://via.placeholder.com/400x300?text=No+Image";

  return (
    <a href={`/products/${product.id}`} className="product-card" style={{ "--animation-delay": `${index * 0.1}s` }}>
        <div className="product-card-image-wrapper">
             <img src={imageUrl} alt={product.name} className="product-card-image" loading="lazy" />
        </div>
        <div className="product-card-content">
            <h4 className="product-card-title">{product.name}</h4>
            <p className="product-card-desc">{product.short_description}</p>
            <span className="product-card-link">
                مشاهده جزئیات
                <ArrowLeft size={18} />
            </span>
        </div>
    </a>
  );
};


// ============================================================================
// Main Services Page Component
// ============================================================================
const ServicesPage = () => {
  const [services, setServices] = useState([])
  const [products, setProducts] = useState([]) // <-- استیت جدید برای محصولات
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isVisible, setIsVisible] = useState({})
  const pageRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // واکشی همزمان خدمات و محصولات برای سرعت بیشتر
        const [fetchedServices, fetchedProducts] = await Promise.all([
            api.getServices(),
            api.getProducts()
        ]);
        
        setServices(fetchedServices);
        setProducts(fetchedProducts.slice(0, 4)); // <-- فقط ۴ محصول اول را نمایش می‌دهیم

      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("خطا در دریافت اطلاعات. لطفاً بعداً تلاش کنید.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (loading || !pageRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.2, rootMargin: "0px 0px -100px 0px" }
    )

    const sections = pageRef.current.querySelectorAll("[data-section]")
    sections.forEach((section) => observer.observe(section))

    return () => sections.forEach((section) => {
        if(section) observer.unobserve(section)
    })
  }, [loading])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div ref={pageRef} className="services-page">
      <div className="services-background"></div>
      <div className="services-container">
        {/* Hero Section */}
        <section id="hero" data-section className="hero-section">
          {/* ... محتوای این بخش بدون تغییر ... */}
          <div className={`fade-in ${isVisible.hero ? "animate" : ""}`}>
            <div className="hero-badge">
              <span>🚀</span>
              <span>نوآوری در تفریح</span>
            </div>
            <h1 className="hero-title">
              به آینده <span className="title-highlight">تفریح</span> خوش آمدید
            </h1>
            <p className="hero-description">
              با فان تک، تجربه‌ای فراتر از تصور خود را در دنیای شهربازی‌های مدرن کشف کنید. ما با استفاده از پیشرفته‌ترین
              تکنولوژی‌ها، رویاهای شما را به واقعیت تبدیل می‌کنیم.
            </p>
            <div className="hero-metrics">
              <div className="metric-card"><BarChart size={24} className="metric-icon" /><div className="metric-number">100+</div><div className="metric-label">پروژه موفق</div></div>
              <div className="metric-card"><Star size={24} className="metric-icon" /><div className="metric-number">50+</div><div className="metric-label">مشتری راضی</div></div>
              <div className="metric-card"><Wrench size={24} className="metric-icon" /><div className="metric-number">24/7</div><div className="metric-label">پشتیبانی</div></div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" data-section className="services-section">
           <div className={`fade-in ${isVisible.services ? "animate" : ""}`}>
            <div className="section-header">
              <h2 className="section-title">
                راه‌حل‌های <span className="section-highlight">نوآورانه</span> ما
              </h2>
              <p className="section-subtitle">از ایده تا اجرا، ما در هر مرحله همراه شما هستیم.</p>
            </div>
            {error ? (
              <div className="error-state"><p>{error}</p></div>
            ) : (
              <div className="services-grid">
                {services.length > 0 ? (
                  services.map((service, index) => <ServiceCard key={service.id} service={service} index={index} />)
                ) : (
                  <div className="empty-state"><p>در حال حاضر سرویسی برای نمایش وجود ندارد.</p></div>
                )}
              </div>
            )}
           </div>
        </section>

        {/* ===== بخش جدید: نمایش محصولات ===== */}
        <section id="products" data-section className="products-section">
            <div className={`fade-in ${isVisible.products ? "animate" : ""}`}>
                <div className="section-header">
                    <h2 className="section-title">
                        نمونه‌ای از <span className="section-highlight">محصولات</span> ما
                    </h2>
                    <p className="section-subtitle">نگاهی به برخی از پروژه‌های موفق و محصولات با کیفیت ما بیندازید.</p>
                </div>
                {error ? (
                    <div className="error-state"><p>{error}</p></div>
                ) : (
                    <div className="products-grid">
                        {products.length > 0 ? (
                            products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)
                        ) : (
                            <div className="empty-state"><p>محصولی برای نمایش وجود ندارد.</p></div>
                        )}
                    </div>
                )}
            </div>
        </section>


        {/* CTA Section */}
        <section id="cta" data-section className="cta-section">
           {/* ... محتوای این بخش بدون تغییر ... */}
          <div className={`fade-in ${isVisible.cta ? "animate" : ""}`}>
            <div className="cta-content">
              <h2 className="cta-title">آیا نیاز به مشاوره بیشتر دارید؟</h2>
              <p className="cta-description">
                با تیم متخصص ما تماس بگیرید و اولین قدم را برای ساخت شهربازی رویایی‌تان بردارید.
              </p>
              <div className="cta-actions">
                <a href="tel:09904772771" className="cta-btn-primary"><Phone size={24} /><span>همین حالا تماس بگیرید</span></a>
                <a href="https://wa.me/989191771727" target="_blank" rel="noopener noreferrer"><button className="cta-btn-secondary">درخواست مشاوره رایگان</button></a>
              </div>
              <div className="cta-features">
                <div className="cta-feature"><CheckCircle size={20} /> <span>مشاوره رایگان</span></div>
                <div className="cta-feature"><CheckCircle size={20} /> <span>طراحی سه‌بعدی</span></div>
                <div className="cta-feature"><CheckCircle size={20} /> <span>پشتیبانی کامل</span></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default ServicesPage