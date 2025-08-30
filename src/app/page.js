"use client"; // خیلی مهم!

// ===== تغییر ۱: useRef را ایمپورت می‌کنیم =====
import React, { useState, useEffect, useRef } from "react";
import Nav from "./Nav/Nav";
import Home from "./Home/Home";
import About from "./About/About";
import Contact from "./Contact/Contact";
import Loading from "../app/components/Loading";
// import ScrollToTopRocket from "../app/components/ScrollToTopRocket";
import { CSSTransition } from 'react-transition-group';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(true);
  
  // ===== تغییر ۲: یک ref برای کامپوننت لودینگ ایجاد می‌کنیم =====
  const loadingRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleHomeReady = () => {
    setLoading(false);
  };

  return (
    <>
      <CSSTransition
        // ===== تغییر ۳: nodeRef را به CSSTransition پاس می‌دهیم =====
        nodeRef={loadingRef}
        in={loading}
        timeout={800}
        classNames="loading-screen-transition"
        unmountOnExit
      >
        {/* ===== تغییر ۴: ref را به خود کامپوننت Loading هم پاس می‌دهیم ===== */}
        <Loading forwardedRef={loadingRef} />
      </CSSTransition>

      <Nav />
      <Home onReady={handleHomeReady} />
      <About />
      <Contact />
      {/* {isDesktop && <ScrollToTopRocket />} */}
    </>
  );
}