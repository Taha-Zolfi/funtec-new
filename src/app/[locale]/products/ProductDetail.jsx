// مسیر: src/app/[locale]/products/ProductDetail.jsx

"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from 'react-dom';
import { useRouter } from "next/navigation";
import { Phone, Star, Share2, ChevronLeft, ChevronRight, Home, User, Clock, X, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { useTranslation } from 'react-i18next';
import "./ProductDetail.css";
import Loading from '../../components/Loading';

// --- کامپوننت‌های مودال ---
const PhoneModal = ({ onClose, phoneNumbers }) => {
  const { t } = useTranslation('products');
  return createPortal(
    <motion.div className="phone-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="phone-modal-content" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose} aria-label={t('detail.phoneModal.closeAriaLabel')}><X size={24} /></button>
        <h2>{t('detail.phoneModal.title')}</h2>
        <p>{t('detail.phoneModal.subtitle')}</p>
        <div className="phone-numbers-list">
          {phoneNumbers.map((phone, index) => (
            <a key={index} href={`tel:${phone.number.replace(/-/g, '')}`} className="phone-link">
              <div className="phone-info"><span className="phone-label">{t(phone.labelKey, phone.defaultLabel)}</span><span className="phone-number">{phone.number}</span></div>
              <Phone className="icon" />
            </a>
          ))}
        </div>
      </motion.div>
    </motion.div>, document.body
  );
};

const GalleryModal = ({ images, initialIndex, onClose }) => {
  const { t } = useTranslation('products');
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const nextImage = useCallback(() => setCurrentIndex((prev) => (prev + 1) % images.length), [images.length]);
  const prevImage = useCallback(() => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)), [images.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = 'auto'; };
  }, [nextImage, prevImage, onClose]);
  
  return createPortal(
    <motion.div className="gallery-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <button className="gallery-modal-close-btn" onClick={onClose} aria-label={t('detail.galleryModal.closeAriaLabel')}><X size={32} /></button>
      <div className="gallery-modal-main" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence><motion.img key={currentIndex} src={images[currentIndex]} alt={t('detail.galleryModal.imageAlt', { index: currentIndex + 1 })} /></AnimatePresence>
        {images.length > 1 && (<><button className="gallery-modal-nav prev" onClick={prevImage} aria-label={t('detail.galleryModal.prevAriaLabel')}><ChevronRight size={40} /></button><button className="gallery-modal-nav next" onClick={nextImage} aria-label={t('detail.galleryModal.nextAriaLabel')}><ChevronLeft size={40} /></button></>)}
      </div>
      <div className="gallery-modal-counter">{currentIndex + 1} / {images.length}</div>
      {images.length > 1 && (<div className="gallery-modal-thumbnails" onClick={(e) => e.stopPropagation()}>{images.map((img, idx) => (<button key={idx} className={`gallery-modal-thumbnail-btn ${idx === currentIndex ? 'active' : ''}`} onClick={() => setCurrentIndex(idx)}><img src={img} alt={t('detail.galleryModal.thumbnailAlt', { index: idx + 1 })} /></button>))}</div>)}
    </motion.div>, document.body
  );
};

const calculateAverageRating = (comments = []) => {
  if (!comments || comments.length === 0) return 0;
  const sum = comments.reduce((acc, comment) => acc + (comment.rating || 0), 0);
  return (sum / comments.length).toFixed(1);
};


// --- کامپوننت اصلی ---

const ProductDetail = ({ productId }) => {
  const { t, i18n } = useTranslation('products');
  const router = useRouter();
  const locale = i18n.language;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [commentForm, setCommentForm] = useState({ name: '', rating: 5, text: '' });
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  
  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const rawProduct = await api.getProduct(productId);
      const translation = rawProduct.translations?.[locale] || rawProduct.translations?.['fa'] || {};
      const finalProductData = {
        id: rawProduct.id,
        images: rawProduct.images || [],
        background_video: rawProduct.background_video,
        comments: rawProduct.comments || [],
        ...translation
      };
      setProduct(finalProductData);
    } catch (err) {
      console.error("Failed to fetch product details:", err);
      setError(t('detail.notFound.title'));
    } finally {
      setLoading(false);
    }
  }, [productId, locale, t]);
  
  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const contactNumbers = t('detail.phoneModal.numbers', { returnObjects: true, defaultValue: [] });
  const PLACEHOLDER_IMAGE = "https://via.placeholder.com/800x600?text=No+Image";

  const getCurrentImage = useCallback(() => (product?.images?.[activeImageIndex]) || PLACEHOLDER_IMAGE, [product, activeImageIndex]);
  const nextImage = useCallback(() => product && setActiveImageIndex(p => (p + 1) % product.images.length), [product]);
  const prevImage = useCallback(() => product && setActiveImageIndex(p => (p === 0 ? product.images.length - 1 : p - 1)), [product]);

  const handleSubmitComment = useCallback(async (e) => {
    e.preventDefault();
    if (!product) return;
    setCommentSubmitting(true);
    setCommentError(null);
    try {
      await api.submitComment(product.id, { 
        name: commentForm.name, 
        text: commentForm.text,
        rating: commentForm.rating 
      });
      setCommentForm({ name: '', rating: 5, text: '' });
      await fetchProduct(); // Re-fetch product to show the new comment
    } catch (error) {
      setCommentError(t('detail.comments.submitError'));
      console.error(error);
    } finally {
      setCommentSubmitting(false);
    }
  }, [product, commentForm, fetchProduct, t]);

  const handleShare = () => { navigator.clipboard.writeText(window.location.href); alert(t('detail.shareAlert')); };
  const openGalleryModal = (index) => { setActiveImageIndex(index); setIsGalleryModalOpen(true); };

  if (loading) return <Loading />;
  if (error || !product) {
    return (
      <div className="product-not-found">
        <div className="not-found-content">
          <h2>{error || t('detail.notFound.title')}</h2>
          <p>{t('detail.notFound.body')}</p>
          <button onClick={() => router.push(`/${locale}/products`)} className="back-home-btn">
            <Home className="icon" /><span>{t('detail.notFound.button')}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`product-detail-page lang-${locale}`}>
      <AnimatePresence>
        {showPhoneModal && <PhoneModal onClose={() => setShowPhoneModal(false)} phoneNumbers={contactNumbers} />}
        {isGalleryModalOpen && <GalleryModal images={product.images} initialIndex={activeImageIndex} onClose={() => setIsGalleryModalOpen(false)} />}
      </AnimatePresence>

      <section className="product-hero">
        <div className="hero-background">
          {product.background_video ? (
            <video autoPlay muted loop playsInline className="hero-bg-video" key={product.background_video}><source src={product.background_video} type="video/mp4" /></video>
          ) : (<img src={getCurrentImage()} alt={product.name} className="hero-bg-image" onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }} />)}
        </div>
        <div className="hero-content">
          <motion.div className="hero-navigation">
            <button onClick={() => router.push(`/${locale}/`)} className="back-btn"><ArrowRight className="icon" /><span>{t('detail.hero.backButton')}</span></button>
            <div className="hero-actions"><button onClick={handleShare} className="action-btn"><Share2 className="icon" /></button></div>
          </motion.div>
          <div className="hero-info">
            <h1 className="product-title">{product.name}</h1>
            <p className="product-short-description-hero">{product.short_description}</p>
            <div className="product-meta">
              {(product.comments || []).length > 0 && (
                <div className="rating-info"><div className="rating-stars">{[...Array(5)].map((_, i) => (<Star key={i} size={16} fill={i < Math.floor(calculateAverageRating(product.comments)) ? "#FFB527" : "none"} stroke={"#FFB527"}/>))}</div><span className="rating-text">{t('detail.hero.ratingText', { rating: calculateAverageRating(product.comments), count: (product.comments || []).length })}</span></div>
              )}
            </div>
            <div className="hero-cta"><button className="cta-btn primary" onClick={() => setShowPhoneModal(true)}><Phone className="icon" /><span>{t('detail.hero.contactButton')}</span></button></div>
          </div>
        </div>
      </section>
      
      <section className="image-gallery-section">
        <div className="container">
          <div className="gallery-main">
            <div className="main-image-container">
              <button className="main-image-button" onClick={() => openGalleryModal(activeImageIndex)}><img src={getCurrentImage()} alt={product.name} className="main-image" onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}/></button>
              {product.images.length > 1 && (<><div className="gallery-navigation"><button className="nav-button prev" onClick={prevImage}><ChevronRight className="icon" /></button><button className="nav-button next" onClick={nextImage}><ChevronLeft className="icon" /></button></div><div className="image-counter">{activeImageIndex + 1} / {product.images.length}</div></>)}
            </div>
            {product.images.length > 1 && (<div className="thumbnail-grid">{product.images.map((image, idx) => (<button key={idx} className={`thumbnail-button ${idx === activeImageIndex ? 'active' : ''}`} onClick={() => setActiveImageIndex(idx)}><img src={image} alt={`thumbnail ${idx + 1}`} loading="lazy" onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}/></button>))}</div>)}
          </div>
        </div>
      </section>

      <section className="product-details-section">
        <div className="container">
          <div className="product-content">
            {product.features?.length > 0 && (<div className="product-features"><h3>{t('detail.featuresTitle')}</h3><ul>{product.features.map((f, i) => <li key={i}>{f}</li>)}</ul></div>)}
            <div className="description-content" dangerouslySetInnerHTML={{ __html: product.full_description || t('detail.noFullDescription') }} />
            {product.specifications?.length > 0 && (<div className="specs-panel"><h3>{t('detail.specsTitle')}</h3><div className="specs-table">{product.specifications.map((spec, index) => (<div key={index} className="spec-row"><div className="spec-value">{spec}</div></div>))}</div></div>)}
            <div className="comments-section">
              <h3>{t('detail.comments.title')}</h3>
              {(product.comments || []).length > 0 ? (<div className="comments-list">{product.comments.map((comment, index) => (<div key={index} className="comment-item"><div className="comment-header"><span className="commenter-name"><User size={20} />{comment.name}</span><div className="rating-stars">{[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < comment.rating ? "#FFB527" : "none"} stroke="#FFB527" />)}</div></div><p className="comment-text">{comment.comment}</p><span className="comment-date"><Clock size={16} />{new Date(comment.created_at).toLocaleDateString(locale === 'fa' ? 'fa-IR' : locale)}</span></div>))}</div>) : (<p className="no-comments">{t('detail.comments.noComments')}</p>)}
              <div className="comment-form">
                <form onSubmit={handleSubmitComment}>
                  <h4>{t('detail.comments.formTitle')}</h4>
                  <div className="form-description">{t('detail.comments.formDescription')}</div>
                  <div className="form-group"><label>{t('detail.comments.nameLabel')}</label><input type="text" placeholder={t('detail.comments.namePlaceholder')} value={commentForm.name} onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })} required /></div>
                  <div className="form-group">
                    <label>{t('detail.comments.ratingLabel')}</label>
                    <div className="star-input" role="radiogroup">
                      {[1, 2, 3, 4, 5].map((starValue) => (<button key={starValue} type="button" role="radio" aria-checked={commentForm.rating >= starValue} className={`star${commentForm.rating >= starValue ? ' active' : ''}`} onClick={() => setCommentForm({ ...commentForm, rating: starValue })}><Star size={28} className="icon-star" aria-hidden="true" /></button>))}
                    </div>
                  </div>
                  <div className="form-group"><label>{t('detail.comments.commentLabel')}</label><textarea placeholder={t('detail.comments.commentPlaceholder')} value={commentForm.text} onChange={(e) => setCommentForm({ ...commentForm, text: e.target.value })} required /></div>
                  <div className="form-actions"><button className="btn primary" type="submit" disabled={commentSubmitting}>{commentSubmitting ? t('detail.comments.submittingButton') : t('detail.comments.submitButton')}</button>{commentError && <p className="error-message">{commentError}</p>}</div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;