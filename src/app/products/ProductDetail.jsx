
"use client";
import React, { useState, useEffect, memo, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft,ArrowRight, Star, Heart, Share2, ShoppingCart, Zap, Settings, MessageCircle, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { db } from "../api";
import "./ProductDetail.css";

const ProductDetail = ({ id }) => {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [isLiked, setIsLiked] = useState(false);
  const [commentForm, setCommentForm] = useState({
    reviewer_name: "",
    rating: 5,
    comment: ""
  });
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // آدرس پایه برای دارایی‌ها و پلیس‌هولدر
  const BASE_URL = "https://funtec.ir";
  const PLACEHOLDER_IMAGE = "https://via.placeholder.com/800x600?text=No+Image+Available";

  useEffect(() => {
    setLoading(true);
    loadProduct();
  }, [id]);

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

  const loadProduct = async () => {
    try {
      const productDataRaw = await db.getProduct(parseInt(id)); 

      // این خط رو به حالت اولیه برگردوندیم.
      const productDataFromApi = productDataRaw; 

      if (!productDataFromApi || !productDataFromApi.id) {
        router.push('/products');
        return;
      }

      // --- پردازش تصاویر ---
      let finalImages = [];
      const rawImagesFromAPI = productDataFromApi.images; 

      let processedRawImages = [];
      if (Array.isArray(rawImagesFromAPI)) {
        processedRawImages = rawImagesFromAPI;
      } else if (typeof rawImagesFromAPI === 'string' && rawImagesFromAPI.trim() !== '') {
        processedRawImages = rawImagesFromAPI.split(',').map(img => img.trim());
      } else {
      }

      finalImages = processedRawImages
        .filter(img => {
          const isValid = img && typeof img === 'string' && img.trim() !== '';
          return isValid;
        })
        .map(img => {
          const trimmedImg = img.trim();
          const path = trimmedImg.startsWith('/') ? trimmedImg : `/${trimmedImg}`;
          const fullUrl = `${BASE_URL}${path}`;
          return fullUrl;
        });

      if (finalImages.length === 0 || finalImages.every(url => url === PLACEHOLDER_IMAGE)) {
        finalImages = [PLACEHOLDER_IMAGE];
      }

      // --- پردازش ویدیو ---
      let finalVideoUrl = null;
      const rawVideoFromAPI = productDataFromApi.background_video;

      if (rawVideoFromAPI && typeof rawVideoFromAPI === 'string' && rawVideoFromAPI.trim() !== '') {
        const videoPath = rawVideoFromAPI.startsWith('/') ? rawVideoFromAPI : `/${rawVideoFromAPI}`;
        finalVideoUrl = `${BASE_URL}${videoPath.trim()}`;
      } else {
      }

      // --- ساخت شی محصول نهایی برای State ---
      const fullProductToSet = {
        ...productDataFromApi,
        features: Array.isArray(productDataFromApi.features) ? productDataFromApi.features : [],
        specifications: Array.isArray(productDataFromApi.specifications) 
          ? productDataFromApi.specifications.reduce((acc, cur, idx) => ({ ...acc, [`ویژگی ${idx + 1}`]: cur }), {}) 
          : (typeof productDataFromApi.specifications === 'object' && productDataFromApi.specifications !== null ? productDataFromApi.specifications : {}),
        reviews: Array.isArray(productDataFromApi.reviews) ? productDataFromApi.reviews : [],
        images: finalImages, 
        background_video: finalVideoUrl, 
      };

      setProduct(fullProductToSet); 
      setActiveImageIndex(0); 

    } catch (error) {
      // Optionally handle error here
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  };

  const nextImage = useCallback(() => {
    if (product?.images?.length > 1) {
      setActiveImageIndex((prev) =>
        (prev + 1) % product.images.length
      );
    }
  }, [product?.images?.length]);

  const prevImage = useCallback(() => {
    if (product?.images?.length > 1) {
      setActiveImageIndex((prev) =>
        (prev - 1 + product.images.length) % product.images.length
      );
    }
  }, [product?.images?.length]);

  const getCurrentImage = useCallback(() => {
    if (product && product.images && product.images.length > 0) {
      return product.images[activeImageIndex];
    }
    return PLACEHOLDER_IMAGE;
  }, [product, activeImageIndex]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!commentForm.reviewer_name.trim() || !commentForm.comment.trim()) {
      alert('لطفاً نام و نظر خود را وارد کنید');
      return;
    }

    setIsSubmittingComment(true);

    try {
      await db.addReview(product.id, commentForm);
      alert('نظر شما با موفقیت ثبت شد!');
      setCommentForm({
        reviewer_name: "",
        rating: 5,
        comment: ""
      });
      loadProduct(); 
    } catch (error) {
      console.error('خطا در ثبت نظر:', error);
      alert('خطا در ثبت نظر. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentFormChange = (field, value) => {
    setCommentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const memoizedStarRating = useMemo(() => {
  const StarRating = React.memo(function StarRating({ rating, onRatingChange, readonly = false, size = "medium" }) {
    const [hoverRating, setHoverRating] = useState(0);

    const handleStarClick = (starValue) => {
      if (!readonly && onRatingChange) {
        onRatingChange(starValue);
      }
    };

    const handleStarHover = (starValue) => {
      if (!readonly) {
        setHoverRating(starValue);
      }
    };

    const handleStarLeave = () => {
      if (!readonly) {
        setHoverRating(0);
      }
    };

    return (
      <div className={`star-rating ${size} ${readonly ? 'readonly' : 'interactive'}`}>
        {[1, 2, 3, 4, 5].map((starValue) => (
          <button
            key={starValue}
            type="button"
            className={`star-button ${
              starValue <= (hoverRating || rating) ? 'filled' : 'empty'
            }`}
            onClick={() => handleStarClick(starValue)}
            onMouseEnter={() => handleStarHover(starValue)}
            onMouseLeave={handleStarLeave}
            disabled={readonly}
            aria-label={`${starValue} ستاره`}
          >
            <Star className="star-icon" fill={starValue <= (hoverRating || rating) ? "#ffb527" : "none"} />
          </button>
        ))}
      </div>
    );
  });
    return StarRating;
  }, []);

  // Attach StarRating to ProductDetail for use in ReviewsList
  ProductDetail.StarRating = memoizedStarRating;

  // Modal logic
  const handleMainImageClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
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
            <span>بازگشت به صفحه اصلی</span>
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
              onError={(e) => { 
                e.target.style.display = 'none'; 
                const imgElement = e.target.closest('.hero-background').querySelector('.hero-bg-image');
                if (imgElement) {
                    imgElement.style.display = 'block';
                }
              }}
            >
              <source src={product.background_video} type="video/mp4" />
            </video>
          ) : (
            <img
              src={getCurrentImage()}
              alt={product.title}
              className="hero-bg-image"
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
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`action-btn ${isLiked ? 'liked' : ''}`}
              >
                <Heart className="icon" fill={isLiked ? "#ff6b6b" : "none"} />
              </button>
              <button onClick={handleShare} className="action-btn">
                <Share2 className="icon" />
              </button>
            </div>
          </div>

          <div className="hero-info">
            {!!product.is_featured && (
              <div className="featured-badge">
                <Star className="icon" />
                <span>محصول ویژه</span>
              </div>
            )}

            <h1 className="product-title">{product.title}</h1>

            <div className="product-rating">
              <ProductDetail.StarRating
                rating={Math.floor(calculateAverageRating(product.reviews))}
                readonly={true}
                size="large"
              />
              <span className="rating-text">
                {calculateAverageRating(product.reviews)} ({product.reviews.length} نظر)
              </span>
            </div>

            <p className="product-description">{product.description}</p>

            <div className="hero-cta">
              <button className="cta-btn primary">
                <ShoppingCart className="icon" />
                <span>سفارش محصول</span>
              </button>
              <button className="cta-btn secondary">
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
            <div className={`main-image-container ${isMobile ? 'mobile' : ''}`}>
              <img
                src={getCurrentImage()}
                alt={product.title}
                className="main-image"
                loading="lazy"
                onClick={handleMainImageClick}
                style={{ cursor: 'zoom-in' }}
                onError={(e) => { 
                  e.target.onerror = null; 
                  e.target.src = PLACEHOLDER_IMAGE; 
                }}
              />
              {product.images && product.images.length > 1 && (
                <>
                  <button className="gallery-nav prev" onClick={prevImage} aria-label="تصویر قبلی">
                    <ChevronRight className="icon" />
                  </button>
                  <button className="gallery-nav next" onClick={nextImage} aria-label="تصویر بعدی">
                    <ChevronLeft className="icon" />
                  </button>
                </>
              )}
              <div className="image-indicator">
                {product.images.length ? `${activeImageIndex + 1} / ${product.images.length}` : '0 / 0'}
              </div>
            </div>

            {product.images && product.images.length > 1 && !isMobile && (
              <div className="thumbnail-grid">
                {product.images.map((image, idx) => (
                  <button
                    key={idx}
                    className={`thumbnail ${idx === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img
                      src={image}
                      alt={`تصویر ${idx + 1}`}
                      loading="lazy"
                      onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = PLACEHOLDER_IMAGE; 
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
            
            {/* Mobile thumbnail dots */}
            {product.images && product.images.length > 1 && isMobile && (
              <div className="mobile-dots">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    className={`dot ${idx === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`تصویر ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Modal for full image view */}
        {isModalOpen && (
          <div className="image-modal-overlay" onClick={handleModalClose}>
            <div className="image-modal-content" onClick={e => e.stopPropagation()}>
              <img
                src={getCurrentImage()}
                alt={product.title}
                className="modal-image"
              />
              <button className="close-modal-btn" onClick={handleModalClose} aria-label="بستن">
                <span style={{fontSize: '2rem'}}>&times;</span>
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="product-details-section">
        <div className="container">
          <div className={`details-tabs ${isMobile ? 'mobile' : ''}`}>
            <div className="tab-navigation">
              <button
                className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                {!isMobile && <MessageCircle className="icon" />}
                <span>توضیحات</span>
              </button>

              {product.features && product.features.length > 0 && (
                <button
                  className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`}
                  onClick={() => setActiveTab('features')}
                >
                  {!isMobile && <Zap className="icon" />}
                  <span>ویژگی‌ها</span>
                </button>
              )}

              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <button
                  className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('specs')}
                >
                  {!isMobile && <Settings className="icon" />}
                  <span>مشخصات</span>
                </button>
              )}

              <button
                className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                {!isMobile && <Star className="icon" />}
                <span>نظرات</span>
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'description' && (
                <div className="tab-panel description-panel">
                  <div className="panel-header">
                    <h3>درباره این محصول</h3>
                    <p>اطلاعات کامل و جزئیات محصول</p>
                  </div>
                  <div className="description-content">
                    <p>{product.description}</p>
                  </div>
                </div>
              )}

              {activeTab === 'features' && product.features && product.features.length > 0 && (
                <div className="tab-panel features-panel">
                  <div className="panel-header">
                    <h3>ویژگی‌های محصول</h3>
                    <p>امکانات و قابلیت‌های خاص این محصول</p>
                  </div>
                  <div className="features-grid">
                    {product.features.map((feature, idx) => (
                      <div key={idx} className="feature-card">
                        <div className="feature-icon">
                          <Zap className="icon" />
                        </div>
                        <div className="feature-content">
                          <h4>ویژگی {idx + 1}</h4>
                          <p>{feature}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'specs' && product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="tab-panel specs-panel">
                  <div className="panel-header">
                    <h3>مشخصات فنی</h3>
                    <p>جزئیات فنی و اطلاعات دقیق محصول</p>
                  </div>
                  <div className="specs-table">
                    {Object.entries(product.specifications).map(([spec_key, spec_value]) => (
                      <div key={spec_key} className="spec-row">
                        <div className="spec-label">{spec_key}</div>
                        <div className="spec-value">{spec_value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="tab-panel reviews-panel">
                  <div className="panel-header">
                    <h3>نظرات کاربران</h3>
                    <p>تجربه و نظرات سایر کاربران</p>
                  </div>

                  {product.reviews && product.reviews.length > 0 ? (
                    <div className="reviews-summary">
                      <div className="summary-stats">
                        <div className="avg-rating">
                          <span className="rating-number">{calculateAverageRating(product.reviews)}</span>
                          <ProductDetail.StarRating
                            rating={Math.floor(calculateAverageRating(product.reviews))}
                            readonly={true}
                            size="medium"
                          />
                        </div>
                        <div className="total-reviews">
                          {product.reviews.length} نظر ثبت شده
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="no-reviews">
                      <p>هنوز نظری برای این محصول ثبت نشده است. اولین نفری باشید که نظر می‌دهد!</p>
                    </div>
                  )}

                  <div className="comment-form">
                    <h4>نظر خود را بنویسید</h4>
                    <form onSubmit={handleCommentSubmit}>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="reviewer_name">نام شما</label>
                          <input
                            id="reviewer_name"
                            type="text"
                            value={commentForm.reviewer_name}
                            onChange={(e) => handleCommentFormChange('reviewer_name', e.target.value)}
                            placeholder="نام خود را وارد کنید"
                            required
                            disabled={isSubmittingComment}
                          />
                        </div>
                        <div className="form-group">
                          <label>امتیاز شما</label>
                          <ProductDetail.StarRating
                            rating={commentForm.rating}
                            onRatingChange={(rating) => handleCommentFormChange('rating', rating)}
                            readonly={isSubmittingComment}
                            size="medium"
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="comment">نظر شما</label>
                        <textarea
                          id="comment"
                          value={commentForm.comment}
                          onChange={(e) => handleCommentFormChange('comment', e.target.value)}
                          placeholder="نظر خود را در مورد این محصول بنویسید..."
                          rows={4}
                          required
                          disabled={isSubmittingComment}
                        />
                      </div>
                      <button
                        type="submit"
                        className="submit-btn"
                        disabled={isSubmittingComment}
                      >
                        {isSubmittingComment ? 'در حال ارسال...' : 'ثبت نظر'}
                      </button>
                    </form>
                  </div>

                  {product.reviews && product.reviews.length > 0 && (
                    <ReviewsList reviews={product.reviews} />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Memoize helper functions
const getReviewerInitial = (reviewerName) => {
  if (!reviewerName || typeof reviewerName !== 'string') {
    return '?';
  }
  return reviewerName.charAt(0).toUpperCase();
};

const formatDate = (dateString) => {
  if (!dateString) return 'تاریخ نامشخص';
  try {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return 'تاریخ نامشخص';
  }
};

// Memoize reviews list
const ReviewsList = React.memo(function ReviewsList({ reviews }) {
  return (
    <div className="reviews-list">
      {reviews.map((review, idx) => (
        <div key={idx} className="review-card">
          <div className="review-header">
            <div className="reviewer-info">
              <div className="reviewer-avatar">
                {getReviewerInitial(review.reviewer_name)}
              </div>
              <div className="reviewer-details">
                <h5>{review.reviewer_name}</h5>
                <span className="review-date">{formatDate(review.created_at)}</span>
              </div>
            </div>
            <ProductDetail.StarRating
              rating={review.rating || 0}
              readonly={true}
              size="small"
            />
          </div>
          <p className="review-comment">{review.comment}</p>
        </div>
      ))}
    </div>
  );
});

export default ProductDetail;