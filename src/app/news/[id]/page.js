'use client';

import { api } from '@/lib/api';
import { useState, useEffect } from 'react';
import NewsDetail from '../NewsDetails';

export default function NewsDetailPage({ params }) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // The warning you see in the console is about this line.
  // In future Next.js versions, the way you get 'id' might change.
  // For now, this is correct and works fine.
  const { id } = params;

  useEffect(() => {
    // Ensure we have an ID before fetching
    if (!id) return;

    const fetchArticle = async () => {
      setLoading(true);
      try {
        const data = await api.getNewsItem(id);
        setArticle(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'خطا در بارگذاری خبر');
        console.error('Error fetching news item:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]); // Dependency array is correct

  if (loading) {
    return (
      <div className="loading" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>در حال بارگذاری خبر...</h2>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error" style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        <h2>خطا در بارگذاری خبر</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!article) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>خبر مورد نظر یافت نشد.</div>;
  }

  return <NewsDetail article={article} />;
}
