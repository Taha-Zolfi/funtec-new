// مسیر: src/app/layout.js

import "./globals.css";
import Script from 'next/script';

// متادیتای اصلی سایت
export const metadata = {
  title: "فان تک | گیم های نوین شهر بازی",
  description: "شرکت فان تک تولیدکننده و عرضه‌کننده تجهیزات مدرن شهربازی"
};

// این RootLayout دیگر نیازی به دسترسی به locale ندارد
export default function RootLayout({ children }) {
  return (
    // تگ‌های lang و dir از [locale]/page.js یا [locale]/layout.js مدیریت خواهند شد
    // اما برای سادگی می‌توان آن را اینجا نیز نگه داشت
    <html>
      <body>
        {children}
        <Script
          type="module"
          src="https://unpkg.com/@splinetool/viewer@1.0.94/build/spline-viewer.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}