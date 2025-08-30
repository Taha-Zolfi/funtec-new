"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import "./Products.css";


const ProductSection = ({ product, index, onProductClick }) => {
  const sectionRef = useRef(null);
  
  const calculateAverageRating = useCallback((reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  }, []);

  const averageRating = useMemo(() => 
    calculateAverageRating(product.reviews), 
    [product.reviews, calculateAverageRating]
  );

  const handleProductClick = useCallback(() => {
    onProductClick(product);
  }, [product, onProductClick]);

  return (
    <section 
      className="product-section scroll-animate snap-section"
      data-section-index={index + 1}
      ref={sectionRef}
    >
      <div className="section-background">
        {product.background_video && product.background_video !== 'null' ? (
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="bg-video"
            preload="metadata"
            key={product.background_video}
            poster={product.images?.[0] || ''}
          >
            <source src={product.background_video} type="video/mp4" />
          </video>
        ) : product.images?.[0] ? (
          <img 
            src={product.images[0]}
            alt={product.name || 'محصول'}
            className="bg-image"
            loading="lazy"
            decoding="async"
            fetchpriority={index < 2 ? "high" : "low"}
          />
        ) : null}
        <div className="dark-overlay"></div>
      </div>

      <div className="section-content">
        <div className="product-info">
          <h2 className="product-title">{product.name || 'محصول بدون نام'}</h2>
          
          <p className="product-desc">
            {product.short_description || 'توضیحی برای این محصول موجود نیست.'}
          </p>

          <button 
            type="button"
            className="details-btn"
            onClick={handleProductClick}
            aria-label={`مشاهده جزئیات ${product.name || 'محصول'}`}
          >
            <span className="details-btn-text">مشاهده جزئیات</span>
            <div id="container-stars">
              <div id="stars"></div>
            </div>

          </button>
        </div>
      </div>
    </section>
  );
};

const Products = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const scrollTimeoutRef = useRef(null);
  const observerRef = useRef(null);
  const containerRef = useRef(null);
 const rafRef = useRef(null);

  // Optimized scroll handler with throttling
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

  // Optimized intersection observer
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const isLowEndDevice = typeof window !== 'undefined' && 
      (navigator.hardwareConcurrency <= 4 || navigator.deviceMemory <= 4);
    
    const observerOptions = {
      threshold: isMobile || isLowEndDevice ? [0.5] : [0.1, 0.3, 0.5],
      rootMargin: isMobile ? "0px 0px -20px 0px" : "0px 0px -50px 0px",
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const threshold = isMobile || isLowEndDevice ? 0.5 : 0.3;
        if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
          entry.target.classList.add("visible");
        }
      });
    }, observerOptions);

    // Observe elements after a short delay to improve initial load performance
    const timeoutId = setTimeout(() => {
      const elements = document.querySelectorAll(".scroll-animate");
      elements.forEach((el) => observerRef.current?.observe(el));
    }, isMobile ? 200 : 100);

    return () => {
      clearTimeout(timeoutId);
      observerRef.current?.disconnect();
    };
  }, [products]);

  // Scroll event listener setup
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
  }, [handleScroll]);

  // Load products with error handling and loading state
  const loadProducts = useCallback(async () => {

    const PLACEHOLDER_IMAGE = "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg";
    try {
      setIsLoading(true);
      const allProducts = await api.getProducts();
      console.log("Received products:", allProducts);
      const mappedProducts = allProducts.map((product) => {
        let processedImages = [];
        const rawImagesFromAPI = product.images;
        if (Array.isArray(rawImagesFromAPI)) {
          processedImages = rawImagesFromAPI;
        } else if (typeof rawImagesFromAPI === 'string' && rawImagesFromAPI.trim() !== '') {
          processedImages = rawImagesFromAPI.split(',').map(img => img.trim());
        }
        const finalImages = processedImages
          .filter(img => img && typeof img === 'string' && img.trim() !== '')
          .map(img => {
            const path = img.trim().startsWith('/') ? img.trim() : `/${img.trim()}`;
            return path;
          });
          
        let mainImage = finalImages.length > 0 ? finalImages[0] : PLACEHOLDER_IMAGE;
        if (finalImages.length === 0 && product.image && typeof product.image === 'string') {
          const path = product.image.trim().startsWith('/') ? product.image.trim() : `/${product.image.trim()}`;
          mainImage = path;
        }

        return {
          ...product,
          specifications: Array.isArray(product.specifications)
            ? product.specifications 
            : (product.specifications ? product.specifications.split(',') : []),
          reviews: Array.isArray(product.reviews)
            ? product.reviews
            : (product.reviews ? product.reviews.split(',') : []),
          images: finalImages,
          mainImage: mainImage
        };
      });
      
      setProducts(mappedProducts);
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const openProductDetail = useCallback((product) => {
    router.push(`/products/${product.id}`);
  }, [router]);

  const scrollToSection = useCallback((sectionIndex) => {
    const container = containerRef.current;
    if (container) {
      const sectionHeight = container.clientHeight;
      container.scrollTo({
        top: sectionIndex * sectionHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  // Memoized navigation dots
  const navigationDots = useMemo(() => (
    <div className="navigation-dots">
      <button 
        className={`nav-dot ${currentSection === 0 ? 'active' : ''}`}
        onClick={() => scrollToSection(0)}
        aria-label="برو به بالای صفحه"
      >
        <span className="dot-tooltip">صفحه اصلی</span>
      </button>
      
      {products.map((product, index) => (
        <button 
          key={product.id}
          className={`nav-dot ${currentSection === index + 1 ? 'active' : ''}`}
          onClick={() => scrollToSection(index + 1)}
          aria-label={`برو به ${product.name}`}
        >
          <span className="dot-tooltip">{product.name}</span>
        </button>
      ))}
    </div>
  ), [currentSection, products, scrollToSection]);

  if (isLoading) {
    return (
      <div className="persian-products loading-state">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>در حال بارگذاری محصولات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="persian-products snap-container" ref={containerRef}>
      {/* Scroll Progress Bar */}
      <div className="scroll-progress-container">
        <div 
          className="scroll-progress-bar" 
          style={{ height: `${scrollProgress}%` }}
        ></div>
      </div>

      {/* Navigation Dots */}
      {navigationDots}

      {/* Header Section */}
      <header className="page-header snap-section">
        <div className="header-background">
          <div className="animated-bg">
            <div className="floating-shapes">
              <div className="shape shape-1"></div>
              <div className="shape shape-2"></div>
              <div className="shape shape-3"></div>
              <div className="shape shape-4"></div>
              <div className="shape shape-5"></div>
              <div className="shape shape-6"></div>
            </div>
            <div className="grid-overlay"></div>
            <div className="particle-field"></div>
          </div>
        </div>
        
        <div className="header-content">
          <div className="hero-section">
            <div className="title-container">
              <h1 className="main-title">
                <span className="title-word">محصولات</span>
              </h1>
            </div>
            
            <p className="main-subtitle">
              <span className="subtitle-line">انواع محصولات شهربازی با کیفیت برتر</span>
            </p>
          </div>
          
          {/* Action Section */}
          <div className="action-section">
            <a href="/funtec-products.pdf" download>
            <button className="catalog-download-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>دانلود کاتالوگ محصولات</span>
            </button></a>
            <div className="scroll-indicator">
              <div className="scroll-icon"></div>
              <span>اسکرول کنید</span>
            </div>
          </div>
        </div>
      </header>

      {/* Product Sections */}
      {products.map((product, index) => (
        <ProductSection
          key={product.id}
          product={product}
          index={index}
          onProductClick={openProductDetail}
        />
      ))}
    </div>
  );
};

export default Products;