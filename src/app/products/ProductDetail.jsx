"use client";
import React, { useState, useEffect, useCallback, useLayoutEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from 'react-dom';
import { useRouter } from "next/navigation";
import { Phone, Star, Share2, ChevronLeft, ChevronRight, Home, User, Clock, X, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import "./ProductDetail.css";

import Loading from '../components/Loading';

// --- START: کامپوننت مودال تماس ---
const PhoneModal = ({ onClose, phoneNumbers }) => {
  return createPortal(
    <motion.div
      className="phone-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="phone-modal-content"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-modal-btn" onClick={onClose} aria-label="بستن">
          <X size={24} />
        </button>
        <h2>انتخاب شماره تماس</h2>
        <p>برای مشاوره و خرید، با یکی از شماره‌های زیر تماس بگیرید:</p>
        <div className="phone-numbers-list">
          {phoneNumbers.map((phone, index) => (
            <a key={index} href={`tel:${phone.number.replace(/-/g, '')}`} className="phone-link">
              <div className="phone-info">
                <span className="phone-label">{phone.label}</span>
                <span className="phone-number">{phone.number}</span>
              </div>
              <Phone className="icon" />
            </a>
          ))}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};
// --- END: کامپوننت مودال تماس ---

// --- START: کامپوننت مودال گالری تصاویر ---
const GalleryModal = ({ images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextImage, prevImage, onClose]);

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const [direction, setDirection] = useState(0);

  const paginate = (newDirection) => {
    setDirection(newDirection);
    if (newDirection > 0) nextImage();
    else prevImage();
  };

  return createPortal(
    <motion.div
      className="gallery-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button className="gallery-modal-close-btn" onClick={onClose} aria-label="بستن گالری">
        <X size={32} />
      </button>

      <div className="gallery-modal-main" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="gallery-modal-image"
            alt={`تصویر ${currentIndex + 1}`}
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button className="gallery-modal-nav prev" onClick={() => paginate(-1)} aria-label="تصویر قبلی">
              <ChevronRight size={40} />
            </button>
            <button className="gallery-modal-nav next" onClick={() => paginate(1)} aria-label="تصویر بعدی">
              <ChevronLeft size={40} />
            </button>
          </>
        )}
      </div>

      <div className="gallery-modal-counter">
          {currentIndex + 1} / {images.length}
      </div>

      {images.length > 1 && (
        <div className="gallery-modal-thumbnails" onClick={(e) => e.stopPropagation()}>
          {images.map((img, idx) => (
            <button
              key={idx}
              className={`gallery-modal-thumbnail-btn ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
            >
              <img src={img} alt={`تصویر کوچک ${idx + 1}`} />
            </button>
          ))}
        </div>
      )}
    </motion.div>,
    document.body
  );
};
// --- END: کامپوننت مودال گالری تصاویر ---


const ProductDetail = ({ productId }) => {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [commentForm, setCommentForm] = useState({ name: '', rating: 5, text: '' });
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState(null);
  const [showNav, setShowNav] = useState(true);
  const lastScrollYRef = useRef(0);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [modalInitialIndex, setModalInitialIndex] = useState(0);

  const contactNumbers = [
    { label: "پشتیبانی فروش", number: "021-33499901" },
    { label: "مشاوره فنی", number: "021-33499902" }
  ];

  const BASE_URL = "https://funtec.ir";
  const PLACEHOLDER_IMAGE = "https://via.placeholder.com/800x600?text=No+Image+Available";

  useEffect(() => {
    setLoading(true);
    loadProduct();
  }, [productId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const previousScrollY = lastScrollYRef.current;
      if (currentScrollY < 100) {
        setShowNav(true);
      } else if (currentScrollY > previousScrollY) {
        setShowNav(false);
      } else {
        setShowNav(true);
      }
      lastScrollYRef.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useLayoutEffect(() => {
    const centerModal = () => {
      const modalElem = document.querySelector('.pd-modal-content');
      if (modalElem) {
        modalElem.style.position = 'fixed';
        modalElem.style.top = '50%';
        modalElem.style.left = '50%';
        modalElem.style.transform = 'translate(-50%, -50%)';
      }
    };
    centerModal();
    window.addEventListener('resize', centerModal);
    return () => window.removeEventListener('resize', centerModal);
  }, []);

  const loadProduct = async () => {
    try {
      const productData = await api.getProduct(parseInt(productId));
      if (!productData || !productData.id) {
        router.push('/products');
        return;
      }
      const processedProduct = {
        ...productData,
        features: Array.isArray(productData.features) ? productData.features : (productData.features ? productData.features.split(',').filter(Boolean) : []),
        specifications: Array.isArray(productData.specifications) ? productData.specifications : (productData.specifications ? productData.specifications.split(',').filter(Boolean) : []),
        images: Array.isArray(productData.images) ? productData.images.filter(Boolean) : (productData.images ? productData.images.split(',').filter(Boolean) : []),
        comments: productData.comments || [],
        short_description: productData.short_description || '',
        full_description: productData.full_description || ''
      };
      if (!processedProduct.images || processedProduct.images.length === 0) {
        processedProduct.images = [PLACEHOLDER_IMAGE];
      }
      setProduct(processedProduct);
      setActiveImageIndex(0);
    } catch (error) {
      console.error("Failed to load product", error);
    } finally {
      setTimeout(() => setLoading(false), 1500);
    }
  };

  const getCurrentImage = useCallback(() => {
    if (product && product.images && product.images.length > 0) {
      return product.images[activeImageIndex];
    }
    return PLACEHOLDER_IMAGE;
  }, [product, activeImageIndex]);

  const nextImage = useCallback(() => {
    if (product?.images?.length > 1) {
      setActiveImageIndex((prev) => (prev + 1) % product.images.length);
    }
  }, [product?.images?.length]);

  const prevImage = useCallback(() => {
    if (product?.images?.length > 1) {
      setActiveImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
    }
  }, [product?.images?.length]);

  const handleSubmitComment = async () => {
    setCommentSubmitting(true);
    setCommentError(null);
    try {
      await api.submitComment(product.id, {
        name: commentForm.name,
        rating: commentForm.rating,
        comment: commentForm.text
      });
      await loadProduct();
      setCommentForm({ name: '', rating: 5, text: '' });
    } catch (error) {
      setCommentError("خطا در ثبت نظر. لطفا دوباره تلاش کنید.");
      console.error(error);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.short_description || product.name,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('لینک کپی شد!');
    }
  };
  
  const openGalleryModal = (index) => {
    setModalInitialIndex(index);
    setIsGalleryModalOpen(true);
  };

  const closeGalleryModal = () => {
    setIsGalleryModalOpen(false);
  };

  if (loading) return <Loading />;

  if (!product) {
    return (
      <div className="product-not-found">
        <div className="not-found-content">
          <h2>محصول یافت نشد</h2>
          <p>متأسفانه محصول مورد نظر شما یافت نشد.</p>
          <button onClick={() => router.push('/products')} className="back-home-btn">
            <Home className="icon" />
            <span>بازگشت به صفحه محصولات</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <AnimatePresence>
        {showPhoneModal && (
          <PhoneModal 
            onClose={() => setShowPhoneModal(false)} 
            phoneNumbers={contactNumbers} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isGalleryModalOpen && (
          <GalleryModal
            images={product.images}
            initialIndex={modalInitialIndex}
            onClose={closeGalleryModal}
          />
        )}
      </AnimatePresence>

      <section className="product-hero">
        <div className="hero-background">
          {product.background_video ? (
            <video autoPlay muted loop playsInline className="hero-bg-video" key={product.background_video}>
              <source src={product.background_video} type="video/mp4" />
            </video>
          ) : (
            <img
              src={getCurrentImage()}
              alt={product.name}
              className="hero-bg-image"
              onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE; }}
            />
          )}
        </div>

        <div className="hero-content">
          <div className={`hero-navigation ${!showNav ? 'hidden' : ''}`}>
            <button onClick={() => router.push('/')} className="back-btn">
              <ArrowRight className="icon" />
              <span>بازگشت</span>
            </button>
            <div className="hero-actions">
              <button onClick={handleShare} className="action-btn">
                <Share2 className="icon" />
              </button>
            </div>
          </div>

          <div className="hero-info">
            <h1 className="product-title">{product.name}</h1>
            {product.short_description && (
              <div className="product-short-description-hero">
                <p>{product.short_description}</p>
              </div>
            )}
            <div className="product-meta">
              {product.comments && product.comments.length > 0 && (
                <div className="rating-info">
                  <div className="rating-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < Math.floor(calculateAverageRating(product.comments)) ? "#FFB527" : "none"}
                        stroke={i < Math.floor(calculateAverageRating(product.comments)) ? "#FFB527" : "#666"}
                      />
                    ))}
                  </div>
                  <span className="rating-text">
                    {calculateAverageRating(product.comments)} از 5 ({product.comments.length} نظر)
                  </span>
                </div>
              )}
            </div>
            <div className="hero-cta">
              <button className="cta-btn primary" onClick={() => setShowPhoneModal(true)}>
                <Phone className="icon" />
                <span>تماس با ما</span>
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <section className="image-gallery-section">
        <div className="container">
          <div className="gallery-main">
            <div className="main-image-container">
              <button className="main-image-button" onClick={() => openGalleryModal(activeImageIndex)}>
                <img
                  src={getCurrentImage()}
                  alt={product.name}
                  className="main-image"
                  onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE; }}
                />
              </button>
              {product.images && product.images.length > 1 && (
                <>
                  <div className="gallery-navigation">
                    <button className="nav-button prev" onClick={prevImage} aria-label="تصویر قبلی">
                      <ChevronRight className="icon" />
                    </button>
                    <button className="nav-button next" onClick={nextImage} aria-label="تصویر بعدی">
                      <ChevronLeft className="icon" />
                    </button>
                  </div>
                  <div className="image-counter">
                    {activeImageIndex + 1} / {product.images.length}
                  </div>
                </>
              )}
            </div>
            {!isMobile && product.images && product.images.length > 1 && (
              <div className="thumbnail-grid">
                {product.images.map((image, idx) => (
                  <button
                    key={idx}
                    className={`thumbnail-button ${idx === activeImageIndex ? 'active' : ''}`}
                    onClick={() => {
                        setActiveImageIndex(idx);
                        openGalleryModal(idx);
                    }}
                    aria-label={`نمایش تصویر ${idx + 1}`}
                  >
                    <img
                      src={image}
                      alt={`تصویر ${idx + 1} از ${product.name}`}
                      loading="lazy"
                      onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="product-details-section">
        <div className="container">
          <div className="product-content">
            {product.features && product.features.length > 0 && (
              <div className="product-features">
                <h3>ویژگی‌ها</h3>
                <ul>
                  {product.features.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            )}
            <div className="description-content" dangerouslySetInnerHTML={{ __html: product.full_description || 'توضیحات تکمیلی موجود نیست.' }} />
            {product.specifications && product.specifications.length > 0 && (
              <div className="specs-panel">
                <h3>مشخصات فنی</h3>
                <div className="specs-table">
                  {product.specifications.map((spec, index) => (
                    <div key={index} className="spec-row">
                      <div className="spec-value">{spec}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="comments-section">
              <h3>نظرات کاربران</h3>
              {product.comments && product.comments.length > 0 ? (
                <div className="comments-list">
                  {product.comments.map((comment, index) => (
                    <div key={index} className="comment-item">
                      <div className="comment-header">
                        <span className="commenter-name"><User size={20} />{comment.name}</span>
                        <div className="rating-stars">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} fill={i < comment.rating ? "#FFB527" : "none"} stroke={i < comment.rating ? "#FFB527" : "#666"} />
                          ))}
                        </div>
                      </div>
                      <p className="comment-text">{comment.comment}</p>
                      <span className="comment-date"><Clock size={16} />{new Date(comment.created_at).toLocaleDateString('fa-IR')}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-comments">هنوز نظری برای این محصول ثبت نشده است.</p>
              )}
              <div className="comment-form">
                <form style={{ position: 'relative', zIndex: 50 }} onSubmit={(e) => { e.preventDefault(); handleSubmitComment(); }} aria-label="ارسال نظر">
                  <h4>ثبت نظر</h4>
                  <div className="form-description">نظر خود را درباره این محصول با دیگران به اشتراک بگذارید.</div>
                  <div className="form-group">
                    <label>نام شما</label>
                    <input name="name" type="text" placeholder="نام خود را وارد کنید" value={commentForm.name} onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })} aria-label="نام" />
                  </div>
                  <div className="form-group">
                    <label>امتیاز شما</label>
                    <div className="star-input" aria-label={`رتبه: ${commentForm.rating} از 5`} role="radiogroup">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} type="button" role="radio" aria-checked={commentForm.rating === n} tabIndex={0} className={`star${commentForm.rating >= n ? ' active' : ''}`} onClick={() => setCommentForm({ ...commentForm, rating: n })}>
                          <Star size={28} className="icon-star" aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>متن نظر</label>
                    <textarea name="text" placeholder="نظر خود را بنویسید..." value={commentForm.text} onChange={(e) => setCommentForm({ ...commentForm, text: e.target.value })} aria-label="متن نظر" />
                  </div>
                  <div className="form-actions">
                    <button className="btn primary" type="submit" disabled={commentSubmitting} aria-busy={commentSubmitting}>
                      {commentSubmitting ? 'در حال ارسال...' : 'ثبت نظر'}
                    </button>
                    {commentError && <p className="error-message" role="alert">{commentError}</p>}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const calculateAverageRating = (comments = []) => {
  if (!comments || comments.length === 0) return 0;
  const sum = comments.reduce((acc, comment) => acc + (comment.rating || 0), 0);
  return (sum / comments.length).toFixed(1);
};

export default ProductDetail;