"use client"

import dynamic from "next/dynamic"
import "./About.css"

// داده‌ها به عنوان ثابت‌های جاوااسکریپت در سرور تعریف می‌شوند
const features = [
  {
    icon: "Shield",
    title: "ایمنی استاندارد جهانی",
    description:
      "تمام محصولات ما با استانداردهای بین‌المللی CE، EN1176 و ASTM تولید و تست می‌شوند تا بالاترین سطح ایمنی را برای کودکان فراهم کنند و خیال والدین راحت نگه دارند",
    color: "#13c8ff",
  },
  {
    icon: "Palette",
    title: "طراحی خلاقانه و منحصر به فرد",
    description:
      "تیم طراحان مجرب ما با استفاده از جدیدترین تکنولوژی‌ها و روش‌های نوآورانه، محیط‌های بازی جذاب و آموزشی برای رشد کودکان خلق می‌کنند",
    color: "#ffb527",
  },
  {
    icon: "Heart",
    title: "کیفیت و دوام بالا",
    description:
      "استفاده از بهترین مواد اولیه مقاوم در برابر آب و هوا، اشعه UV و شرایط جوی سخت با گارانتی ۵ ساله کامل و خدمات پس از فروش",
    color: "#13c8ff",
  },
  {
    icon: "Users",
    title: "خدمات جامع و حرفه‌ای",
    description:
      "از مشاوره اولیه و طراحی سه‌بعدی تا تولید، نصب و خدمات پس از فروش، در تمام مراحل پروژه همراه شما هستیم و پشتیبانی کامل ارائه می‌دهیم",
    color: "#ffb527",
  },
]

const services = [
  { icon: "Play", text: "طراحی و تولید سرسره‌های متنوع و ایمن" },
  { icon: "Smile", text: "ساخت تاب‌ها و فنرهای استاندارد" },
  { icon: "Trophy", text: "تجهیزات ورزشی و بازی کودکان" },
  { icon: "Shield", text: "کفپوش‌های ضربه‌گیر EPDM رنگی" },
  { icon: "Target", text: "خانه‌های بازی و کلبه‌های چوبی" },
  { icon: "Sparkles", text: "مجموعه‌های ترکیبی و تماتیک بزرگ" },
  { icon: "Wrench", text: "طراحی و اجرای پارک‌های شهری" },
  { icon: "Settings", text: "تعمیر و نگهداری تجهیزات موجود" },
]

// محصولات ویژه برای نمایش در بخش محصولات
const products = [
  {
    image: "/pic1.png",
    title: "لیزرتگ",
    desc: "تجربه هیجان‌انگیز بازی لیزرتگ با تجهیزات مدرن و ایمن، مناسب برای تمامی سنین.",
  },
  {
    image: "/pic2.png",
    title: "لیزرماز",
    desc: "مسیر پرماجرا و پر از نورهای لیزری برای چالش و سرگرمی کودکان و نوجوانان.",
  },
  {
    image: "/pic3.png",
    title: "اتاق وحشت",
    desc: "اتاق وحشت با طراحی منحصربه‌فرد و جلوه‌های ویژه برای تجربه‌ای فراموش‌نشدنی.",
  },
]

const statData = [
  { value: 480, label: "پروژه موفق", suffix: "+", color: "#ffb527" },
  { value: 7, label: "سال تجربه", suffix: "+", color: "#13c8ff" },
  { value: 240, label: "مشتری راضی", suffix: "+", color: "#ffb527" },
  { value: 60, label: "شهر پوشش", suffix: "+", color: "#13c8ff" },
]

const visualCards = [
  {
    icon: "Trophy",
    title: "کیفیت تضمینی",
    desc: "گارانتی ۵ ساله روی تمام محصولات با پشتیبانی کامل و خدمات پس از فروش",
    type: "orange",
  },
  {
    icon: "Clock",
    title: "تحویل سریع",
    desc: "نصب و راه‌اندازی در کمترین زمان ممکن با تیم متخصص و مجرب",
    type: "blue",
  },
  {
    icon: "Shield",
    title: "ایمنی مطلق",
    desc: "استانداردهای CE، EN1176 و ASTM با تست‌های کامل کیفیت",
    type: "blue",
  },
  {
    icon: "Globe",
    title: "پوشش سراسری",
    desc: "خدمات در سراسر کشور و منطقه با تیم‌های محلی متخصص",
    type: "orange",
  },
]

const ctaFeatures = ["مشاوره رایگان", "بازدید محل", "طراحی سه‌بعدی", "گارانتی ۵ ساله"]

// این کامپوننت سروری، داده‌ها را به کامپوننت کلاینت پاس می‌دهد

// Dynamic import for AboutClient with no SSR
const AboutClient = dynamic(() => import("./AboutClient"), {
  ssr: false,
  loading: () => (
    <div className="about-loading">
      <div className="loading-spinner"></div>
    </div>
  ),
})

export default function AboutPage() {
  return (
    <AboutClient
      features={features}
      services={services}
      products={products}
      statData={statData}
      visualCards={visualCards}
      ctaFeatures={ctaFeatures}
    />
  )
}
