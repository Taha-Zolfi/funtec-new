'use client';

import React, { useState, useEffect } from "react";
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Calendar, Clock, User, Eye, Share2, ArrowLeft, Bookmark, Heart, Star } from 'lucide-react';
// Import the CSS file so Next.js can handle it
import './NewsDetails.css';

export default function NewsDetail({ article }) {
  // --- State Management ---
  const [likes, setLikes] = useState(article.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // --- Effects ---
  // Effect to add a 'loaded' class for fade-in animations
  useEffect(() => {
    // Use a short timeout to ensure the component is mounted before animating
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // --- Event Handlers ---
  const handleLike = async () => {
    // Prevents multiple rapid clicks and handles un-liking
    const newLikeStatus = !hasLiked;
    const newLikesCount = newLikeStatus ? likes + 1 : likes - 1;

    setHasLiked(newLikeStatus);
    setLikes(newLikesCount);

    try {
      // API call to update the likes count on the server
      await api.updateNews(article.id, {
        ...article,
        likes: newLikesCount
      });
    } catch (error) {
      console.error('Error updating likes:', error);
      // Revert state if the API call fails
      setHasLiked(!newLikeStatus);
      setLikes(likes);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Here you would typically make an API call to save the bookmark state for the user
  };

  // --- Data Formatting ---
  const formattedDate = new Date(article.created_at).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const readingTime = Math.ceil((article.content?.split(' ').length || 0) / 200); // Average reading speed

  // --- Render ---
  return (
    <div className={`news-detail-page ${isLoaded ? 'loaded' : ''}`}>
      <div className="news-detail-background"></div>
      <div className="news-detail-floating-elements">
        <div className="news-detail-orb news-detail-orb-1"></div>
        <div className="news-detail-orb news-detail-orb-2"></div>
      </div>

      <div className="news-detail-container">
        {/* --- Breadcrumb Navigation --- */}
        <nav className="breadcrumb">
          <Link href="/news">اخبار</Link>
          <span className="breadcrumb-separator">/</span>
          <span>{article.title}</span>
        </nav>

        <div className="article-container">
          {/* --- Article Header --- */}
          <header className="article-header">
            <div className="article-badges">
              {article.category && <div className="article-category">{article.category}</div>}
              {article.is_featured && (
                <div className="article-featured-badge">
                  <Star size={14} />
                  <span>خبر ویژه</span>
                </div>
              )}
            </div>

            <h1 className="article-title">{article.title}</h1>

            {article.excerpt && <p className="article-excerpt">{article.excerpt}</p>}

            <div className="article-meta">
              <div className="article-meta-left">
                {article.author && (
                  <div className="meta-item">
                    <User size={16} />
                    <span>{article.author}</span>
                  </div>
                )}
                <div className="meta-item">
                  <Calendar size={16} />
                  <span>{formattedDate}</span>
                </div>
                <div className="meta-item">
                  <Clock size={16} />
                  <span>زمان مطالعه: {readingTime} دقیقه</span>
                </div>
                <div className="meta-item">
                  <Eye size={16} />
                  <span>{article.views || 0} بازدید</span>
                </div>
              </div>
              <div className="article-actions">
                <button className="share-btn">
                  <Share2 size={16} />
                  <span>اشتراک گذاری</span>
                </button>
                <Link href="/news" className="nback-btn">
                  <ArrowLeft size={16} />
                  <span>بازگشت</span>
                </Link>
              </div>
            </div>
          </header>

          {/* --- Article Image --- */}
          {article.image && (
            <div className="article-image-container">
              <Image
                src={article.image}
                alt={article.title}
                className="article-image"
                layout="fill"
                objectFit="cover"
                priority
              />
            </div>
          )}

          {/* --- Article Content --- */}
          <div className="article-content">
            <div
              className="article-text"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          {/* --- Article Footer --- */}
          <footer className="article-footer">
            <div className="footer-info">
              از مطالعه این مطلب لذت بردید؟
            </div>
            <div className="footer-actions">
              <button
                className={`naction-btn ${hasLiked ? 'active' : ''}`}
                onClick={handleLike}
              >
                <Heart size={16} />
                <span>{likes}</span>
              </button>
              <button
                className={`naction-btn ${isBookmarked ? 'active' : ''}`}
                onClick={handleBookmark}
              >
                <Bookmark size={16} />
                <span>{isBookmarked ? 'ذخیره شد' : 'ذخیره'}</span>
              </button>
            </div>
          </footer>
        </div>
        
        {/* Placeholder for Related Articles section */}
        <section className="related-articles">
            <div className="related-header">
                <h2 className="related-title">اخبار مرتبط</h2>
                <div className="related-line"></div>
            </div>
            <div className="related-grid">
                {/* Related articles would be mapped here */}
            </div>
        </section>

      </div>
    </div>
  );
}
