// --- START OF FILE News.jsx ---

"use client";
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  User,
  Eye,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Star,
  TrendingUp,
  Archive,
  Mail,
  Share2,
  Facebook,
  Twitter,
  Send,
  MessageCircle,
  Flame,
  Bookmark,
  BookmarkCheck,
  Heart,
  Download,
  Rss,
  Bell,
  Settings,
  Grid,
  List as ListIcon,
  RefreshCw,
  Zap,
  Menu,
  X
} from 'lucide-react';
import './News.css';

import { api } from '@/lib/api';

const NewsItem = memo(({ article, index, viewMode, bookmarkedArticles, likedArticles, readingList, onBookmark, onLike, onShare }) => {
  const handleBookmarkClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmark(article.id, e);
  }, [article.id, onBookmark]);

  const handleLikeClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onLike(article.id, e);
  }, [article.id, onLike]);

  const handleShareClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onShare('telegram', article);
  }, [article, onShare]);

  return (
    <Link
      href={`/news/${article.id}`}
      className={`news-item ${readingList.has(article.id) ? 'read' : ''} ${viewMode}`}
      style={{ '--animation-delay': `${index * 0.1}s` }}
      passHref
    >
      <div className="news-thumbnail">
        <img
          src={article.image || "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg"}
          alt={article.title}
          loading="lazy"
          onError={(e) => {
            e.target.src = "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg"
          }}
        />
        <div className="thumbnail-overlay">
          <div className="news-article-actions">
            <button
              className={`news-naction-btn bookmark ${bookmarkedArticles.has(article.id) ? 'active' : ''}`}
              onClick={handleBookmarkClick}
              title="نشان کردن"
            >
              {bookmarkedArticles.has(article.id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
            <button
              className={`news-naction-btn like ${likedArticles.has(article.id) ? 'active' : ''}`}
              onClick={handleLikeClick}
              title="پسندیدن"
            >
              <Heart size={16} />
            </button>
            <button
              className="news-naction-btn share"
              onClick={handleShareClick}
              title="اشتراک‌گذاری"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="news-content">
        <div className="news-header-info">
          <span className="news-date">
            {new Date(article.created_at).toLocaleDateString('fa-IR')}
          </span>
        </div>

        <h3 className="news-title">{article.title}</h3>
        <p className="news-excerpt">{article.excerpt}</p>

        <div className="news-footer">
          <div className="news-stats">
            <div className="stat-item">
              <Eye size={16} />
              <span>{article.views >= 1000 ? `${(article.views / 1000).toFixed(1)}k` : article.views || 0}</span>
            </div>
            <div className="stat-item">
              <Clock size={16} />
              <span>۵ دقیقه</span>
            </div>
            {likedArticles.has(article.id) && (
              <div className="stat-item liked">
                <Heart size={16} />
              </div>
            )}
            {readingList.has(article.id) && (
              <div className="stat-item read">
                <Eye size={16} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
});

// Optimized FeaturedNews component
const FeaturedNews = memo(({ article, bookmarkedArticles, likedArticles, onBookmark, onLike, onReadArticle }) => {
  const handleClick = useCallback(() => {
    onReadArticle(article);
  }, [article, onReadArticle]);

  const handleBookmarkClick = useCallback((e) => {
    e.stopPropagation();
    onBookmark(article.id, e);
  }, [article.id, onBookmark]);

  const handleLikeClick = useCallback((e) => {
    e.stopPropagation();
    onLike(article.id, e);
  }, [article.id, onLike]);

  return (
    <div className="featured-news" onClick={handleClick}>
      <div className="featured-image">
        <img
          src={article.image || "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg"}
          alt={article.title}
          loading="lazy"
          onError={(e) => {
            e.target.src = "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg"
          }}
        />
        <div className="featured-overlay">
          <div className="featured-badge">
            <Star size={20} />
            <span>خبر ویژه</span>
          </div>
        </div>
      </div>

      <div className="featured-content">
        <div className="featured-meta">
          <span className="featured-date">
            {new Date(article.created_at).toLocaleDateString('fa-IR')}
          </span>
        </div>

        <h2 className="featured-title">{article.title}</h2>
        <p className="featured-excerpt">{article.excerpt}</p>

        <button className="featured-read-btn">
          <span>ادامه مطلب</span>
          <Zap size={20} />
        </button>
      </div>
    </div>
  );
});

const News = () => {
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [featuredArticle, setFeaturedArticle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [dateRange, setDateRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [breakingNews, setBreakingNews] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [stats, setStats] = useState({});
  const [viewMode, setViewMode] = useState('grid');
  const [bookmarkedArticles, setBookmarkedArticles] = useState(new Set());
  const [likedArticles, setLikedArticles] = useState(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [readingList, setReadingList] = useState(new Set());
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const articlesPerPage = isMobile ? 4 : 6;

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const totalPages = useMemo(() =>
    Math.ceil(filteredArticles.length / articlesPerPage),
    [filteredArticles.length, articlesPerPage]
  );

  const currentArticles = useMemo(() =>
    filteredArticles.slice(
      (currentPage - 1) * articlesPerPage,
      currentPage * articlesPerPage
    ),
    [filteredArticles, currentPage, articlesPerPage]
  );

  // Optimized localStorage save with debounce
  const debouncedSave = useCallback((key, value) => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, []);


  // --- Helper to show notifications (defined early due to its use in handleRefresh) ---
  const showNotification = useCallback((title, message) => {
    if (notifications && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body: message });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, { body: message });
          }
        });
      }
    }
  }, [notifications]); // Depends on `notifications` state

  // --- handleRefresh function (defined before auto-refresh useEffect) ---
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const allArticles = await api.getNews();
      setArticles(allArticles);
      setFilteredArticles(allArticles);

      showNotification('بروزرسانی', 'اخبار با موفقیت بروزرسانی شد');
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [showNotification]); // Depends on `showNotification`


  // --- Initial Data Fetch (runs once on mount) ---
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const allArticles = await api.getNews();
        setArticles(allArticles);
        setFilteredArticles(allArticles);

        const featured = allArticles.find(article => article.is_featured);
        setFeaturedArticle(featured || allArticles[0]);

        const latest = allArticles[0];
        if (latest) {
          setBreakingNews(`🔴 خبر فوری: ${latest.title}`);
        }

        const totalViews = allArticles.reduce((sum, article) => sum + (article.views || 0), 0);
        const totalArticles = allArticles.length;
        const featuredCount = allArticles.filter(article => article.is_featured).length;
        const todayArticles = allArticles.filter(article => {
          const today = new Date().toDateString();
          const articleDate = new Date(article.created_at).toDateString();
          return today === articleDate;
        }).length;

        setStats({
          totalArticles,
          totalViews,
          featuredCount,
          todayArticles
        });

        const suggestions = [...new Set(
          allArticles.flatMap(article => [
            ...(article.title ? article.title.split(' ') : []),
            ...(article.excerpt ? article.excerpt.split(' ') : [])
          ])
        )].filter(word => word.length > 3).slice(0, 10);
        setSearchSuggestions(suggestions);
      } catch (error) {
        console.error('Failed to load articles from API:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchNews();

    // Load user settings from localStorage (existing code)
    try {
      const savedBookmarks = JSON.parse(localStorage.getItem('bookmarkedArticles') || '[]');
      const savedLikes = JSON.parse(localStorage.getItem('likedArticles') || '[]');
      const savedReadingList = JSON.parse(localStorage.getItem('readingList') || '[]');
      const savedViewMode = localStorage.getItem('viewMode') || 'grid';
      const savedDarkMode = JSON.parse(localStorage.getItem('darkMode') || 'false');
      const savedFontSize = localStorage.getItem('fontSize') || 'medium';
      const savedAnimations = JSON.parse(localStorage.getItem('animationsEnabled') || 'true');

      setBookmarkedArticles(new Set(savedBookmarks));
      setLikedArticles(new Set(savedLikes));
      setReadingList(new Set(savedReadingList));
      setViewMode(savedViewMode);
      setDarkMode(savedDarkMode);
      setFontSize(savedFontSize);
      setAnimationsEnabled(savedAnimations);
    } catch (error) {
      console.error('Failed to load user settings:', error);
    }
  }, []); // Empty dependency array means this runs once on component mount


  // --- Auto refresh (depends on handleRefresh) ---
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        handleRefresh();
      }, 300000); // 5 minutes
    }
    return () => clearInterval(interval);
  }, [autoRefresh, handleRefresh]); // Correct dependency: `handleRefresh` is a dependency


  // --- Save settings with debounce ---
  useEffect(() => {
    debouncedSave('bookmarkedArticles', [...bookmarkedArticles]);
  }, [bookmarkedArticles, debouncedSave]);

  useEffect(() => {
    debouncedSave('likedArticles', [...likedArticles]);
  }, [likedArticles, debouncedSave]);

  useEffect(() => {
    debouncedSave('readingList', [...readingList]);
  }, [readingList, debouncedSave]);

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('animationsEnabled', JSON.stringify(animationsEnabled));
  }, [animationsEnabled]);

  // Filter articles
  useEffect(() => {
    let filtered = [...articles];

    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }

      if (dateRange !== 'all') {
        filtered = filtered.filter(article => new Date(article.created_at) >= filterDate);
      }
    }

    // Sort articles
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'likes':
        filtered.sort((a, b) => (likedArticles.has(b.id) ? 1 : 0) - (likedArticles.has(a.id) ? 1 : 0));
        break;
      default:
        break;
    }

    setFilteredArticles(filtered);
    setCurrentPage(1);
  }, [articles, searchTerm, sortBy, dateRange, likedArticles]);

  const handleReadArticle = useCallback(async (article) => {
    try {
      await db.updateNews(article.id, { views: (article.views || 0) + 1 });
      setReadingList(prev => new Set([...prev, article.id]));
      router.push(`/news/${article.id}`);
    } catch (error) {
      console.error('Failed to update article:', error);
    }
  }, [router]);

  const handleNewsletterSubmit = useCallback((e) => {
    e.preventDefault();
    if (newsletterEmail) {
      alert('با موفقیت در خبرنامه عضو شدید!');
      setNewsletterEmail('');
      if (notifications) {
        showNotification('عضویت موفق', 'شما با موفقیت در خبرنامه عضو شدید!');
      }
    }
  }, [newsletterEmail, notifications, showNotification]);

  const handleShare = useCallback((platform, article = null) => {
    const url = article ? `${window.location.origin}/news/${article.id}` : window.location.href;
    const text = article ? article.title : 'مرکز اخبار فان تک';

    try {
      switch (platform) {
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
          break;
        case 'telegram':
          window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
          break;
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  }, []);

  const handleBookmark = useCallback((articleId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
        showNotification('حذف از نشان‌ها', 'مقاله از نشان‌های شما حذف شد');
      } else {
        newSet.add(articleId);
        showNotification('افزودن به نشان‌ها', 'مقاله به نشان‌های شما اضافه شد');
      }
      return newSet;
    });
  }, [showNotification]);

  const handleLike = useCallback((articleId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
        showNotification('پسندیدن', 'مقاله پسندیده شد!');
      }
      return newSet;
    });
  }, [showNotification]);


  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSearchSuggestions(value.length > 2);
  }, []);

  const handleSuggestionClick = useCallback((suggestion) => {
    setSearchTerm(suggestion);
    setShowSearchSuggestions(false);
  }, []);

  const exportToRSS = useCallback(() => {
    try {
      const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>اخبار فان تک</title>
    <description>آخرین اخبار و رویدادهای فان تک</description>
    <link>${window.location.origin}/news</link>
    ${articles.map(article => `
    <item>
      <title>${article.title}</title>
      <description>${article.excerpt}</description>
      <link>${window.location.origin}/news/${article.id}</link>
      <pubDate>${new Date(article.created_at).toUTCString()}</pubDate>
    </item>`).join('')}
  </channel>
</rss>`;

      const blob = new Blob([rssContent], { type: 'application/rss+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fantech-news.rss';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export RSS:', error);
    }
  }, [articles]);

  return (
    <div className={`news-page ${isLoaded ? 'loaded' : ''} ${darkMode ? 'dark-mode' : ''} font-${fontSize} ${!animationsEnabled ? 'no-animations' : ''}`}>


      <div className="news-background" />
      <div className="news-floating-elements">
        <div className="news-orb news-orb-1" />
        <div className="news-orb news-orb-2" />
        <div className="news-orb news-orb-3" />
      </div>

      <div className="news-container">
        {/* Hero Section */}
        <section className="news-hero">
          <div className="news-hero-badge">
            <TrendingUp size={isMobile ? 20 : 24} />
            <span>آخرین اخبار و رویدادها</span>
            {isRefreshing && <RefreshCw size={isMobile ? 16 : 20} className="spinning" />}
          </div>

          <h1 className="news-hero-title">مرکز اخبار فان تک</h1>

          <p className="news-hero-subtitle">
            از آخرین اخبار، محصولات جدید، پروژه‌های انجام شده و رویدادهای مهم صنعت تجهیزات شهربازی مطلع شوید
          </p>

          <div className="nhero-actions">
            <button className="refresh-btn" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw size={isMobile ? 16 : 20} className={isRefreshing ? 'spinning' : ''} />
              {isRefreshing ? 'در حال بروزرسانی...' : 'بروزرسانی'}
            </button>
            <button className="notification-btn" onClick={() => setNotifications(!notifications)}>
              <Bell size={isMobile ? 16 : 20} />
              {notifications ? 'غیرفعال کردن اعلان‌ها' : 'فعال کردن اعلان‌ها'}
            </button>
          </div>
        </section>

        {/* News Statistics */}
        <section className="news-stats">
          <div className="stat-item">
            <div className="stat-number">{stats.totalArticles || 0}</div>
            <div className="stat-label">کل اخبار</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.totalViews >= 1000 ? `${(stats.totalViews / 1000).toFixed(1)}k` : stats.totalViews || 0}</div>
            <div className="stat-label">کل بازدیدها</div>
          </div>

          <div className="stat-item">
            <div className="stat-number">{stats.todayArticles || 0}</div>
            <div className="stat-label">اخبار امروز</div>
          </div>

          <div className="stat-item">
            <div className="stat-number">{readingList.size}</div>
            <div className="stat-label">خوانده‌شده‌ها</div>
          </div>
        </section>



        {/* Featured News */}
        {featuredArticle && (
          <section className="news-featured-section">
            <FeaturedNews
              article={featuredArticle}
              bookmarkedArticles={bookmarkedArticles}
              likedArticles={likedArticles}
              onBookmark={handleBookmark}
              onLike={handleLike}
              onReadArticle={handleReadArticle}
            />
          </section>
        )}

        {/* Search and Filter */}
        <section className="news-filters">
          <div className="filters-container">
            <div className="search-box" style={{ position: 'relative' }}>
              <Search size={20} />
              <input
                type="text"
                placeholder="جستجو در اخبار..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowSearchSuggestions(searchTerm.length > 2)}
                onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
              />
              {showSearchSuggestions && searchSuggestions.length > 0 && (
                <div className="search-suggestions">
                  {searchSuggestions
                    .filter(suggestion => suggestion.toLowerCase().includes(searchTerm.toLowerCase()))
                    .slice(0, 5)
                    .map((suggestion, index) => (
                      <div
                        key={index}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))
                  }
                </div>
              )}
            </div>

            {/* Mobile Filter Toggle */}
            {isMobile && (
              <button
                className="mobile-filter-toggle"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <Filter size={20} />
                <span>فیلترها</span>
                {showMobileFilters ? <X size={16} /> : <Menu size={16} />}
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          <div className={`advanced-filters ${isMobile && showMobileFilters ? 'mobile-open' : ''} ${isMobile && !showMobileFilters ? 'mobile-hidden' : ''}`}>
            <div className="filter-group">
              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">جدیدترین</option>
                <option value="oldest">قدیمی‌ترین</option>
                <option value="popular">محبوب‌ترین</option>
                <option value="title">بر اساس عنوان</option>
                <option value="likes">پسندیده‌شده‌ها</option>
              </select>
            </div>

            <div className="filter-group">
              <select
                className="filter-select"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="all">همه زمان‌ها</option>
                <option value="today">امروز</option>
                <option value="week">هفته گذشته</option>
                <option value="month">ماه گذشته</option>
              </select>
            </div>

          </div>
        </section>

        {/* News List */}
        <section className="news-list-section">
          {currentArticles.length > 0 ? (
            <>
              <div className={`news-list ${viewMode} ${isMobile ? 'mobile' : ''}`}>
                {currentArticles.map((article, index) => (
                  <NewsItem
                    key={article.id}
                    article={article}
                    index={index}
                    viewMode={viewMode}
                    bookmarkedArticles={bookmarkedArticles}
                    likedArticles={likedArticles}
                    readingList={readingList}
                    onBookmark={handleBookmark}
                    onLike={handleLike}
                    onShare={handleShare}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronRight size={isMobile ? 16 : 20} />
                  </button>

                  <div className="pagination-numbers">
                    {Array.from({ length: Math.min(totalPages, isMobile ? 3 : 5) }, (_, i) => {
                      let page;
                      if (totalPages <= (isMobile ? 3 : 5)) {
                        page = i + 1;
                      } else {
                        const start = Math.max(1, currentPage - Math.floor((isMobile ? 3 : 5) / 2));
                        page = start + i;
                      }
                      return page <= totalPages ? (
                        <button
                          key={page}
                          className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      ) : null;
                    })}
                  </div>

                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronLeft size={isMobile ? 16 : 20} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <h3>خبری یافت نشد</h3>
              <p>متأسفانه خبری با این فیلترها پیدا نشد. لطفاً جستجوی دیگری امتحان کنید.</p>
            </div>
          )}
        </section>

        {/* News Archive - Simplified for mobile */}
        <section className="news-archive">
          <div className="archive-header">
            <Archive size={isMobile ? 20 : 24} />
            <h2 className="archive-title">آرشیو اخبار</h2>
          </div>
          <div className="archive-months">
            <Link href="/news?date=2024-01" className="archive-month">دی ۱۴۰۲</Link>
            <Link href="/news?date=2024-02" className="archive-month">بهمن ۱۴۰۲</Link>
            <Link href="/news?date=2024-03" className="archive-month">اسفند ۱۴۰۲</Link>
            <Link href="/news?date=2024-04" className="archive-month">فروردین ۱۴۰۳</Link>
            {!isMobile && (
              <>
                <Link href="/news?date=2024-05" className="archive-month">اردیبهشت ۱۴۰۳</Link>
                <Link href="/news?date=2024-06" className="archive-month">خرداد ۱۴۰۳</Link>
              </>
            )}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="newsletter-signup">
          <h2 className="newsletter-title">عضویت در خبرنامه</h2>
          <p className="newsletter-subtitle">
            برای دریافت آخرین اخبار و بروزرسانی‌ها در خبرنامه ما عضو شوید
          </p>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input
              type="email"
              className="newsletter-input"
              placeholder="آدرس ایمیل خود را وارد کنید"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
            />
            <button type="submit" className="newsletter-btn">
              <Mail size={isMobile ? 16 : 20} />
              عضویت
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default News;