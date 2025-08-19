"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import "./Products.css";
import StarRating from "@/app/components/StarRating";

// Memoized Product Section Component
const ProductSection = ({ product, index, onProductClick }) => {
  const sectionRef = useRef(null)
  
  const calculateAverageRating = useCallback((reviews) => {
    if (!reviews || reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0)
    return (sum / reviews.length).toFixed(1)
  }, [])

  const averageRating = useMemo(() => 
    calculateAverageRating(product.reviews), 
    [product.reviews, calculateAverageRating]
  )

  const handleProductClick = useCallback(() => {
    onProductClick(product)
  }, [product, onProductClick])

  return (
    <section 
      className="product-section scroll-animate snap-section"
      data-section-index={index + 1}
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
          />
        ) : null}
        <div className="dark-overlay"></div>
      </div>

      <div className="section-content">
        <div className="product-info">
          <h2 className="product-title">{product.name || 'محصول بدون نام'}</h2>
          
          <p className="product-desc">{product.short_description || 'توضیحی برای این محصول موجود نیست.'}</p>

          <button 
            type="button"
            className="btn details-btn"
            onClick={handleProductClick}
          >
            <span className="details-btn-text">مشاهده جزئیات</span>
            <div id="container-stars">
              <div id="stars"></div>
            </div>
            <div id="glow">
              <div className="circle"></div>
              <div className="circle"></div>
            </div>
          </button>
        </div>
      </div>
    </section>
  )
}

const Products = () => {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentSection, setCurrentSection] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [searchFocused, setSearchFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const scrollTimeoutRef = useRef(null)
  const observerRef = useRef(null)
  const containerRef = useRef(null)

  // Memoized filtered products calculation
  const memoizedFilteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products

    const searchLower = searchTerm.toLowerCase().trim()
    return products.filter((product) => {
      const titleMatch = product.title?.toLowerCase().includes(searchLower)
      const descMatch = product.description?.toLowerCase().includes(searchLower)
      const featureMatch = product.features?.some(f => 
        f?.toLowerCase().includes(searchLower)
      )
      const specMatch = product.specifications?.some(s => 
        s?.toLowerCase().includes(searchLower)
      )
      
      return titleMatch || descMatch || featureMatch || specMatch
    })
  }, [products, searchTerm])

  // Update filtered products when memoized result changes
  useEffect(() => {
    setFilteredProducts(memoizedFilteredProducts)
  }, [memoizedFilteredProducts])

  // Optimized scroll handler with throttling
  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) return
    
    scrollTimeoutRef.current = requestAnimationFrame(() => {
      const container = containerRef.current
      if (container) {
        const scrollTop = container.scrollTop
        const scrollHeight = container.scrollHeight - container.clientHeight
        const progress = (scrollTop / scrollHeight) * 100
        setScrollProgress(Math.min(100, Math.max(0, progress)))
        
        const sectionHeight = container.clientHeight
        const currentSectionIndex = Math.round(scrollTop / sectionHeight)
        setCurrentSection(currentSectionIndex)
      }
      scrollTimeoutRef.current = null
    })
  }, [])

  // Optimized intersection observer
  useEffect(() => {
    const observerOptions = {
      threshold: [0.1, 0.3, 0.5],
      rootMargin: "0px 0px -50px 0px",
    }

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
          entry.target.classList.add("visible")
        }
      })
    }, observerOptions)

    // Observe elements after a short delay to improve initial load performance
    const timeoutId = setTimeout(() => {
      const elements = document.querySelectorAll(".scroll-animate")
      elements.forEach((el) => observerRef.current?.observe(el))
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      observerRef.current?.disconnect()
    }
  }, [filteredProducts])

  // Scroll event listener setup
  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true })
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // Load products with error handling and loading state
  const loadProducts = useCallback(async () => {
    const BASE_URL = "https://funnytec.ir"
    const PLACEHOLDER_IMAGE = "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg"

    try {
      setIsLoading(true)
      const allProducts = await api.getProducts()
      console.log("Received products:", allProducts)
      const mappedProducts = allProducts.map((product) => {
        // Image Processing
        let processedImages = []
        const rawImagesFromAPI = product.images
        if (Array.isArray(rawImagesFromAPI)) {
          processedImages = rawImagesFromAPI
        } else if (typeof rawImagesFromAPI === 'string' && rawImagesFromAPI.trim() !== '') {
          processedImages = rawImagesFromAPI.split(',').map(img => img.trim())
        }

        const finalImages = processedImages
          .filter(img => img && typeof img === 'string' && img.trim() !== '')
          .map(img => {
            const path = img.trim().startsWith('/') ? img.trim() : `/${img.trim()}`
            return path
          })
          
        // Fallback Image
        let mainImage = finalImages.length > 0 ? finalImages[0] : PLACEHOLDER_IMAGE
        if (finalImages.length === 0 && product.image && typeof product.image === 'string') {
          const path = product.image.trim().startsWith('/') ? product.image.trim() : `/${product.image.trim()}`
          mainImage = path
        }

        return {
          ...product,
          specifications: Array.isArray(product.specifications) ? product.specifications : 
                         (product.specifications ? product.specifications.split(',') : []),
          reviews: Array.isArray(product.reviews) ? product.reviews :
                  (product.reviews ? product.reviews.split(',') : []),
          images: finalImages,
          mainImage: mainImage
        }
      })
      
      setProducts(mappedProducts)
    } catch (error) {
      console.error("Error loading products:", error)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const openProductDetail = useCallback((product) => {
    router.push(`/products/${product.id}`)
  }, [router])

  const scrollToSection = useCallback((sectionIndex) => {
    const container = containerRef.current
    if (container) {
      const sectionHeight = container.clientHeight
      container.scrollTo({
        top: sectionIndex * sectionHeight,
        behavior: 'smooth'
      })
    }
  }, [])

  const clearSearch = useCallback(() => {
    setSearchTerm("")
  }, [])

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value)
  }, [])

  const handleSearchFocus = useCallback(() => {
    setSearchFocused(true)
  }, [])

  const handleSearchBlur = useCallback(() => {
    setSearchFocused(false)
  }, [])

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
      
      {filteredProducts.map((product, index) => (
        <button 
          key={product.id}
          className={`nav-dot ${currentSection === index + 1 ? 'active' : ''}`}
          onClick={() => scrollToSection(index + 1)}
          aria-label={`برو به ${product.title}`}
        >
          <span className="dot-tooltip">{product.title}</span>
        </button>
      ))}
      
      {filteredProducts.length === 0 && searchTerm && (
        <button 
          className={`nav-dot ${currentSection === 1 ? 'active' : ''}`}
          onClick={() => scrollToSection(1)}
          aria-label="هیچ محصولی یافت نشد"
        >
          <span className="dot-tooltip">نتیجه‌ای یافت نشد</span>
        </button>
      )}
    </div>
  ), [currentSection, filteredProducts, searchTerm, scrollToSection])

  if (isLoading) {
    return (
      <div className="persian-products loading-state">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>در حال بارگذاری محصولات...</p>
        </div>
      </div>
    )
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
          
          {/* Modern Search Section */}
          <div className="search-section">
            <div className={`modern-search-container ${searchFocused ? 'focused' : ''}`}>
              <div className="search-input-wrapper">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  placeholder="جستجو در محصولات..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  className="modern-search-input"
                />
                {searchTerm && (
                  <button 
                    className="clear-search-btn"
                    onClick={clearSearch}
                    type="button"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
              
              {searchTerm && (
                <div className="search-results-info">
                  <span className="results-count">
                    {filteredProducts.length} محصول یافت شد
                  </span>
                  {filteredProducts.length > 0 && (
                    <span className="results-hint">
                      برای مشاهده جزئیات روی محصول کلیک کنید
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Product Sections */}
      {filteredProducts.map((product, index) => (
        <ProductSection
          key={product.id}
          product={product}
          index={index}
          onProductClick={openProductDetail}
        />
      ))}

      {/* Empty State */}
      {filteredProducts.length === 0 && searchTerm && (
        <section className="empty-state scroll-animate snap-section">
          <div className="empty-content">
            <div className="empty-icon">🔍</div>
            <h3>محصولی با این جستجو یافت نشد</h3>
            <p>کلمات کلیدی دیگری امتحان کنید یا جستجو را پاک کنید</p>
            <button 
              className="reset-btn"
              onClick={clearSearch}
            >
              پاک کردن جستجو
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

export default Products