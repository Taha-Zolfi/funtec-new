"use client"

import { useState, useEffect, useCallback, memo, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  CheckCircle,
  Phone,
  Mail,
  Award,
  Shield,
  Palette,
  Heart,
  Users,
  Play,
  Smile,
  Trophy,
  Target,
  Sparkles,
  Wrench,
  Settings,
  Clock,
  Globe,
  Cpu,
  Check,
} from "lucide-react"
import { api } from "@/lib/api" // برای گرفتن دیتا از API

// مپ آیکون‌ها برای رندر داینامیک
const iconMap = {
  Shield, Palette, Heart, Users, Play, Smile, Trophy, Target, Sparkles, Wrench, Settings, Clock, Globe, Award, Cpu, Check,
}

// --- کامپوننت‌های کوچک و Memoized ---

const StatCard = memo(({ stat, index, isVisible }) => {
  const [displayValue, setDisplayValue] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef(null)

  useEffect(() => {
    if (!isVisible) return

    let startTime = null
    const duration = 3000 + index * 400
    const targetValue = stat.value

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      const easeOutElastic = (t) => {
        const c4 = (2 * Math.PI) / 3
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
      }

      setDisplayValue(Math.floor(targetValue * easeOutElastic(progress)))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    const timeoutId = setTimeout(() => {
      requestAnimationFrame(animate)
    }, index * 200)

    return () => clearTimeout(timeoutId)
  }, [isVisible, stat.value, index])

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const rotateX = (y - centerY) / 6
      const rotateY = (centerX - x) / 6
      const scale = isHovered ? 1.08 : 1

      card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${
        isHovered ? 40 : 15
      }px) scale(${scale})`
    }

    const handleMouseLeave = () => {
      card.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)"
      setIsHovered(false)
    }

    const handleMouseEnter = () => {
      setIsHovered(true)
    }

    card.addEventListener("mousemove", handleMouseMove)
    card.addEventListener("mouseleave", handleMouseLeave)
    card.addEventListener("mouseenter", handleMouseEnter)

    return () => {
      card.removeEventListener("mousemove", handleMouseMove)
      card.removeEventListener("mouseleave", handleMouseLeave)
      card.removeEventListener("mouseenter", handleMouseEnter)
    }
  }, [isHovered])

  return (
    <div
      ref={cardRef}
      className={`about-stat ${isHovered ? "hovered" : ""}`}
      style={{
        "--animation-delay": `${index * 0.15}s`,
        "--stat-color": stat.color || "#ffb527",
      }}
    >
      <span className="about-stat-number">
        {displayValue}
        {stat.suffix}
      </span>
      <span className="about-stat-label">{stat.label}</span>
    </div>
  )
})
StatCard.displayName = "StatCard"

const FeatureCard = memo(({ feature, index, isActive, onHover, onLeave }) => {
  const cardRef = useRef(null)
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      setMousePosition({ x: x / rect.width, y: y / rect.height })

      const rotateX = (y - centerY) / 10
      const rotateY = (centerX - x) / 10

      card.style.transform = `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${
        isActive ? 50 : 25
      }px) scale(${isActive ? 1.03 : 1})`
    }

    const handleMouseLeave = () => {
      card.style.transform = "perspective(1500px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)"
      setMousePosition({ x: 0.5, y: 0.5 })
    }

    card.addEventListener("mousemove", handleMouseMove)
    card.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      card.removeEventListener("mousemove", handleMouseMove)
      card.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [isActive])

  const Icon = iconMap[feature.icon]
  return (
    <div
      ref={cardRef}
      className={`about-feature-card ${isActive ? "active" : ""}`}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={onLeave}
      style={{
        "--feature-color": feature.color,
        "--animation-delay": `${index * 0.2}s`,
        "--mouse-x": mousePosition.x,
        "--mouse-y": mousePosition.y,
      }}
    >
      <div className="about-feature-glow"></div>
      <div className="about-feature-spotlight"></div>
      <div className="about-feature-icon">{Icon && <Icon size={45} />}</div>
      <h3 className="about-feature-title">{feature.title}</h3>
      <p className="about-feature-description">{feature.description}</p>
    </div>
  )
})
FeatureCard.displayName = "FeatureCard"

const TimelineItem = memo(({ milestone, index }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const itemRef = useRef(null)
  const cardRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.2 },
    )
    const current = itemRef.current
    if (current) observer.observe(current)
    return () => { if (current) observer.unobserve(current) }
  }, [])

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const rotateX = (y - centerY) / 15
      const rotateY = (centerX - x) / 15

      card.style.setProperty("--mouse-x", `${(x / rect.width) * 100}%`)
      card.style.setProperty("--mouse-y", `${(y / rect.height) * 100}%`)
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${isHovered ? 20 : 0}px)`
    }

    const handleMouseEnter = () => setIsHovered(true)
    const handleMouseLeave = () => {
      setIsHovered(false)
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)"
    }

    card.addEventListener("mousemove", handleMouseMove)
    card.addEventListener("mouseenter", handleMouseEnter)
    card.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      card.removeEventListener("mousemove", handleMouseMove)
      card.removeEventListener("mouseenter", handleMouseEnter)
      card.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [isHovered])

  const CardContent = () => (
    <>
      <div className="timeline-image-container">
        <div className="timeline-image-wrapper">
          <Image 
            src={milestone.image_url || "/placeholder.svg"} 
            alt={milestone.title} 
            className="timeline-image"
            width={400} height={300} priority={index < 2}
          />
          <div className="timeline-image-glow"></div>
          <div className="timeline-image-border"></div>
        </div>
      </div>
      <div className="timeline-content">
        <div className="timeline-content-inner">
          <h3 className="timeline-title">{milestone.title}</h3>
          <p className="timeline-description">{milestone.description}</p>
          <div className="timeline-accent"></div>
        </div>
      </div>
      <div className="timeline-hover-effect"></div>
    </>
  );

  const CardWrapper = ({ children }) => {
    const className = `timeline-card ${isHovered ? "hovered" : ""}`;
    const link = milestone.target_link;
    if (link && link.startsWith('/')) return <Link href={link} className={className}>{children}</Link>;
    if (link) return <a href={link} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
    return <div className={className}>{children}</div>;
  };

  return (
    <div ref={itemRef} className={`timeline-item timeline-item-${index} ${isVisible ? "visible" : ""}`} style={{ "--animation-delay": `${index * 0.2}s` }}>
      <div ref={cardRef}><CardWrapper><CardContent /></CardWrapper></div>
      <div className="timeline-connector">
        <div className="timeline-dot">
          <div className="timeline-dot-inner"></div>
          <div className="timeline-dot-pulse"></div>
        </div>
      </div>
    </div>
  )
})
TimelineItem.displayName = "TimelineItem"

const ValueCard = memo(({ value, index }) => {
    const Icon = iconMap[value.icon];
    return (
      <div className="about-value-card" style={{ "--animation-delay": `${index * 0.1}s` }}>
        <div className="about-value-icon-wrapper">
          <div className="about-value-icon">{Icon && <Icon size={32} />}</div>
        </div>
        <div className="about-value-content">
          <h3 className="about-value-title">{value.title}</h3>
          <p className="about-value-description">{value.description}</p>
        </div>
      </div>
    );
});
ValueCard.displayName = "ValueCard";

// --- کامپوننت اصلی کلاینت ---
export default function AboutClient({ missionData, valuesData, features, statData, ctaFeatures }) {
  const [activeFeature, setActiveFeature] = useState(0)
  const [isVisible, setIsVisible] = useState({})
  const [isLoaded, setIsLoaded] = useState(false)
  const [timelineItems, setTimelineItems] = useState([]);
  const featureTimerRef = useRef(null)

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const items = await api.getTimelineItems();
        setTimelineItems(items);
      } catch (error) {
        console.error("Failed to load timeline items:", error);
        setTimelineItems([]);
      }
    };
    fetchTimeline();
  }, []);

  const handleFeatureHover = useCallback((index) => {
    setActiveFeature(index)
    if (featureTimerRef.current) clearInterval(featureTimerRef.current)
  }, [])

  const handleFeatureLeave = useCallback(() => {
    if (featureTimerRef.current) clearInterval(featureTimerRef.current)
    featureTimerRef.current = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 6000)
  }, [features.length])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }))
        })
      }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    )
    const elements = document.querySelectorAll("[data-section]")
    elements.forEach((el) => observer.observe(el))
    return () => {
        elements.forEach((el) => {
            if (observer && el) {
                observer.unobserve(el);
            }
        });
    };
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300)
    handleFeatureLeave();
    return () => {
      clearTimeout(timer)
      if (featureTimerRef.current) clearInterval(featureTimerRef.current)
    }
  }, [handleFeatureLeave])

  return (
    <div className={`about-page ${isLoaded ? "loaded" : ""}`} id="about">
      <div className="about-background"><div className="light-effect light-effect-1"></div><div className="light-effect light-effect-2"></div></div>
      <div className="about-container">
        
        <section id="hero" data-section className="about-hero">
          <div className={`about-fade-in ${isVisible.hero ? "about-animate" : ""}`}>
            <div className="about-hero-badge"><Award size={26} /><span>پیشگامان تجربه‌های نوآورانه در شهربازی‌ها</span></div>
            <h1 className="about-hero-title">بیوگرافی فان تک</h1>
            <p className="about-hero-subtitle">در دنیایی که سرعت تغییرات تکنولوژیک شتابی بی‌سابقه یافته، فان تک با رویایی روشن و رسالتی والا برای نوآوری در تجربه بازی و آوردن تکنولوژی‌های جدید به شهربازی‌ها، پا به عرصه وجود گذاشت.</p>
          </div>
          <div className={`about-stats about-fade-in ${isVisible.hero ? "about-animate" : ""}`}>
            {statData.map((stat, index) => (<StatCard key={index} stat={stat} index={index} isVisible={isVisible.hero} />))}
          </div>
        </section>

        <section id="vision" data-section className="about-vision">
           <div className={`about-fade-in ${isVisible.vision ? "about-animate" : ""}`}>
            <div className="about-section-header"><h2 className="about-section-title">چشم‌انداز ما</h2><p className="about-section-subtitle">آینده‌ای هیجان‌انگیز در دستان شما. خلق جهانی که در آن مرزهای سرگرمی پیوسته جابجا می‌شوند و فناوری‌های نوین، ابزاری برای خلق تجربیات فراگیر و فراموش‌نشدنی هستند.</p></div>
             <div className="about-vision-content"><p>ما آینده‌ای را متصوریم که در آن هر شهربازی، یک گالری از نوآوری‌های فناورانه است که بازدیدکنندگان را به دنیایی از ماجراجویی، رقابت و هیجان دعوت می‌کند. ما نه تنها تولیدکننده تجهیزات شهربازی هستیم، بلکه معمار تجربه‌هایی هستیم که زندگی را رنگین‌تر و پویاتر می‌کنند. هدف ما این است که با ارائه راهکارهایی نوآورانه و خلاقانه، شهربازی‌ها را به مقاصدی تبدیل کنیم که افراد از هر سن و سلیقه‌ای، اشتیاق بازگشت به آن‌ها را داشته باشند.</p></div>
           </div>
        </section>

        <section id="mission" data-section className="about-mission">
           <div className={`about-fade-in ${isVisible.mission ? "about-animate" : ""}`}>
            <div className="about-section-header"><h2 className="about-section-title">{missionData.title}</h2><p className="about-section-subtitle">{missionData.description}</p></div>
            <div className="about-mission-points">{missionData.points.map((point, index) => (<div key={index} className="about-mission-point" style={{ "--animation-delay": `${index * 0.1}s` }}><div className="mission-point-icon"><Check size={24}/></div><p>{point}</p></div>))}</div>
           </div>
        </section>

        <section id="features" data-section className="about-features">
          <div className={`about-fade-in ${isVisible.features ? "about-animate" : ""}`}>
            <div className="about-section-header"><h2 className="about-section-title">چرا فان تک؟</h2><p className="about-section-subtitle">ویژگی‌هایی که ما را در صنعت تجهیزات شهربازی متمایز و پیشرو می‌کند و اعتماد هزاران مشتری را جلب کرده است</p></div>
            <div className="about-features-grid" onMouseLeave={handleFeatureLeave}>{features.map((feature, index) => (<FeatureCard key={index} feature={feature} index={index} isActive={activeFeature === index} onHover={handleFeatureHover} onLeave={handleFeatureLeave} />))}</div>
          </div>
        </section>

        <section id="values" data-section className="about-values">
          <div className={`about-fade-in ${isVisible.values ? "about-animate" : ""}`}>
            <div className="about-section-header"><h2 className="about-section-title">ارزش‌های ما: ستون‌های اعتماد و تعالی</h2><p className="about-section-subtitle">هویت فان تک بر پایه‌های مستحکمی بنا شده است که در تمام جنبه‌های کاری ما جاری است.</p></div>
            <div className="about-values-grid">{valuesData.map((value, index) => (<ValueCard key={index} value={value} index={index} />))}</div>
          </div>
        </section>

        <section id="timeline" data-section className="about-timeline">
          <div className={`about-fade-in ${isVisible.timeline ? "about-animate" : ""}`}>
            <div className="about-section-header"><h2 className="about-section-title">محصولات ویژه</h2><p className="about-section-subtitle">با برخی از جذاب‌ترین و خاص‌ترین محصولات فان تک آشنا شوید که تجربه‌ای متفاوت و هیجان‌انگیز را برای شما رقم می‌زنند.</p></div>
            <div className="about-timeline-container"><div className="about-timeline-line" />{timelineItems.map((item, index) => (<TimelineItem key={item.id} milestone={item} index={index} />))}</div>
          </div>
        </section>

        <section id="cta" data-section className="about-cta">
          <div className={`about-fade-in ${isVisible.cta ? "about-animate" : ""}`}>
            <div className="about-cta-content">
              <h2 className="about-cta-title">آینده فان تک: همکاری برای خلق تجربه‌های بهتر</h2>
              <p className="about-cta-description">ما آماده‌ایم تا با دانش فنی، خلاقیت و تعهد خود، شهربازی‌های شما را به مقاصدی پیشرو و جذاب تبدیل کنیم. بیایید با هم آینده هیجان‌انگیز شهربازی‌ها را بسازیم. فان تک: نوآوری در بازی، هیجان در زندگی.</p>
              <div className="about-cta-actions">
                <a href="tel:09191771727" className="about-btn-primary"><Phone size={28} /><span>تماس : 27-17-177-0919</span></a>
                <a href="https://wa.me/989191771727" target="_blank" rel="noopener noreferrer" className="about-btn-secondary"><Mail size={28} /><span>درخواست مشاوره رایگان</span></a>
              </div>
              <div className="about-cta-features">{ctaFeatures.map((feature, index) => (<div key={index} className="about-cta-feature" style={{ "--animation-delay": `${index * 0.15}s` }}><CheckCircle size={22} /><span>{feature}</span></div>))}</div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}