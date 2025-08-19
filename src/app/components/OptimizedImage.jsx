'use client';
import Image from 'next/image';

export default function OptimizedImage({ src, alt, className, priority = false }) {
  // Convert PNG to WebP if needed
  const webpSrc = src.endsWith('.png') ? src.replace('.png', '.webp') : src;
  
  return (
    <Image
      src={webpSrc}
      alt={alt}
      className={className}
      width={0}
      height={0}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      style={{ width: '100%', height: 'auto' }}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
    />
  );
}
