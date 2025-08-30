"use client";

import { useState, useEffect, useRef } from "react";
import "./ScrollToTopRocket.css";

const ROCKET_SPLINE_URL =
  "https://prod.spline.design/4ylxYlYwz37y439Y/scene.splinecode";

// ============================================================================
// حذف قطعی کردیت Spline (حتی داخل Shadow DOM)
// ============================================================================
function forceRemoveSplineCredits(viewer) {
  if (!viewer) return;

  try {
    const creditSelectors = [
      'a[href*="spline"]',
      'a[href*="splinetool"]',
      '[class*="credit"]',
      '[class*="credits"]',
      ".logo",
      "footer",
      '[part="footer"]',
      "._webglFooter",
      ".powered-by",
    ];

    // حذف از shadowRoot
    if (viewer.shadowRoot) {
      creditSelectors.forEach((sel) => {
        viewer.shadowRoot.querySelectorAll(sel).forEach((el) => el.remove());
      });
    }

    // حذف از DOM معمولی (اگر چیزی inject شد)
    creditSelectors.forEach((sel) => {
      viewer.querySelectorAll(sel).forEach((el) => el.remove());
    });
  } catch (e) {
    console.warn("Remove credit error:", e);
  }
}

// ============================================================================
// کامپوننت راکت
// ============================================================================
const ScrollToTopRocket = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const rocketContainerRef = useRef(null);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  useEffect(() => {
    const container = rocketContainerRef.current;
    if (!container) return;

    const viewer = container.querySelector("spline-viewer");
    if (!viewer) return;

    // اجرای اولیه
    forceRemoveSplineCredits(viewer);

    // تکرار تا ۵ ثانیه (چون بعضی وقتا دیر لود میشه)
    const intervalId = setInterval(() => {
      forceRemoveSplineCredits(viewer);
    }, 500);

    setTimeout(() => clearInterval(intervalId), 5000);

    // MutationObserver برای هر تغییر جدید
    const observer = new MutationObserver(() => {
      forceRemoveSplineCredits(viewer);
    });
    observer.observe(viewer, { childList: true, subtree: true });
    if (viewer.shadowRoot) {
      observer.observe(viewer.shadowRoot, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, []);

  const handleRocketClick = () => {
    if (isFlying) return;
    setIsFlying(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setIsFlying(false), 1500);
  };

  return (
    <div
      ref={rocketContainerRef}
      className={`rocket-container ${isVisible ? "visible" : ""} ${
        isFlying ? "flying" : ""
      }`}
      onClick={handleRocketClick}
    >
      <spline-viewer
        url={ROCKET_SPLINE_URL}
        style={{ pointerEvents: "none", background: "transparent" }}
      ></spline-viewer>
    </div>
  );
};

export default ScrollToTopRocket;
