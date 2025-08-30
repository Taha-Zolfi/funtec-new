import HomeClient from './HomeClient';

export const metadata = {
  title: "خرید و فروش وسایل شهربازی | ساخت دستگاه شهربازی | لیزرتگ و لیزرماز | فان تک",
  description: "خرید، فروش و ساخت انواع وسایل شهربازی، دستگاه شهربازی، تجهیزات شهربازی سرپوشیده و روباز، دستگاه لیزرتگ و لیزرماز با بهترین قیمت و کیفیت.",
  openGraph: {
    title: "فان تک | خرید و فروش وسایل شهربازی",
    description: "تولید و فروش مستقیم تجهیزات شهربازی با بهترین قیمت و کیفیت",
    url: "https://funtec.ir",
    images: [{ url: "https://funtec.ir/logo.png" }],
    type: "website"
  }
};

// ===== تغییر ۱: پراپ onReady را اینجا دریافت می‌کنیم =====
export default function Home({ onReady }) {
  return (
    // ===== تغییر ۲: و آن را به HomeClient پاس می‌دهیم =====
    <HomeClient onReady={onReady}>
      <div className="content-container">
        <div className="main">
          <h1 className="h-title">فان تک</h1>
          <p className="subtitle">تولید کننده تجهیزات شهربازی</p>

          <div className="home-buttons">
            <a href="/products"><button className="home-btn gallery" type="button">گالری محصولات</button></a>
            <a href="#contact"><button className="home-btn contact" type="button">تماس با ما</button></a>
          </div>
        </div>

        {/* ferris-wheel is rendered by HomeClient inside .ferris-wheel-container */}

        {/* Hidden SEO content */}
        <div className="visually-hidden" aria-hidden="true">
          <section itemScope itemType="https://schema.org/Organization">
            <h2 itemProp="name">فان تک - تولید کننده تجهیزات شهربازی</h2>
            <p itemProp="description">
              تولید و فروش مستقیم انواع وسایل شهربازی، دستگاه لیزرتگ، لیزرماز و تجهیزات خانه بازی کودک با بهترین قیمت و کیفیت.
            </p>
            <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
              <span itemProp="addressLocality">تهران</span>
              <span itemProp="streetAddress">میدان ولی عصر نبش خیابان فتحی شقاقی برج بلورین</span>
            </div>
            <div itemProp="contactPoint" itemScope itemType="https://schema.org/ContactPoint">
              <span itemProp="telephone">+989191771727</span>
            </div>
          </section>
        </div>
      </div>
    </HomeClient>
  );
}