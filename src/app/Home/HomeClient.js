 'use client';

import { useEffect, useState, Suspense } from "react";
import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import "./Home.css";

const FerrisWheel = dynamic(() => import('./FerrisWheel'), { ssr: false, loading: () => null });

// Use a direct script import for Spline
const SPLINE_URL = "https://prod.spline.design/3B8l0HaJEdBMdTqQ/scene.splinecode";

function createSplineViewer(container) {
  const script = document.createElement('script');
  script.type = 'module';
  script.src = 'https://unpkg.com/@splinetool/viewer@0.9.506/build/spline-viewer.js';
  document.head.appendChild(script);

  const viewer = document.createElement('spline-viewer');
  viewer.url = SPLINE_URL;
  viewer.style.width = '100%';
  viewer.style.height = '100%';
  // ensure the viewer is positioned as a background and doesn't capture pointer events
  viewer.style.position = 'absolute';
  viewer.style.inset = '0';
  viewer.style.zIndex = '0';
  viewer.style.pointerEvents = 'none';
  container.appendChild(viewer);
  const onLoad = () => {
    const root = document.querySelector('.home');
    if (root) root.classList.add('spline-ready');
  };

  // attempt to remove/hide any attribution/credit elements the viewer injects
  function removeCredits() {
    try {
      const creditSelectors = [
        'a[href*="spline"]',
        'a[href*="splinetool"]',
        '[class*="credit"]',
        '[class*="credits"]',
        '[id*="credit"]',
        '[id*="credits"]',
        '[aria-label*="spline"]',
        '[data-credit]'
      ];

      creditSelectors.forEach(sel => {
        container.querySelectorAll(sel).forEach(el => {
          try { el.remove ? el.remove() : (el.style.display = 'none'); } catch (e) {}
        });
      });

      // also check the created viewer's shadow root if present
      if (viewer && viewer.shadowRoot) {
        creditSelectors.forEach(sel => {
          viewer.shadowRoot.querySelectorAll(sel).forEach(el => {
            try { el.remove ? el.remove() : (el.style.display = 'none'); } catch (e) {}
          });
        });
        // hide footer/credits parts inside shadow DOM
        ['footer', '[part="footer"]', '.footer', '.credits', '.credit'].forEach(sel => {
          viewer.shadowRoot.querySelectorAll(sel).forEach(el => {
            try { el.remove ? el.remove() : (el.style.display = 'none'); } catch (e) {}
          });
        });
      }
    } catch (e) {
      // swallow — this is defensive cleanup only
    }
  }

  // run immediately and then poll for a short period to catch late inserts
  removeCredits();
  const creditPoll = setInterval(removeCredits, 500);
  const creditPollStop = setTimeout(() => clearInterval(creditPoll), 8000);

  const onError = (err) => {
    // expose more info in the console for debugging
    try {
      console.error('Spline viewer error:', err && (err.detail || err.message || err));
    } catch (e) { console.error('Spline viewer error (fallback):', e); }
  };

  viewer.addEventListener && viewer.addEventListener('load', onLoad);
  viewer.addEventListener && viewer.addEventListener('error', onError);

  // script load error
  script.onerror = (e) => onError(e || 'spline script failed to load');

  const poll = setInterval(() => {
    if (viewer._loaded) { onLoad(); clearInterval(poll); }
  }, 300);

  return () => {
    clearInterval(poll);
    clearInterval(creditPoll);
    clearTimeout(creditPollStop);
    try { viewer.removeEventListener && viewer.removeEventListener('load', onLoad); } catch (e) {}
    try { viewer.removeEventListener && viewer.removeEventListener('error', onError); } catch (e) {}
    try { container.removeChild(viewer); } catch (e) {}
    try { document.head.removeChild(script); } catch (e) {}
  };
}

export default function HomeClient({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  // control FerrisWheel rendering separately so we don't affect Spline loading
  const [showFerris, setShowFerris] = useState(true);

  useEffect(() => {
    // lightweight mobile detection: prefer matchMedia but fall back to UA
    const mq = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 768px)');
    const mobile = mq ? mq.matches : /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
    setIsMobile(!!mobile);

    if (!mobile) {
      // desktop: load spline viewer
      const container = document.querySelector('.spline-container');
      if (container) {
        const cleanup = createSplineViewer(container);
        setIsLoading(false);
        const t = setTimeout(() => { const root = document.querySelector('.home'); if (root) root.classList.add('spline-ready'); }, 4000);
        return () => { clearTimeout(t); cleanup && cleanup(); };
      }
    } else {
      // mobile: don't load spline; immediately mark not loading
      setIsLoading(false);
      const root = document.querySelector('.home'); if (root) root.classList.add('spline-ready');
    }
  }, []);

  // Mount FerrisWheel only on wider (desktop) screens — treat tablets as non-desktop
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      // default to showing ferris on uncertain environments
      setShowFerris(true);
      return;
    }

    const mq = window.matchMedia('(min-width: 1025px)');
    const update = () => setShowFerris(!!mq.matches);
    // set initial
    update();
    // listen for changes
    if (mq.addEventListener) mq.addEventListener('change', update);
    else if (mq.addListener) mq.addListener(update);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', update);
      else if (mq.removeListener) mq.removeListener(update);
    };
  }, []);

  return (
    <div className="home">
      <div className="spline-background">
        {/* On desktop we mount the spline container; on mobile we show a local video background */}
        {!isMobile && (
          <div className="spline-container" style={{ width: '100%', height: '100%' }}>
            {isLoading && <div className="loading">Loading Spline scene...</div>}
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

      {/* Inline 3D Canvas (dynamic FerrisWheel) — pointerEvents none so UI is interactive */}
  {showFerris && (
  <div className="ferris-wheel-container" aria-hidden="true">
        <Canvas
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            background: 'transparent'
          }}
          camera={{ position: [0, 0, 2.5], fov: 75, near: 0.1, far: 1000 }}
          gl={{ antialias: false, alpha: true, powerPreference: 'high-performance', stencil: false, depth: true }}
          dpr={Math.min(1.5, typeof window !== 'undefined' ? window.devicePixelRatio : 1)}
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
