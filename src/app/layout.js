
import "./globals.css";


export const metadata = {
  title: "فان تک | تولید کننده گیم های نوین شهر بازی",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
