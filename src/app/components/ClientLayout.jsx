'use client';

import dynamic from 'next/dynamic';

const CursorFollower = dynamic(() => import('./CursorFollower'), {
  ssr: false
});

const ScrollToTop = dynamic(() => import('./ScrollToTop'), {
  ssr: false
});

export default function ClientLayout({ children }) {
  return (
    <>
      <CursorFollower />
      {children}
      <ScrollToTop />
    </>
  );
}
