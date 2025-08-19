"use client";

import { useState, useEffect } from "react";
import Spline from "@splinetool/react-spline";
import { AnimatePresence, motion } from "framer-motion";
import "./ScrollToTop.css";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    const toggleVisibility = () => {
      const shouldBeVisible = window.pageYOffset > 100;
      console.log('ScrollToTop visibility:', shouldBeVisible, 'pageYOffset:', window.pageYOffset);
      setIsVisible(shouldBeVisible);
    };

    checkMobile();
    toggleVisibility();

    window.addEventListener("resize", checkMobile);
    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    setIsAnimating(true);
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
    setTimeout(() => {
      setIsAnimating(false);
      setIsVisible(false);
    }, 1200);
  };

  if (isMobile) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: 1,
            scale: isAnimating ? 1.5 : 1,
            y: isAnimating ? -window.innerHeight - 200 : 0,
            rotate: isAnimating ? 360 : 0
          }}
          exit={{ opacity: 0, scale: 0 }}
          className="scroll-to-top"
          onClick={scrollToTop}
          style={{
            position: "fixed",
            bottom: "2rem",
            left: "2rem",
            width: "180px",
            height: "180px",
            cursor: "pointer",
            zIndex: 9999,
          }}
          transition={{
            duration: 1.2,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <Spline
            scene="https://prod.spline.design/4ylxYlYwz37y439Y/scene.splinecode"
            style={{ width: "100%", height: "100%" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
