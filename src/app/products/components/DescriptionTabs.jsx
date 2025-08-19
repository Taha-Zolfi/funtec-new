'use client';

import HTMLContent from '@/app/components/HTMLContent';
import './DescriptionTabs.css';

export default function DescriptionTabs({ product }) {
  const [activeTab, setActiveTab] = React.useState('description');

  return (
    <div className="product-tabs">
      <div className="tabs-header">
        <button
          className={`tab-button ${activeTab === 'description' ? 'active' : ''}`}
          onClick={() => setActiveTab('description')}
        >
          توضیحات و ویژگی‌ها
        </button>
        <button
          className={`tab-button ${activeTab === 'specifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('specifications')}
        >
          مشخصات فنی
        </button>
        <button
          className={`tab-button ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          نظرات کاربران
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'description' && (
          <div>
            <HTMLContent content={product.full_description} />
            {product.features && product.features.length > 0 && (
              <div className="features-list">
                <h3>ویژگی‌های اصلی:</h3>
                <ul>
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'specifications' && (
          <div className="specifications-list">
            {product.specifications && product.specifications.length > 0 ? (
              <ul>
                {product.specifications.map((spec, index) => (
                  <li key={index}>{spec}</li>
                ))}
              </ul>
            ) : (
              <p>مشخصات فنی موجود نیست.</p>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="comments-section">
            {product.comments && product.comments.length > 0 ? (
              <div>
                {product.comments.map((comment, index) => (
                  <div key={index} className="comment">
                    <div className="comment-header">
                      <h4>{comment.name}</h4>
                      <div className="rating">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < comment.rating ? 'star filled' : 'star'}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p>{comment.comment}</p>
                    <small>{new Date(comment.created_at).toLocaleDateString('fa-IR')}</small>
                  </div>
                ))}
              </div>
            ) : (
              <p>هنوز نظری ثبت نشده است.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
