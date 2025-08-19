
import News from './News.jsx';
import Nav from '../Nav/Nav';

export default function NewsPage() {
  return (
    <>
      <Nav />
      <div className="news-page-container">
        <News />
      </div>
    </>
  );
}
