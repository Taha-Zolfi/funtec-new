export default function Head() {
  return (
    <>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="preconnect" href="//fonts.gstatic.com" crossOrigin="anonymous" />
      <link 
        rel="preload" 
        href="/fonts/KalamehWeb-Regular.woff2" 
        as="font" 
        type="font/woff2" 
        crossOrigin="anonymous" 
      />
      <link 
        rel="preload" 
        href="/fonts/YekanBakh-Regular.woff2" 
        as="font" 
        type="font/woff2" 
        crossOrigin="anonymous" 
      />
      <link
        rel="preload"
        href="/scene2.glb"
        as="fetch"
        crossOrigin="anonymous"
        type="application/octet-stream"
      />
    </>
  );
}
