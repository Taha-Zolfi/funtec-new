import "./globals.css";
import TouchDetector from "./TouchDetector.client";

export const metadata = {
  title: "فان تک | گیم های نوین شهر بازی",
  description: "شرکت فان تک تولیدکننده و عرضه‌کننده تجهیزات مدرن شهربازی"
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body suppressHydrationWarning>
        <TouchDetector />
        {children}
      </body>
    </html>
  );
}
