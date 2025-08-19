'use client';
import { useEffect, useState } from 'react';

export default function MobileOptimizedCanvas({ children, fallback }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isLowEnd, setIsLowEnd] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

    // Check if device is low end (based on memory and cores)
    const isLowEndDevice = () => {
      if ('deviceMemory' in navigator) {
        if (navigator.deviceMemory < 4) return true;
      }
      if ('hardwareConcurrency' in navigator) {
        if (navigator.hardwareConcurrency < 4) return true;
      }
      return false;
    };

    setIsLowEnd(isLowEndDevice());
  }, []);

  if (isMobile && isLowEnd && fallback) {
    return fallback;
  }

  return children;
}
