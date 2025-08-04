"use client";
import React, { useMemo, useCallback, memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Eye,
  User,
  Share2,
  Clock,
  ArrowLeft,
  ChevronRight,
  Star,
  ChevronLeft
} from 'lucide-react';
import { db } from "../api";
import './NewsDetails.css';

const RelatedArticleCard = memo(({ article, onReadingTimeCalculate }) => (
  <Link href={`/news/${article.id}`} className="related-card">
    <div className="related-image">
      <img
        src={article.image || "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg"}
        alt={article.title}
        loading="lazy"
        onError={(e) => {
          e.target.src = "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg";
        }}
      />
    </div>
    <div className="related-content">
      <div className="related-meta">
        <span className="related-category">{article.category || 'عمومی'}</span>
        <span className="related-date">{new Date(article.created_at).toLocaleDateString('fa-IR')}</span>
      </div>
      <h3 className="related-card-title">{article.title}</h3>
      <p className="related-excerpt">{article.excerpt}</p>
      <div className="related-stats">
        <span className="related-views">
          <Eye size={14} />
          {article.views >= 1000 ? `${(article.views / 1000).toFixed(1)}k` : article.views || 0}
        </span>
        <span className="related-reading-time">
          <Clock size={14} />
          {onReadingTimeCalculate(article.content)} دقیقه
        </span>
      </div>
    </div>
  </Link>
));

const NewsDetails = ({ article }) => {
  const router = useRouter();

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const formatViews = useCallback((views) => {
    return views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views || 0;
  }, []);

  const getReadingTime = useCallback((content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  }, []);

  const articleParagraphs = useMemo(() => {
    if (!article?.content) return [];
    return article.content.split('\n').filter(p => p.trim());
  }, [article]);

  // Data is now passed as a prop from the page, so no fetching here.

  const handleShare = useCallback(async () => {
    const shareData = {
      title: article.title,
      text: article.excerpt,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('لینک کپی شد!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [article]);

  if (!article) {
    return (
      <div className="error-state">
        <h2>خطا در بارگذاری</h2>
        <p>خبر مورد نظر یافت نشد</p>
        <button onClick={() => router.push('/news')} className="back-to-news-btn">
          <ArrowLeft size={20} /> بازگشت به اخبار
        </button>
      </div>
    );
  }
  return (
    <div className="news-detail-page loaded">
      <div className="news-detail-background" />
      <div className="news-detail-floating-elements">
        <div className="news-detail-orb news-detail-orb-1" />
        <div className="news-detail-orb news-detail-orb-2" />
      </div>

      <div className="news-detail-container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link href="/news">اخبار</Link>
          <span className="breadcrumb-separator">
            <ChevronRight size={16} />
          </span>
          <Link href={`/news?category=${article.category}`}>
            {article.category || 'عمومی'}
          </Link>
          <span className="breadcrumb-separator">
            <ChevronRight size={16} />
          </span>
          <span>{article.title}</span>
        </nav>

        {/* Article Container */}
        <article className="article-container">
          {/* Article Header */}
          <header className="article-header">
            <div className="article-badges">
              <span className="article-category">{article.category || 'عمومی'}</span>
              {article.is_featured && (
                <div className="article-featured-badge">
                  <Star size={16} />
                  <span>خبر ویژه</span>
                </div>
              )}
            </div>

            <h1 className="article-title">{article.title}</h1>

            <div className="article-excerpt">{article.excerpt}</div>

            <div className="article-meta">
              <div className="article-meta-left">
                <div className="meta-item">
                  <Calendar size={18} />
                  <span>{formatDate(article.created_at)}</span>
                </div>
                <div className="meta-item">
                  <Eye size={18} />
                  <span>{formatViews(article.views)} بازدید</span>
                </div>
                <div className="meta-item">
                  <Clock size={18} />
                  <span>{getReadingTime(article.content)} دقیقه مطالعه</span>
                </div>
                <div className="meta-item">
                  <User size={18} />
                  <span>{article.author || 'فان تک'}</span>
                </div>
              </div>

              <div className="article-actions">
                <button onClick={handleShare} className="share-btn">
                  <Share2 size={18} />
                  <span>اشتراک‌گذاری</span>
                </button>
                <Link href="/news" className="nback-btn">
                  <ArrowLeft size={18} />
                  <span>بازگشت</span>
                </Link>
              </div>
            </div>
          </header>

          {/* Article Image */}
          {article.image && (
            <div className="article-image-container">
              <img
                src={article.image}
                alt={article.title}
                className="article-image"
                onError={(e) => {
                  e.target.src = "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg";
                }}
              />
            </div>
          )}

          {/* Article Content */}
          <div className="article-content">
            <div className="article-text">
              {articleParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Article Footer */}
          <footer className="article-footer">
            <div className="footer-info">
              <p>آخرین بروزرسانی: {formatDate(article.updated_at)}</p>
            </div>
            <div className="footer-actions">
              <button onClick={handleShare} className="share-btn">
                <Share2 size={18} />
                اشتراک‌گذاری
              </button>
            </div>
          </footer>
        </article>

        {/* Article Navigation */}
        {/* Navigation to prev/next articles is disabled for now, as relatedNews is not fetched in this mode. */}

        {/* Related Articles (disabled in SSR context) */}
      </div>
    </div>
  );
};

export default NewsDetails;