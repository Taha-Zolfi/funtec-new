/* -----------------------------------------------------------------------
   NewsDetails.js – v2.0 (Complete Redesign)
   -----------------------------------------------------------------------
   • Modern hero section with background image.
   • Two-column layout with a sticky sidebar for metadata and actions.
   • Enhanced focus on readability and professional aesthetics.
   • Refactored into logical sub-components for clarity.
   • Preserves the original blue/dark theme.
   ----------------------------------------------------------------------- */

'use client';

import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Calendar,
  Clock,
  Eye,
  Share2,
  Bookmark,
  Heart,
  Star,
  ArrowLeft,
} from 'lucide-react';
import './NewsDetails.css'; // We will use the new CSS file

// --- Helper: Debounce (No changes needed) ---
function useDebouncedCallback(callback, delay = 300) {
  const timeout = useRef(null);
  return (...args) => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => callback(...args), delay);
  };
}

// --- NEW Sub-components for the Redesigned Layout ---

// 1. The new impressive Hero Section
const ArticleHero = memo(({ article }) => (
  <section className="article-hero">
    {article.image && (
      <Image
        src={article.image}
        alt={article.title}
        fill
        className="hero-background-image"
        priority
      />
    )}
    <div className="hero-overlay" />
    <div className="hero-content">
      <nav className="breadcrumb">
        <Link href="/news">اخبار</Link>
        <span className="breadcrumb-separator">/</span>
        <span>{article.title}</span>
      </nav>
      {article.is_featured && (
        <div className="article-featured-badge">
          <Star size={14} />
          <span>خبر ویژه</span>
        </div>
      )}
      <h1 className="article-title">{article.title}</h1>
      {article.excerpt && <p className="article-excerpt">{article.excerpt}</p>}
    </div>
  </section>
));

// 2. The sticky sidebar for actions and metadata
const ArticleSidebar = memo(
  ({ article, readingTime, formattedDate, likes, hasLiked, isBookmarked, onLike, onBookmark }) => (
    <aside className="article-sidebar">
      <div className="sidebar-block">
        <h3 className="sidebar-title">جزئیات</h3>
        <div className="meta-grid">
          <div className="meta-item">
            <Calendar size={18} />
            <div>
              <strong>تاریخ انتشار</strong>
              <span>{formattedDate}</span>
            </div>
          </div>
          <div className="meta-item">
            <Clock size={18} />
            <div>
              <strong>زمان مطالعه</strong>
              <span>حدود {readingTime} دقیقه</span>
            </div>
          </div>
          <div className="meta-item">
            <Eye size={18} />
            <div>
              <strong>تعداد بازدید</strong>
              <span>{article.views || 0}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="sidebar-block">
        <h3 className="sidebar-title">تعامل</h3>
        <div className="action-buttons">
          <button className={`action-btn ${hasLiked ? 'active' : ''}`} onClick={onLike} aria-label="Like this article">
            <Heart size={16} />
            <span>{likes} پسند</span>
          </button>
          <button className={`action-btn ${isBookmarked ? 'active' : ''}`} onClick={onBookmark} aria-label="Bookmark this article">
            <Bookmark size={16} />
            <span>{isBookmarked ? 'ذخیره شد' : 'ذخیره'}</span>
          </button>
          <button className="action-btn" onClick={() => navigator.share({ title: article.title, url: window.location.href })} aria-label="Share this article">
            <Share2 size={16} />
            <span>اشتراک‌گذاری</span>
          </button>
        </div>
      </div>
    </aside>
  )
);

// --- Main Component (Re-structured) ---
export default function NewsDetail({ article }) {
  const [likes, setLikes] = useState(article.likes ?? 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const formattedDate = new Date(article.created_at).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const readingTime = Math.ceil((article.content?.split(' ').length || 0) / 200);

  const debouncedUpdate = useDebouncedCallback(async (newLikesCount) => {
    try {
      await api.updateNews(article.id, { ...article, likes: newLikesCount });
    } catch (err) {
      console.error('Failed to persist like count:', err);
      setHasLiked((prev) => !prev);
      setLikes((prev) => (hasLiked ? prev + 1 : prev - 1));
    }
  }, 300);

  const handleLike = useCallback(() => {
    setHasLiked((prev) => !prev);
    setLikes((prev) => (hasLiked ? prev - 1 : prev + 1));
    debouncedUpdate(hasLiked ? likes - 1 : likes + 1);
  }, [hasLiked, likes, debouncedUpdate]);

  const handleBookmark = useCallback(() => {
    setIsBookmarked((prev) => !prev);
  }, []);

  return (
    <div className={`news-detail-page ${isLoaded ? 'loaded' : ''}`}>
      <div className="news-detail-background" />
      <div className="news-detail-floating-elements">
        <div className="news-detail-orb news-detail-orb-1" />
        <div className="news-detail-orb news-detail-orb-2" />
      </div>

      <ArticleHero article={article} />

      <div className="news-detail-container">
        <div className="article-layout">
          <main className="article-main-content">
            <div
              className="article-text"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </main>
          <ArticleSidebar
            article={article}
            readingTime={readingTime}
            formattedDate={formattedDate}
            likes={likes}
            hasLiked={hasLiked}
            isBookmarked={isBookmarked}
            onLike={handleLike}
            onBookmark={handleBookmark}
          />
        </div>

        {/* Placeholder for Related Articles section */}
        <section className="related-articles">
          <h2 className="section-title">اخبار مرتبط</h2>
          <div className="related-grid">
            {/* You can map over related articles here */}
            <div className="empty-related">
              <p>در حال حاضر خبر مرتبطی وجود ندارد.</p>
              <Link href="/news" className="back-to-news-btn">
                <ArrowLeft size={18} />
                بازگشت به لیست اخبار
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}