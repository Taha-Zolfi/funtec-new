import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ImageModal = ({ isOpen, onClose, images, currentIndex, onNext, onPrev }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <button className="close-button" onClick={onClose} aria-label="بستن">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="modal-container">
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          {images && images.length > 1 && (
            <button 
              className="modal-nav prev" 
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              disabled={currentIndex === 0}
              aria-label="تصویر قبلی"
            >
              <ChevronRight className="icon" />
            </button>
          )}

          <img
            src={images[currentIndex]}
            alt={`تصویر ${currentIndex + 1}`}
            className="modal-image"
            onError={(e) => { 
              e.target.onerror = null; 
              e.target.src = "https://via.placeholder.com/800x600?text=No+Image+Available"; 
            }}
          />

          {images && images.length > 1 && (
            <button 
              className="modal-nav next"
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              disabled={currentIndex === images.length - 1}
              aria-label="تصویر بعدی"
            >
              <ChevronLeft className="icon" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
