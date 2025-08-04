import {
  Shield,
  Heart,
  Users,
  Trophy,
  Sparkles,
  Target,
  Clock,
  Play,
  Smile,
  Wrench,
  Palette,
  Settings,
  Globe,
  Award,
} from "lucide-react"
import AboutClient from "./AboutClient"
import "./About.css"

// داده‌ها به عنوان ثابت‌های جاوااسکریپت در سرور تعریف می‌شوند
const features = [
  {
    icon: "Shield",
    title: "ایمنی استاندارد جهانی",
    description:
      "تمام محصولات ما با استانداردهای بین‌المللی CE، EN1176 و ASTM تولید و تست می‌شوند تا بالاترین سطح ایمنی را برای کودکان فراهم کنند و خیال والدین را راحت نگه دارند",
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

const milestones = [
  {
    year: "2017",
    title: "تأسیس شرکت",
    desc: "شروع فعالیت با تیم ۵ نفره متخصص و پرانگیزه در زمینه تجهیزات شهربازی",
  },
  { year: "2019", title: "گسترش تولید", desc: "راه‌اندازی کارخانه ۲۰۰۰ متری با تجهیزات مدرن و خط تولید پیشرفته" },
  { year: "2021", title: "صادرات", desc: "شروع صادرات محصولات به کشورهای همسایه و گسترش بازار منطقه‌ای" },
  {
    year: "2023",
    title: "گواهینامه‌های بین‌المللی",
    desc: "دریافت استانداردهای CE و EN1176 از اروپا و تأیید کیفیت جهانی",
  },
  { year: "2024", title: "رهبری بازار", desc: "تبدیل شدن به بزرگ‌ترین تولیدکننده تجهیزات شهربازی منطقه" },
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
export default function AboutPage() {
  return (
    <AboutClient
      features={features}
      services={services}
      milestones={milestones}
      statData={statData}
      visualCards={visualCards}
      ctaFeatures={ctaFeatures}
    />
  )
}