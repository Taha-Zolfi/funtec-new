
import { db } from '../../api';
import NewsDetail from '../NewsDetails';

export default async function NewsDetailPage({ params }) {
  const { id } = params;
  // Fetch the news article by id
  const article = await db.getNewsItem(id);
  if (!article) {
    return <div>خبر مورد نظر یافت نشد.</div>;
  }
  return <NewsDetail article={article} />;
}
