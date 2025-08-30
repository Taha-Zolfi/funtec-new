"use client";

import Image from 'next/image';
import './Loading.css';

// ===== تغییر ۱: پراپ forwardedRef را دریافت می‌کنیم =====
const Loading = ({ forwardedRef }) => {
  const text = "فان تک | بی نقص شدن یک سفر بی پایان است";

  return (
    // ===== تغییر ۲: ref را به div اصلی متصل می‌کنیم =====
    <div ref={forwardedRef} className="loading-screen">
      {/* 1. پس‌زمینه سحابی (Nebula/Rift) */}
      <div className="rift-background">
        <div className="rift-shape shape1"></div>
        <div className="rift-shape shape2"></div>
      </div>

      {/* 2. محتوای اصلی */}
      <div className="loading-content">
        <div className="logo-container">
          <Image
            src="/logo.svg"
            alt="لوگوی فان تک"
            width={120}
            height={120}
            priority
          />
        </div>
        
        <h1 className="loading-text">{text}</h1>
      </div>
    </div>
  );
};

export default Loading;