// مسیر: src/middleware.js

import { NextResponse } from 'next/server';

const fallbackLng = 'fa';
const supportedLngs = ['fa', 'en', 'ar'];

export const config = {
  /*
   * تمام مسیرها را به جز موارد زیر بررسی کن:
   * - مسیرهایی که با /api شروع می‌شوند
   * - مسیرهای داخلی Next.js (_next/static, _next/image)
   * - مسیر admin
   * - !!! مهم: تمام مسیرهایی که یک نقطه (.) در آن‌ها وجود دارد (یعنی فایل هستند، مثل .glb, .webp, .ico)
   */
  matcher: [
    '/((?!api|_next/static|_next/image|admin|.*\\..*).*)'
  ],
};

export function middleware(req) {
  const pathname = req.nextUrl.pathname;

  // بررسی کن آیا مسیر از قبل یک پیشوند زبان معتبر دارد یا نه
  const pathnameHasLocale = supportedLngs.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // اگر مسیر به صفحات خدمات اشاره دارد، بررسی auth cookie را انجام بده
  const servicesMatch = supportedLngs.some((locale) => pathname === `/${locale}/services` || pathname.startsWith(`/${locale}/services/`));
  if (servicesMatch) {
    const authPhone = req.cookies.get('auth_phone');
    if (!authPhone) {
      // هدایت به صفحه لاگین همان لوکال
      const parts = pathname.split('/').filter(Boolean);
      const localePart = parts[0] || fallbackLng;
      return NextResponse.redirect(new URL(`/${localePart}/login`, req.url));
    }
  }

  // اگر مسیر از قبل پیشوند زبان داشت، هیچ کاری نکن
  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // اگر مسیر پیشوند زبان نداشت، کاربر را مستقیماً به نسخه فارسی همان مسیر هدایت کن
  const newUrl = new URL(`/${fallbackLng}${pathname}`, req.url);
  return NextResponse.redirect(newUrl);
}