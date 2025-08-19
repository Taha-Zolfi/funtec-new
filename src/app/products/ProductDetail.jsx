"use client";
import React, { useState, useEffect, useCallback, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from 'react-dom';
import { useRouter } from "next/navigation";
import { ArrowLeft, Star, Heart, Share2, ShoppingCart, MessageCircle, ChevronLeft, ChevronRight, Home, User, Clock, X } from "lucide-react";
import { api } from "@/lib/api";
import "./ProductDetail.css";

const ProductDetail = ({ productId }) => {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [commentForm, setCommentForm] = useState({ name: '', rating: 5, text: '' });
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState(null);

  // آدرس پایه برای دارایی‌ها و پلیس‌هولدر
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
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Add useEffect hook for scroll lock
  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  // Replace the centering hook below if it was previously useEffect
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
    // Call immediately after mount
    centerModal();
    window.addEventListener('resize', centerModal);
    return () => window.removeEventListener('resize', centerModal);
  }, []);

  const loadProduct = async () => {
    try {
      const productData = await api.getProduct(parseInt(productId));
      console.log("Product details:", productData);

      if (!productData || !productData.id) {
        router.push('/products');
        return;
      }

      // Parse arrays if they are strings and ensure they are not null/undefined
      const processedProduct = {
        ...productData,
        features: Array.isArray(productData.features) ? productData.features : 
                 (productData.features ? productData.features.split(',').filter(Boolean) : []),
        specifications: Array.isArray(productData.specifications) ? productData.specifications :
                       (productData.specifications ? productData.specifications.split(',').filter(Boolean) : []),
        images: Array.isArray(productData.images) ? productData.images.filter(Boolean) :
                (productData.images ? productData.images.split(',').filter(Boolean) : []),
        comments: productData.comments || [],
        short_description: productData.short_description || '',
        full_description: productData.full_description || ''
      };

      // Add placeholder if no images
      if (!processedProduct.images || processedProduct.images.length === 0) {
        processedProduct.images = [PLACEHOLDER_IMAGE];
      }

      setProduct(processedProduct);
      setActiveImageIndex(0);

    } catch (error) {
      // Optionally handle error here
    } finally {
      setLoading(false);
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
      setActiveImageIndex((prev) =>
        (prev + 1) % (product?.images?.length || 1)
      );
    }
  }, [product?.images?.length]);

  const prevImage = useCallback(() => {
    if (product?.images?.length > 1) {
      setActiveImageIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  }, [product?.images?.length]);

  // Modal logic
  const openImageModal = (image) => {
    setModalImage(image);
    setIsModalOpen(true);
    // Lock scroll
    document.body.style.overflow = 'hidden';
    // Add padding to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
    // Restore scroll
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  };



  const handleSubmitComment = async () => {
    setCommentSubmitting(true);
    setCommentError(null);
    try {
      await api.submitComment(product.id, {
        name: commentForm.name,
        rating: commentForm.rating,
        comment: commentForm.text
      });
      await loadProduct(); // بارگذاری مجدد محصول برای نمایش نظر جدید
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
        // Optionally handle error here
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('لینک کپی شد!');
    }
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

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
      <section className="product-hero">
        <div className="hero-background">
          {product.background_video ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="hero-bg-video"
              key={product.background_video}
            >
              <source src={product.background_video} type="video/mp4" />
            </video>
          ) : (
            <img
              src={getCurrentImage()}
              alt={product.name}
              className="hero-bg-image clickable"
              onClick={() => openImageModal(getCurrentImage())}
              onError={(e) => { 
                e.target.onerror = null; 
                e.target.src = PLACEHOLDER_IMAGE; 
              }}
            />
          )}
          <div className="hero-overlay"></div>
        </div>

        <div className="hero-content">
          <div className="hero-navigation">
            <button onClick={() => router.push('/products')} className="back-btn">
              <ArrowLeft className="icon" />
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
            
            {/* Short description should appear right under the title on mobile/desktop */}
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
              <button className="cta-btn primary">
                <MessageCircle className="icon" />
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
              <a href={getCurrentImage()} target="_blank" rel="noopener noreferrer">
                <img
                  src={getCurrentImage()}
                  alt={product.name}
                  className="main-image"
                  onError={(e) => { 
                    e.target.onerror = null; 
                    e.target.src = PLACEHOLDER_IMAGE; 
                  }}
                />
              </a>
              
              {product.images && product.images.length > 1 && (
                <div className="gallery-navigation">
                  <button 
                    className="nav-button prev" 
                    onClick={prevImage} 
                    aria-label="تصویر قبلی"
                    disabled={activeImageIndex === 0}
                  >
                    <ChevronRight className="icon" />
                  </button>
                  <button 
                    className="nav-button next" 
                    onClick={nextImage} 
                    aria-label="تصویر بعدی"
                    disabled={activeImageIndex === product.images.length - 1}
                  >
                    <ChevronLeft className="icon" />
                  </button>
                </div>
              )}

              {product.images && product.images.length > 1 && (
                <div className="image-counter">
                  {activeImageIndex + 1} / {product.images.length}
                </div>
              )}
            </div>

            {!isMobile && product.images && product.images.length > 1 && (
              <div className="thumbnail-grid">
                {product.images.map((image, idx) => (
                  <button
                    key={idx}
                    className={`thumbnail-button ${idx === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`نمایش تصویر ${idx + 1}`}
                  >
                    <img
                      src={image}
                      alt={`تصویر ${idx + 1} ${product.name}`}
                      loading="lazy"
                      className="clickable"
                      onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = PLACEHOLDER_IMAGE; 
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>


      </section>

      {/* Product Details */}
      <section className="product-details-section">
        <div className="container">
          <div className="product-content">
            {/* Short Description */}
            {/* features list */}
            {product.features && product.features.length > 0 && (
              <div className="product-features">
                <h3>ویژگی‌ها</h3>
                <ul>
                  {product.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Full Description */}
            <div className="description-content" dangerouslySetInnerHTML={{ __html: product.full_description || 'توضیحات تکمیلی موجود نیست.' }} />
            
            {/* Specifications */}
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

            {/* Comments Section */}
            <div className="comments-section">
              <h3>نظرات کاربران</h3>
              {product.comments && product.comments.length > 0 ? (
                <div className="comments-list">
                  {product.comments.map((comment, index) => (
                    <div key={index} className="comment-item">
                      <div className="comment-header">
                        <span className="commenter-name">
                          <User size={20} />
                          {comment.name}
                        </span>
                        <div className="rating-stars">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              fill={i < comment.rating ? "#FFB527" : "none"}
                              stroke={i < comment.rating ? "#FFB527" : "#666"}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="comment-text">{comment.comment}</p>
                      <span className="comment-date">
                        <Clock size={16} />
                        {new Date(comment.created_at).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-comments">هنوز نظری برای این محصول ثبت نشده است.</p>
              )}

              {/* Comment Form */}
              <div className="comment-form">
                <form style={{ position: 'relative', zIndex: 50 }} onSubmit={(e)=>{ e.preventDefault(); handleSubmitComment(); }} aria-label="ارسال نظر">
                  <h4>ثبت نظر</h4>
                  <div className="form-description">
                    نظر خود را درباره این محصول با دیگران به اشتراک بگذارید. نظر شما به انتخاب بهتر سایر کاربران کمک خواهد کرد.
                  </div>
                  <div className="form-group">
                    <label>نام شما</label>
                    <input 
                      name="name" 
                      type="text"
                      placeholder="نام خود را وارد کنید" 
                      value={commentForm.name} 
                      onChange={(e)=> setCommentForm({...commentForm, name: e.target.value})} 
                      aria-label="نام" 
                    />
                  </div>
                  <div className="form-group">
                    <label>امتیاز شما</label>
                    <div className="star-input" aria-label={`رتبه: ${commentForm.rating} از 5`} role="radiogroup">
                      {[1,2,3,4,5].map((n)=> (
                        <button
                          key={n}
                          type="button"
                          role="radio"
                          aria-checked={commentForm.rating === n}
                          tabIndex={0}
                          className={"star" + (commentForm.rating >= n ? ' active' : '')}
                          onClick={()=> setCommentForm({...commentForm, rating: n})}
                          onKeyDown={(e)=> { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCommentForm({...commentForm, rating: n}); } }}
                        >
                          <Star size={28} className="icon-star" aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>متن نظر</label>
                    <textarea 
                      name="text" 
                      placeholder="نظر خود را بنویسید..." 
                      value={commentForm.text} 
                      onChange={(e)=> setCommentForm({...commentForm, text: e.target.value})} 
                      aria-label="متن نظر" 
                    />
                  </div>
                  <div className="form-actions">
                    <button 
                      className="btn primary" 
                      type="submit" 
                      disabled={commentSubmitting} 
                      aria-busy={commentSubmitting}
                    >
                      {commentSubmitting ? 'در حال ارسال...' : 'ثبت نظر'}
                    </button>
                    {commentError && (
                      <p className="error-message" role="alert">
                        {commentError}
                      </p>
                    )}
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
