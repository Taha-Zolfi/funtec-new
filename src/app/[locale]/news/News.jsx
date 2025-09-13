// مسیر: src/app/[locale]/news/News.jsx

"use client";
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Eye, Clock, Search, Filter, Star, TrendingUp, Archive, Mail, Share2, Bookmark, BookmarkCheck, Heart, RefreshCw, Zap, Menu, X, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import './News.css';
import { api } from '@/lib/api';

const NewsItem = memo(({ article, index, onBookmark, onLike, onShare }) => {
  const { t, i18n } = useTranslation('news');
  const readingTime = Math.ceil((article.excerpt?.split(' ').length || 0) / 100);

  const handleBookmarkClick = (e) => { e.preventDefault(); e.stopPropagation(); onBookmark(article.id); };
  const handleLikeClick = (e) => { e.preventDefault(); e.stopPropagation(); onLike(article.id); };
  const handleShareClick = (e) => { e.preventDefault(); e.stopPropagation(); onShare('telegram', article); };

  return (
    <Link href={`/${i18n.language}/news/${article.id}`} className="news-item" style={{ '--animation-delay': `${index * 0.1}s` }} passHref>
      <div className="news-thumbnail">
        <img src={article.image || "/placeholder.webp"} alt={article.title} loading="lazy" onError={(e) => { e.target.src = "/placeholder.webp" }} />
        <div className="thumbnail-overlay">
           <div className="news-article-actions">
            <button className="news-naction-btn bookmark" onClick={handleBookmarkClick} title={t('list.item.bookmarkTitle')}><Bookmark size={16} /></button>
            <button className="news-naction-btn like" onClick={handleLikeClick} title={t('list.item.likeTitle')}><Heart size={16} /></button>
            <button className="news-naction-btn share" onClick={handleShareClick} title={t('list.item.shareTitle')}><Share2 size={16} /></button>
          </div>
        </div>
      </div>
      <div className="news-content">
        <div className="news-header-info">
          <span className="news-date">{new Date(article.created_at).toLocaleDateString(i18n.language === 'fa' ? 'fa-IR' : i18n.language, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <h3 className="news-title">{article.title}</h3>
        <p className="news-excerpt">{article.excerpt}</p>
        <div className="news-footer">
          <div className="news-stats">
            <div className="stat-item"><Eye size={16} /><span>{article.views >= 1000 ? `${(article.views / 1000).toFixed(1)}k` : article.views || 0}</span></div>
            <div className="stat-item"><Clock size={16} /><span>{t('list.item.readingTime', { time: readingTime })}</span></div>
          </div>
        </div>
      </div>
    </Link>
  );
});
NewsItem.displayName = "NewsItem";

const FeaturedNews = memo(({ article, onReadArticle }) => {
  const { t, i18n } = useTranslation('news');
  return (
    <div className="featured-news" onClick={() => onReadArticle(article)}>
      <div className="featured-image">
        <img src={article.image || "/placeholder.webp"} alt={article.title} loading="lazy" onError={(e) => { e.target.src = "/placeholder.webp" }} />
        <div className="featured-overlay"><div className="featured-badge"><Star size={20} /><span>{t('list.featured.badge')}</span></div></div>
      </div>
      <div className="featured-content">
        <div className="featured-meta">
          <span className="featured-date">{new Date(article.created_at).toLocaleDateString(i18n.language === 'fa' ? 'fa-IR' : i18n.language, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <h2 className="featured-title">{article.title}</h2>
        <p className="featured-excerpt">{article.excerpt}</p>
        <button className="featured-read-btn"><span>{t('list.featured.readMore')}</span><Zap size={20} /></button>
      </div>
    </div>
  );
});
FeaturedNews.displayName = "FeaturedNews";

const News = ({ initialNews }) => {
  const { t, i18n } = useTranslation('news');
  const router = useRouter();
  
  const [articles, setArticles] = useState(initialNews || []);
  const [featuredArticle, setFeaturedArticle] = useState(null);
  const [isLoaded, setIsLoaded] = useState(!!initialNews);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const articlesPerPage = 12;

  useEffect(() => {
    if (initialNews) {
      setArticles(initialNews);
      const featured = initialNews.find(a => a.is_featured) || initialNews[0];
      setFeaturedArticle(featured);
      setIsLoaded(true);
    }
  }, [initialNews]);
  
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const refreshedArticles = await api.getNews({ locale: i18n.language });
      setArticles(refreshedArticles);
    } catch (error) { console.error('Failed to refresh news:', error); } 
    finally { setIsRefreshing(false); }
  }, [i18n.language]);

  const handleReadArticle = useCallback((article) => router.push(`/${i18n.language}/news/${article.id}`), [router, i18n.language]);

  const filteredAndSortedArticles = useMemo(() => {
    let result = articles.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()));
    if (sortBy === 'views') result.sort((a, b) => (b.views || 0) - (a.views || 0));
    else result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return result;
  }, [articles, searchTerm, sortBy]);
  
  const currentArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * articlesPerPage;
    return filteredAndSortedArticles.slice(startIndex, startIndex + articlesPerPage);
  }, [filteredAndSortedArticles, currentPage, articlesPerPage]);

  const totalPages = Math.ceil(filteredAndSortedArticles.length / articlesPerPage);

  const handleBookmark = (id) => console.log("Bookmark article:", id);
  const handleLike = (id) => console.log("Like article:", id);
  const handleShare = (platform, article) => console.log(`Sharing ${article.title} on ${platform}`);
  
  // خواندن گزینه‌های فیلتر از فایل ترجمه
  const sortOptions = t('list.filters.sortOptions', { returnObjects: true, defaultValue: [] });
  
  if (!isLoaded) return <div>{t('list.loading', 'Loading...')}</div>;

  return (
    <div className="news-page loaded">
      <div className="news-background"><div className="news-floating-elements"><div className="news-orb news-orb-1"></div><div className="news-orb news-orb-2"></div><div className="news-orb news-orb-3"></div></div></div>
      <div className="news-container">
        <section className="news-hero">
          <div className="news-hero-badge"><TrendingUp size={24} /><span>{t('list.hero.badge')}</span></div>
          <h1 className="news-hero-title">{t('list.hero.title')}</h1>
          <p className="news-hero-subtitle">{t('list.hero.subtitle')}</p>
          <div className="nhero-actions">
            <button className="refresh-btn" onClick={handleRefresh} disabled={isRefreshing}><RefreshCw size={20} className={isRefreshing ? 'spinning' : ''} />{isRefreshing ? t('list.hero.refreshingButton') : t('list.hero.refreshButton')}</button>
          </div>
        </section>

        {featuredArticle && (<section className="news-featured-section"><FeaturedNews article={featuredArticle} onReadArticle={handleReadArticle} /></section>)}

        <section className="news-filters">
          <div className="filters-container">
            <div className="search-box"><Search size={20} /><input type="text" placeholder={t('list.filters.searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <div className="advanced-filters">
              <div className="filter-group">
                <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  {sortOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="news-list-section">
          {currentArticles.length > 0 ? (
            <div className="news-list">{currentArticles.map((article, index) => (<NewsItem key={article.id} article={article} index={index} onBookmark={handleBookmark} onLike={handleLike} onShare={handleShare} />))}</div>
          ) : (<div className="empty-state"><h3>{t('list.empty.title')}</h3><p>{t('list.empty.body')}</p></div>)}
        </section>
        
        {totalPages > 1 && (
            <div className="pagination">
                <button className="pagination-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronRight size={18} /></button>
                <div className="pagination-numbers"><span className="pagination-number active">{currentPage}</span></div>
                <button className="pagination-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronLeft size={18} /></button>
            </div>
        )}

        <section className="newsletter-signup">
          <h2 className="newsletter-title">{t('list.newsletter.title')}</h2>
          <p className="newsletter-subtitle">{t('list.newsletter.subtitle')}</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" className="newsletter-input" placeholder={t('list.newsletter.placeholder')} required />
            <button type="submit" className="newsletter-btn"><Mail size={20} />{t('list.newsletter.button')}</button>
          </form>
        </section>
      </div>
    </div>
  );
};
export default News;