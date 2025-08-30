'use client';

import { useEffect, useState, Suspense } from "react";
import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import "./Home.css";

const FerrisWheel = dynamic(() => import('./FerrisWheel'), { ssr: false, loading: () => null });

const SPLINE_URL = "https://prod.spline.design/3B8l0HaJEdBMdTqQ/scene.splinecode";

// ===== تغییر کلیدی: منطق بارگذاری Spline را به حالت مطمئن قبلی برمی‌گردانیم =====
function createSplineViewer(container, onReady) {
  const viewer = document.createElement('spline-viewer');
  viewer.url = SPLINE_URL;
  viewer.style.width = '100%';
  viewer.style.height = '100%';
  viewer.style.position = 'absolute';
  viewer.style.inset = '0';
  viewer.style.zIndex = '0';
  viewer.style.pointerEvents = 'none';
  container.appendChild(viewer);

  let isLoaded = false;
  
  const onLoad = () => {
    // از فراخوانی چندباره جلوگیری می‌کنیم
    if (isLoaded) return;
    isLoaded = true;

    // وقتی لود شد، دیگر نیازی به چک کردن دوره‌ای نیست
    clearInterval(poll);

    const root = document.querySelector('.home');
    if (root) root.classList.add('spline-ready');
    if (onReady) {
      console.log("Spline is ready. Signaling parent to hide loading screen.");
      onReady();
    }
  };

  function removeCredits() {
    // ... این تابع بدون تغییر است ...
    try {
      const creditSelectors = ['a[href*="spline"]', '[class*="credit"]'];
      creditSelectors.forEach(sel => {
        container.querySelectorAll(sel).forEach(el => el.remove());
        if (viewer && viewer.shadowRoot) {
          viewer.shadowRoot.querySelectorAll(sel).forEach(el => el.remove());
        }
      });
    } catch (e) {}
  }

  removeCredits();
  const creditPoll = setInterval(removeCredits, 500);
  const creditPollStop = setTimeout(() => clearInterval(creditPoll), 8000);

  const onError = (err) => {
    console.error('Spline viewer error:', err);
    // در صورت خطا هم لودینگ را رد می‌کنیم تا کاربر گیر نکند
    if (onReady) {
      onReady();
    }
  };

  viewer.addEventListener('load', onLoad);
  viewer.addEventListener('error', onError);

  // مکانیزم پشتیبان (Fallback Polling) که مشکل را حل می‌کند
  const poll = setInterval(() => {
    if (viewer._loaded) {
      onLoad();
    }
  }, 300);

  return () => {
    clearInterval(poll);
    clearInterval(creditPoll);
    clearTimeout(creditPollStop);
    try { viewer.removeEventListener('load', onLoad); } catch (e) {}
    try { viewer.removeEventListener('error', onError); } catch (e) {}
    if (viewer.parentNode === container) {
        try { container.removeChild(viewer); } catch (e) {}
    }
  };
}


export default function HomeClient({ children, onReady }) {
  const [isMobile, setIsMobile] = useState(false);
  const [showFerris, setShowFerris] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);

    if (!mq.matches) {
      const container = document.querySelector('.spline-container');
      if (container) {
        const cleanup = createSplineViewer(container, onReady);
        return () => {
          if (cleanup) cleanup();
        };
      }
    } else {
      const root = document.querySelector('.home');
      if (root) root.classList.add('spline-ready');
      if (onReady) {
        onReady();
      }
    }
  }, [onReady]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      setShowFerris(true);
      return;
    }
    const mq = window.matchMedia('(min-width: 1025px)');
    const update = () => setShowFerris(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return (
    <div className="home">
      <div className="spline-background">
        {!isMobile && (
          <div className="spline-container" style={{ width: '100%', height: '100%' }}>
          </div>
        )}
        {isMobile && (
          <video
            className="mobile-video-bg"
            src="/lost-orb-in-the-mountains.mp4"
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          />
        )}
      </div>
      {children}

      {showFerris && (
        <div className="ferris-wheel-container" aria-hidden="true" style={{ pointerEvents: 'none' }}>
          <Canvas
            style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              pointerEvents: 'auto',
              background: 'transparent'
            }}
            camera={{ position: [0, 0, 2.5], fov: 75, near: 0.1, far: 1000 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            dpr={typeof window !== 'undefined' ? Math.min(1.5, window.devicePixelRatio) : 1}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.4} />
              <directionalLight position={[10, 10, 5]} intensity={0.8} color="#ffffff" />
              <pointLight position={[-10, -10, -10]} intensity={0.3} color="#ffb527" />
              <pointLight position={[10, 10, 10]} intensity={0.3} color="#13c8ff" />
              <Environment preset="night" />
              <group scale={[1.4, 1.4, 1.4]} position={[0.5, 1, 0]}>
                <FerrisWheel />
              </group>
            </Suspense>
          </Canvas>
        </div>
      )}
    </div>
  );
}