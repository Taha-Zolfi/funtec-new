// مسیر: src/app/[locale]/products/Products.jsx
// *** این کد صحیح و نهایی است ***

"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from 'react-i18next';
import "./Products.css";

const ProductSection = ({ product, index, onProductClick }) => {
  const { t } = useTranslation('products');
  return (
    <section className="product-section scroll-animate snap-section" data-section-index={index + 1}>
      <div className="section-background">
        {product.background_video ? (
          <video autoPlay muted loop playsInline className="bg-video" preload="metadata" key={product.background_video} poster={product.images?.[0] || ''}>
            <source src={product.background_video} type="video/mp4" />
          </video>
        ) : product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name || t('list.unnamedProduct')} className="bg-image" loading="lazy" decoding="async" fetchpriority={index < 2 ? "high" : "low"} />
        ) : null}
        <div className="dark-overlay"></div>
      </div>
      <div className="section-content">
        <div className="product-info">
          <h2 className="product-title">{product.name || t('list.unnamedProduct')}</h2>
          <p className="product-desc">{product.short_description || t('list.noDescription')}</p>
          <button type="button" className="details-btn" onClick={() => onProductClick(product)} aria-label={t('list.detailsAriaLabel', { productName: product.name || t('list.unnamedProduct') })}>
            <span className="btn-text">{t('list.detailsButton')}</span>
            <svg className="btn-arrow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </section>
  );
};

const Products = ({ initialProducts }) => {
  const { t, i18n } = useTranslation('products');
  const router = useRouter();
  
  const [products, setProducts] = useState(initialProducts || []);
  const [isLoading] = useState(!initialProducts);

  const [currentSection, setCurrentSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const observerRef = useRef(null);
  const containerRef = useRef(null);
  const rafRef = useRef(null);

  const handleScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      const container = containerRef.current;
      if (container) {
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight - container.clientHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
        const sectionHeight = container.clientHeight;
        const currentSectionIndex = Math.round(scrollTop / sectionHeight);
        setCurrentSection(currentSectionIndex);
      }
      rafRef.current = null;
    });
  }, []);

  useEffect(() => {
    const observerOptions = { threshold: 0.3 };
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    }, observerOptions);
    const elements = document.querySelectorAll(".scroll-animate");
    elements.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, [products]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        container.removeEventListener('scroll', handleScroll);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      }
    }
  }, [handleScroll]);
  
  const openProductDetail = useCallback((product) => router.push(`/${i18n.language}/products/${product.id}`), [router, i18n.language]);
  const scrollToSection = useCallback((sectionIndex) => {
    containerRef.current?.scrollTo({ top: sectionIndex * containerRef.current.clientHeight, behavior: 'smooth' });
  }, []);

  const navigationDots = useMemo(() => (
    <div className="navigation-dots">
      <button className={`nav-dot ${currentSection === 0 ? 'active' : ''}`} onClick={() => scrollToSection(0)} aria-label={t('list.navDots.scrollToTopAriaLabel')}><span className="dot-tooltip">{t('list.navDots.mainPageTooltip')}</span></button>
      {products.map((product, index) => (
        <button key={product.id} className={`nav-dot ${currentSection === index + 1 ? 'active' : ''}`} onClick={() => scrollToSection(index + 1)} aria-label={t('list.navDots.scrollToProductAriaLabel', { productName: product.name })}>
          <span className="dot-tooltip">{product.name}</span>
        </button>
      ))}
    </div>
  ), [currentSection, products, scrollToSection, t]);

  if (isLoading && products.length === 0) {
    return (<div className="persian-products loading-state"><div className="loading-content"><div className="loading-spinner"></div><p>{t('list.loading')}</p></div></div>);
  }

  return (
    <div className={`persian-products snap-container lang-${i18n.language}`} ref={containerRef}>
      <div className="scroll-progress-container"><div className="scroll-progress-bar" style={{ height: `${scrollProgress}%` }}></div></div>
      {navigationDots}
      <header className="page-header snap-section">
        {/* Header content... */}
        <div className="header-background"><div className="animated-bg"><div className="grid-overlay"></div></div></div>
        <div className="header-content">
          <div className="hero-section">
            <div className="title-container"><h1 className="main-title"><span className="title-word">{t('list.hero.title')}</span></h1></div>
            <p className="main-subtitle"><span className="subtitle-line">{t('list.hero.subtitle')}</span></p>
          </div>
          <div className="action-section">
            <a href="/funtec-products.pdf" download><button className="catalog-download-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg><span>{t('list.hero.downloadButton')}</span></button></a>
            <div className="scroll-indicator"><div className="scroll-icon"></div><span>{t('list.hero.scrollIndicator')}</span></div>
          </div>
        </div>
      </header>
      {products.map((product, index) => (
        <ProductSection key={product.id} product={product} index={index} onProductClick={openProductDetail}/>
      ))}
    </div>
  );
};

export default Products;