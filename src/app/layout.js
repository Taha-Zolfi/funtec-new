import "./globals.css";
import Script from 'next/script'; // ایمپورت کردن کامپوننت اسکریپت

export const metadata = {
  title: "فان تک | گیم های نوین شهر بازی",
  description: "شرکت فان تک تولیدکننده و عرضه‌کننده تجهیزات مدرن شهربازی"
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        {children}

        {/* اسکریپت Spline به صورت متمرکز و فقط یک بار در اینجا بارگذاری می‌شود.
          این کار از هرگونه تداخل و اجرای مجدد جلوگیری می‌کند.
          استراتژی 'beforeInteractive' تضمین می‌کند که اسکریپت قبل از 
          رندر شدن کامپوننت‌های شما آماده باشد.
        */}
        <Script
          type="module"
          src="https://unpkg.com/@splinetool/viewer@1.0.94/build/spline-viewer.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
