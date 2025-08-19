"use client"

import { useState, useEffect, useCallback, memo, useRef } from "react"
import Image from "next/image"
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
} from "lucide-react"

// مپ آیکون‌ها برای رندر داینامیک
const iconMap = {
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
}

// کامپوننت‌های کوچک‌تر همگی باید اینجا باشند چون به هوک‌ها و تعاملات کلاینت نیاز دارند

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
      {(() => {
        const Icon = iconMap[feature.icon]
        return <div className="about-feature-icon">{Icon && <Icon size={45} />}</div>
      })()}
      <h3 className="about-feature-title">{feature.title}</h3>
      <p className="about-feature-description">{feature.description}</p>
    </div>
  )
})
FeatureCard.displayName = "FeatureCard"

const ServiceItem = memo(({ service, index }) => {
  const Icon = iconMap[service.icon]
  return (
    <div className="about-service-item" style={{ "--animation-delay": `${index * 0.08}s` }}>
      <div className="about-service-icon">{Icon && <Icon size={26} />}</div>
      <span className="about-service-text">{service.text}</span>
    </div>
  )
})
ServiceItem.displayName = "ServiceItem"

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
    if (current) {
      observer.observe(current)
    }
    return () => {
      if (current) {
        observer.unobserve(current)
      }
    }
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

    const handleMouseEnter = () => {
      setIsHovered(true)
    }

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

  return (
    <div
      ref={itemRef}
      className={`timeline-item timeline-item-${index} ${isVisible ? "visible" : ""}`}
      style={{ "--animation-delay": `${index * 0.2}s` }}
    >
      <div ref={cardRef} className={`timeline-card ${isHovered ? "hovered" : ""}`}>
        <div className="timeline-image-container">
          <div className="timeline-image-wrapper">
            <Image 
              src={milestone.image || "/placeholder.svg"} 
              alt={milestone.title} 
              className="timeline-image"
              width={400}
              height={300}
              priority={index < 2}
            />
            <div className="timeline-image-glow"></div>
            <div className="timeline-image-border"></div>
          </div>
        </div>
        <div className="timeline-content">
          <div className="timeline-content-inner">
            <h3 className="timeline-title">{milestone.title}</h3>
            <p className="timeline-description">{milestone.desc}</p>
            <div className="timeline-accent"></div>
          </div>
        </div>
        <div className="timeline-hover-effect"></div>
      </div>
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

const VisualCard = memo(({ card, index }) => {
  const cardRef = useRef(null)

  useEffect(() => {
    const cardEl = cardRef.current
    if (!cardEl) return

    const handleMouseMove = (e) => {
      const rect = cardEl.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const rotateX = (y - centerY) / 8
      const rotateY = (centerX - x) / 8

      cardEl.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(30px)`
    }

    const handleMouseLeave = () => {
      cardEl.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px)"
    }

    cardEl.addEventListener("mousemove", handleMouseMove)
    cardEl.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      cardEl.removeEventListener("mousemove", handleMouseMove)
      cardEl.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  const Icon = iconMap[card.icon]
  return (
    <div ref={cardRef} className={`about-visual-card ${card.type}`} style={{ "--animation-delay": `${index * 0.12}s` }}>
      <div className="about-card-icon">{Icon && <Icon size={45} />}</div>
      <h3>{card.title}</h3>
      <p>{card.desc}</p>
      <div className="about-card-shine"></div>
    </div>
  )
})
VisualCard.displayName = "VisualCard"

// کامپوننت اصلی کلاینت که تمام منطق تعاملی را مدیریت می‌کند
export default function AboutClient({ features, services, products, statData, visualCards, ctaFeatures }) {
  const [activeFeature, setActiveFeature] = useState(0)
  const [isVisible, setIsVisible] = useState({})
  const [isLoaded, setIsLoaded] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const containerRef = useRef(null)
  const rafRef = useRef(null)
  const pointerRafRef = useRef(null)
  const observerRef = useRef(null)
  const featureTimerRef = useRef(null)

  const handleFeatureHover = useCallback((index) => {
    setActiveFeature(index)
    if (featureTimerRef.current) {
      clearInterval(featureTimerRef.current)
    }
  }, [])

  const handleFeatureLeave = useCallback(() => {
    // when mouse leaves a feature card, immediately clear active state so the glow stops
    setActiveFeature(-1)
    if (featureTimerRef.current) {
      clearInterval(featureTimerRef.current)
    }
    // start automated rotation after a short delay so user doesn't see immediate jump
    featureTimerRef.current = setInterval(() => {
      setActiveFeature((prev) => (typeof prev === 'number' && prev >= 0 ? (prev + 1) % features.length : 0))
    }, 6000)
  }, [features.length])

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        const scrollTop = window.pageYOffset
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const progress = Math.min(scrollTop / docHeight, 1)
        setScrollProgress(progress)
        rafRef.current = null
      })
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -100px 0px",
      },
    )
    const elements = document.querySelectorAll("[data-section]")
    elements.forEach((el) => observerRef.current.observe(el))
    return () => {
      if (observerRef.current) {
        elements.forEach((el) => observerRef.current.unobserve(el))
      }
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    handleFeatureLeave() // Start the timer initially
    return () => {
      if (featureTimerRef.current) {
        clearInterval(featureTimerRef.current)
      }
    }
  }, [handleFeatureLeave])

  // global pointer move handler: if pointer is not over any feature card, clear activeFeature
  useEffect(() => {
    const onPointerMove = (e) => {
      if (pointerRafRef.current) return
      pointerRafRef.current = requestAnimationFrame(() => {
        pointerRafRef.current = null
        try {
          const el = document.elementFromPoint(e.clientX, e.clientY)
          if (!el || !el.closest) {
            setActiveFeature(-1)
            return
          }
          const inside = el.closest('.about-feature-card')
          if (!inside) setActiveFeature(-1)
        } catch (err) {
          // ignore
        }
      })
    }

    document.addEventListener('mousemove', onPointerMove)
    document.addEventListener('touchstart', onPointerMove)
    return () => {
      document.removeEventListener('mousemove', onPointerMove)
      document.removeEventListener('touchstart', onPointerMove)
      if (pointerRafRef.current) cancelAnimationFrame(pointerRafRef.current)
    }
  }, [])

  return (
    <div
      className={`about-page ${isLoaded ? "loaded" : ""}`}
      id="about"
      ref={containerRef}
      style={{
        "--scroll-progress": scrollProgress,
      }}
    >
      <div className="about-background">
        <div className="light-effect light-effect-1"></div>
        <div className="light-effect light-effect-2"></div>
        <div className="ferris-bg"></div>
        <div className="balloon-bg"></div>
      </div>
      <div className="scroll-progress"></div>
      <div className="about-container">
        <section id="hero" data-section className="about-hero">
          <div className={`about-fade-in ${isVisible.hero ? "about-animate" : ""}`}>
            <div className="about-hero-badge">
              <Award size={26} />
              <span>بی نقص شدن یک سفر بی پایان است</span>
            </div>
            <h1 className="about-hero-title">درباره فان تک</h1>
            <p className="about-hero-subtitle">
              ما در فان تک با بیش از ۷ سال تجربه، متخصص طراحی و تولید تجهیزات شهربازی ایمن و باکیفیت هستیم. هدف ما خلق
              فضاهای شاد، آموزشی و الهام‌بخش برای رشد و شکوفایی کودکان است.
            </p>
          </div>
          <div className={`about-stats about-fade-in ${isVisible.hero ? "about-animate" : ""}`}>
            {statData.map((stat, index) => (
              <StatCard key={index} stat={stat} index={index} isVisible={isVisible.hero} />
            ))}
          </div>
        </section>

        <section id="features" data-section className="about-features">
          <div className={`about-fade-in ${isVisible.features ? "about-animate" : ""}`}>
            <div className="about-section-header">
              <h2 className="about-section-title">چرا فان تک؟</h2>
              <p className="about-section-subtitle">
                ویژگی‌هایی که ما را در صنعت تجهیزات شهربازی متمایز و پیشرو می‌کند و اعتماد هزاران مشتری را جلب کرده است
              </p>
            </div>
            <div className="about-features-grid">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  feature={feature}
                  index={index}
                  isActive={activeFeature === index}
                  onHover={handleFeatureHover}
                  onLeave={handleFeatureLeave}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="timeline" data-section className="about-timeline">
          <div className={`about-fade-in ${isVisible.timeline ? "about-animate" : ""}`}>
            <div className="about-section-header">
              <h2 className="about-section-title">محصولات ویژه </h2>
              <p className="about-section-subtitle">
                با برخی از جذاب‌ترین و خاص‌ترین محصولات فان تک آشنا شوید که تجربه‌ای متفاوت و هیجان‌انگیز را برای شما رقم
                می‌زنند.
              </p>
            </div>
            <div className="about-timeline-container">
              <div className="about-timeline-line" />
              {products.map((product, index) => (
                <TimelineItem key={index} milestone={product} index={index} />
              ))}
            </div>
          </div>
        </section>

        <section id="cta" data-section className="about-cta">
          <div className={`about-fade-in ${isVisible.cta ? "about-animate" : ""}`}>
            <div className="about-cta-content">
              <h2 className="about-cta-title">آماده شروع پروژه هستید؟</h2>
              <p className="about-cta-description">
                با تیم متخصص فان تک تماس بگیرید و بهترین تجهیزات شهربازی را برای فضای خود انتخاب کنید. مشاوره رایگان،
                بازدید محل و طراحی سه‌بعدی کاملاً رایگان.
              </p>
              <div className="about-cta-actions">
                <a href="tel:09191771727" className="about-btn-primary">
                  <Phone size={28} />
                  <span>تماس فوری: 27-17-177-0919</span>
                </a>
                <a href="mailto:info@funtec.com" className="about-btn-secondary">
                  <Mail size={28} />
                  <span>درخواست مشاوره رایگان</span>
                </a>
              </div>
              <div className="about-cta-features">
                {ctaFeatures.map((feature, index) => (
                  <div key={index} className="about-cta-feature" style={{ "--animation-delay": `${index * 0.15}s` }}>
                    <CheckCircle size={22} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
