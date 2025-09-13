// مسیر: src/app/[locale]/news/NewsDetails.js

'use client';

import React, { useState, useCallback, memo } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, Eye, Share2, Bookmark, Heart, ChevronLeft } from 'lucide-react';
import './NewsDetails.css';

const BackgroundElements = memo(() => (
  <><div className="news-detail-background" /><div className="news-detail-floating-elements"><div className="news-detail-orb news-detail-orb-1" /><div className="news-detail-orb news-detail-orb-2" /></div></>
));
BackgroundElements.displayName = 'BackgroundElements';

const ArticleHero = memo(({ article, locale }) => {
  const { t } = useTranslation('news');
  if (!article) return null;

  return (
    <section className="article-hero">
      <div className="hero-background-image"><img src={article.image || '/placeholder.webp'} alt={article.title} /></div>
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="breadcrumb">
          <Link href={`/${locale}`}>{t('common:home', 'خانه')}</Link> {/* Assuming 'home' is in 'common' namespace */}
          <span className="breadcrumb-separator">/</span>
          <Link href={`/${locale}/news`}>{t('details.breadcrumb')}</Link>
        </div>
        <h1 className="article-title">{article.title}</h1>
        <p className="article-excerpt">{article.excerpt}</p>
      </div>
      <div className="scroll-indicator">
        <div className="scroll-line" />
        <span className="scroll-text">{t('details.hero.scroll', 'اسکرول کنید')}</span>
      </div>
    </section>
  );
});
ArticleHero.displayName = 'ArticleHero';

const ArticleContent = memo(({ content }) => {
  const { t } = useTranslation('news');
  return (
    <main className="article-main-content">
      <div className="article-text" dangerouslySetInnerHTML={{ __html: content || t('details.noContent', 'محتوایی برای نمایش وجود ندارد.') }} />
    </main>
  );
});
ArticleContent.displayName = 'ArticleContent';

const ArticleSidebar = memo(({ article, readingTime, formattedDate, onLike, onBookmark, onShare }) => {
  const { t } = useTranslation('news');
  if (!article) return null;

  return (
    <aside className="article-sidebar">
      <div className="sidebar-block">
        <div className="sidebar-header"><Clock size={20} /><h3 className="sidebar-title">{t('details.sidebar.title')}</h3></div>
        <div className="meta-grid">
          <div className="meta-item"><div className="meta-icon-wrapper"><Calendar size={18} /></div><div><strong>{t('details.sidebar.publishDate')}</strong><span>{formattedDate}</span></div></div>
          <div className="meta-item"><div className="meta-icon-wrapper"><Clock size={18} /></div><div><strong>{t('details.sidebar.readingTimeLabel')}</strong><span>{t('details.sidebar.readingTimeText', { time: readingTime })}</span></div></div>
          <div className="meta-item"><div className="meta-icon-wrapper"><Eye size={18} /></div><div><strong>{t('details.sidebar.viewsLabel')}</strong><span>{t('details.sidebar.likes', { count: article.views || 0 })}</span></div></div>
        </div>
      </div>
      <div className="sidebar-block">
        <div className="sidebar-header"><Share2 size={20} /><h3 className="sidebar-title">{t('details.sidebar.interactionTitle')}</h3></div>
        <div className="action-buttons">
          <button className="action-btn" onClick={onLike}><Heart size={16} /><span>{t('details.sidebar.likes', { count: '' })}</span><div className="btn-ripple"></div></button>
          <button className="action-btn" onClick={onBookmark}><Bookmark size={16} /><span>{t('details.sidebar.bookmark')}</span><div className="btn-ripple"></div></button>
          <button className="action-btn" onClick={onShare}><Share2 size={16} /><span>{t('details.sidebar.share')}</span><div className="btn-ripple"></div></button>
        </div>
      </div>
    </aside>
  );
});
ArticleSidebar.displayName = 'ArticleSidebar';

const RelatedArticles = memo(({ locale }) => {
    const { t } = useTranslation('news');
    return (
        <section className="related-articles">
            <h2 className="section-title">{t('details.related.title')}</h2>
            <div className="empty-related">
                <p>{t('details.related.emptyText')}</p>
                <Link href={`/${locale}/news`} className="back-to-news-btn">
                    <ChevronLeft size={18} />
                    <span>{t('details.related.backButton')}</span>
                    <div className="btn-shine"></div>
                </Link>
            </div>
        </section>
    );
});
RelatedArticles.displayName = 'RelatedArticles';

export default function NewsDetail({ initialArticle }) {
  const { t, i18n } = useTranslation('news'); 
  const [article] = useState(initialArticle);
  
  const handleLike = useCallback(() => console.log("Liking article:", article?.id), [article]);
  const handleBookmark = useCallback(() => console.log("Bookmarking article:", article?.id), [article]);
  const handleShare = useCallback(() => {
    if (navigator.share && article) {
      navigator.share({ title: article.title, text: article.excerpt, url: window.location.href });
    } else {
      alert(t('details.shareFallback', 'برای اشتراک گذاری، لینک صفحه را کپی کنید.'));
    }
  }, [article, t]);

  if (!article) return <div className="loading-state">{t('details.loading', 'در حال بارگذاری...')}</div>;

  const formattedDate = new Date(article.created_at).toLocaleDateString(i18n.language === 'fa' ? 'fa-IR' : i18n.language, { year: 'numeric', month: 'long', day: 'numeric' });
  const readingTime = Math.ceil((article.content?.split(' ').length || 0) / 200);

  return (
    <div className="news-detail-page loaded">
      <BackgroundElements />
      <ArticleHero article={article} locale={i18n.language} />
      <div className="news-detail-container">
        <div className="article-layout">
          <ArticleContent content={article.content} />
          <ArticleSidebar article={article} readingTime={readingTime} formattedDate={formattedDate} onLike={handleLike} onBookmark={handleBookmark} onShare={handleShare} />
        </div>
        <RelatedArticles locale={i18n.language} />
      </div>
    </div>
  );
}