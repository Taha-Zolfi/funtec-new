"use client"; // این خط حیاتی است!

import React, { useState, useEffect, useRef } from "react";
import Nav from "./Nav/Nav";
import Home from "./Home/Home";
import About from "./about-home/About.js";
import Contact from "./Contact/Contact";
import Loading from "../components/Loading"; // مسیر به کامپوننت لودینگ را اصلاح کنید
import { CSSTransition } from 'react-transition-group';

export default function MainPageClient() {
  const [loading, setLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(true);
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
        nodeRef={loadingRef}
        in={loading}
        timeout={800}
        classNames="loading-screen-transition"
        unmountOnExit
      >
        <Loading forwardedRef={loadingRef} />
      </CSSTransition>

      <Nav />
      <Home onReady={handleHomeReady} />
      <About />
      <Contact />
    </>
  );
}