"use client"

import { useState, useEffect, memo, useRef } from "react"
import Image from "next/image"
import {
  Award, Shield, Palette, Heart, Users, Check, Sparkles, Cpu,
  Search, Drafting, Cog, Construction, Wrench, // Icons for Process
  Phone, Mail, CheckCircle
} from "lucide-react"
import { api } from "@/lib/api"

// --- Icon Mapping ---
const iconMap = {
  Shield, Palette, Heart, Users, Sparkles, Award, Cpu, Check,
  Search, Drafting, Cog, Construction, Wrench,
};

// --- Custom Hook for Scroll Animations ---
const useAnimateOnScroll = (options = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      }
    }, options);

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options]);

  return [ref, isVisible];
};

// --- Reusable Animated Section Wrapper ---
const SectionWrapper = ({ children, id }) => {
    const [ref, isVisible] = useAnimateOnScroll();
    return (
        <div ref={ref} id={id} className={`about-fade-in ${isVisible ? "about-animate" : ""}`}>
            {children}
        </div>
    );
}

// Cursor spotlight utility
const setMouseCSSVariables = (event) => {
  const element = event.currentTarget;
  const rect = element.getBoundingClientRect();
  const posX = event.clientX - rect.left;
  const posY = event.clientY - rect.top;
  element.style.setProperty('--mouse-x', `${posX}px`);
  element.style.setProperty('--mouse-y', `${posY}px`);
};

// --- Memoized Card Components ---

const StatCard = memo(({ stat, index, isVisible }) => {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    if (!isVisible) return;
    let startTime;
    const duration = 2500;
    const targetValue = stat.value;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);
      setDisplayValue(Math.floor(targetValue * easeOutQuint(progress)));
      if (progress < 1) requestAnimationFrame(animate);
    };
    const timeoutId = setTimeout(() => requestAnimationFrame(animate), index * 150);
    return () => clearTimeout(timeoutId);
  }, [isVisible, stat.value, index]);

  return (
    <div className="about-stat">
      <span className="about-stat-number">{displayValue}+</span>
      <span className="about-stat-label">{stat.label}</span>
    </div>
  );
});
StatCard.displayName = "StatCard";

// ... other card components remain the same ...
const FeatureCard = memo(({ feature }) => {
    const Icon = iconMap[feature.icon];
    return (
      <div className="about-feature-card" style={{ "--feature-color": feature.color }} onMouseMove={setMouseCSSVariables}>
        <div className="about-feature-icon">{Icon && <Icon size={30} />}</div>
        <div>
          <h3 className="about-feature-title">{feature.title}</h3>
          <p className="about-feature-description">{feature.description}</p>
        </div>
      </div>
    );
  });
FeatureCard.displayName = "FeatureCard";

const ProcessCard = memo(({ step }) => {
    const Icon = iconMap[step.icon];
    return (
      <div className="process-card" onMouseMove={setMouseCSSVariables}>
        <div className="process-card-icon">{Icon && <Icon size={32} />}</div>
        <h3 className="process-card-title">{step.title}</h3>
        <p className="process-card-description">{step.description}</p>
      </div>
    );
});
ProcessCard.displayName = "ProcessCard";
  
const TeamCard = memo(({ member }) => (
    <div className="about-team-card">
        <div className="team-card-image-wrapper">
        <Image src={member.image || "/team/placeholder.jpg"} alt={member.name} width={400} height={400} className="team-card-image" />
        </div>
        <div className="team-card-content">
        <h3 className="team-card-name">{member.name}</h3>
        <p className="team-card-role">{member.role}</p>
        <p className="team-card-bio">{member.bio}</p>
        </div>
    </div>
));
TeamCard.displayName = "TeamCard";
  
const TimelineItem = memo(({ milestone }) => {
    const linkProps = milestone.target_link
        ? { href: milestone.target_link, target: "_blank", rel: "noopener noreferrer" }
        : { href: "#timeline" };
    return (
        <div className="timeline-item">
        <a {...linkProps} className="timeline-card-link">
            <div className="timeline-card" onMouseMove={setMouseCSSVariables}>
            <Image
                src={milestone.image_url || "/placeholder.svg"}
                alt={milestone.title}
                width={500}
                height={300}
                className="timeline-image"
            />
            <div className="timeline-content">
                <h3 className="timeline-title">{milestone.title}</h3>
                <p className="timeline-description">{milestone.description}</p>
            </div>
            </div>
        </a>
        <div className="timeline-connector"></div>
        </div>
    );
});
TimelineItem.displayName = "TimelineItem";

// --- Section Specific Components defined within this file ---

const TimelineSectionContent = () => {
    const [timelineItems, setTimelineItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      const fetchTimeline = async () => {
        try {
          const items = await api.getTimelineItems();
          setTimelineItems(items);
        } catch (error) {
          console.error("Failed to load timeline items:", error);
          setTimelineItems([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTimeline();
    }, []);
  
    if(isLoading) return <TimelineSkeleton />;
  
    return (
      <div className="about-timeline-container">
        <div className="about-timeline-line"></div>
        {timelineItems.map((item) => (
          <TimelineItem key={item.id} milestone={item} />
        ))}
      </div>
    );
};

const TimelineSkeleton = () => (
    <div className="about-timeline-container" style={{ opacity: 0.5, pointerEvents: 'none' }}>
        <div className="about-timeline-line"></div>
        {[...Array(2)].map((_, i) => (
             <div key={i} className="timeline-item" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                <div className="timeline-card">
                   <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', width: '100%', height: '180px' }}></div>
                   <div className="timeline-content">
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', height: '24px', width: '70%', borderRadius: '8px', marginBottom: '12px' }}></div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', height: '16px', width: '90%', borderRadius: '8px' }}></div>
                   </div>
                </div>
             </div>
        ))}
         <style jsx>{`
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: .5; }
            }
        `}</style>
    </div>
);


// --- MAIN CLIENT COMPONENT ---
export default function AboutClient({ data }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [heroRef, isHeroVisible] = useAnimateOnScroll({threshold: 0.3}); // Animate hero sooner

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);
  
  if (!data || !data.hero) {
    return <div className="about-loading"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className={`about-page ${isLoaded ? "loaded" : ""}`}>
        <div className="about-background">
            <div className="light-effect light-effect-1"></div>
            <div className="light-effect light-effect-2"></div>
            <div className="light-effect light-effect-3"></div>
            <div className="shooting-star s1"></div>
            <div className="shooting-star s2"></div>
            <div className="shooting-star s3"></div>

            {/* Decorative SVG Vector Layer (arrows + orbs) */}
            <svg className="about-vector-layer" viewBox="0 0 1000 1000" aria-hidden="true" focusable="false">
              <defs>
                <linearGradient id="arrowGradBlue" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#13c8ff" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="arrowGradOrange" x1="1" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffb527" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                </linearGradient>
                <marker id="arrowHeadBlue" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#13c8ff" />
                </marker>
                <marker id="arrowHeadOrange" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#ffb527" />
                </marker>
              </defs>

              {/* Curved arrows */}
              <path className="vector-arrow" d="M 40 820 C 260 700 480 520 860 520" stroke="url(#arrowGradBlue)" markerEnd="url(#arrowHeadBlue)" />
              <path className="vector-arrow" d="M 140 180 C 440 260 660 160 920 280" stroke="url(#arrowGradOrange)" markerEnd="url(#arrowHeadOrange)" />
              <path className="vector-arrow" d="M 80 500 C 300 380 520 460 780 360" stroke="url(#arrowGradBlue)" markerEnd="url(#arrowHeadBlue)" />

              {/* Accent dotted orbs */}
              <g className="vector-orb" transform="translate(180,260)">
                <circle r="8" fill="#13c8ff" />
              </g>
              <g className="vector-orb" transform="translate(840,620)">
                <circle r="10" fill="#ffb527" />
              </g>
              <g className="vector-orb" transform="translate(420,840)">
                <circle r="6" fill="#13c8ff" />
              </g>
            </svg>
        </div>
      
        <div className="about-container">
            {/* Hero Section */}
            <section ref={heroRef} id="hero" className={`about-hero about-fade-in ${isHeroVisible ? "about-animate" : ""}`}>
                <div className="about-hero-badge"><Award size={20} /><span>{data.hero.badge}</span></div>
                <h1 className="about-hero-title">{data.hero.title}</h1>
                <p className="about-hero-subtitle">{data.hero.subtitle}</p>
                <div className="about-stats">
                    {data.statData.map((stat, index) => (
                    <StatCard key={index} stat={stat} index={index} isVisible={isHeroVisible} />
                    ))}
                </div>
            </section>

            {/* Other Sections Wrapped for Animation */}
            <SectionWrapper id="vision">
                <section className="about-section">
                    <div className="about-section-header">
                        <h2 className="about-section-title">{data.vision.title}</h2>
                        <p className="about-section-subtitle">{data.vision.subtitle}</p>
                    </div>
                    <div className="about-vision-content"><p>{data.vision.content}</p></div>
                </section>
            </SectionWrapper>
            
            <SectionWrapper id="why-choose-us">
                <section className="about-section">
                    <div className="about-section-header">
                        <h2 className="about-section-title">{data.whyChooseUs.title}</h2>
                        <p className="about-section-subtitle">{data.whyChooseUs.subtitle}</p>
                    </div>
                    <div className="about-features-grid">
                        {data.features.map((feature, index) => (
                        <FeatureCard key={index} feature={feature} />
                        ))}
                    </div>
                </section>
            </SectionWrapper>

            <SectionWrapper id="process">
                <section className="about-process">
                    <div className="about-section-header">
                        <h2 className="about-section-title">{data.process.title}</h2>
                        <p className="about-section-subtitle">{data.process.subtitle}</p>
                    </div>
                    <div className="about-process-container">
                        <div className="process-connector-line"></div>
                        <div className="about-process-horizontal-scroller">
                        {data.process.steps.map((step, index) => (
                            <ProcessCard key={index} step={step} />
                        ))}
                        </div>
                    </div>
                </section>
            </SectionWrapper>
            
            <SectionWrapper id="team">
                <section className="about-section">
                    <div className="about-section-header">
                        <h2 className="about-section-title">{data.team.title}</h2>
                        <p className="about-section-subtitle">{data.team.subtitle}</p>
                    </div>
                    <div className="about-team-grid">
                        {data.team.members.map((member, index) => (
                        <TeamCard key={index} member={member} />
                        ))}
                    </div>
                </section>
            </SectionWrapper>

            <SectionWrapper id="timeline">
                <section className="about-section">
                    <div className="about-section-header">
                        <h2 className="about-section-title">{data.timeline.title}</h2>
                        <p className="about-section-subtitle">{data.timeline.subtitle}</p>
                    </div>
                    <TimelineSectionContent />
                </section>
            </SectionWrapper>

            <SectionWrapper id="cta">
                <section className="about-section">
                    <div className="about-cta-content">
                        <h2 className="about-cta-title">{data.cta.title}</h2>
                        <p className="about-cta-description">{data.cta.description}</p>
                        <div className="about-cta-actions">
                        <a href={`tel:${data.cta.phone_button.replace(/\D/g,'')}`} className="about-btn about-btn-primary"><Phone size={20} /><span>{data.cta.phone_button}</span></a>
                        <a href="https://wa.me/989191771727" target="_blank" rel="noopener noreferrer" className="about-btn about-btn-secondary"><Mail size={20} /><span>{data.cta.consult_button}</span></a>
                        </div>
                        <div className="about-cta-features">
                        {data.ctaFeatures.map((feature, index) => (
                            <div key={index} className="about-cta-feature">
                            <CheckCircle size={18} />
                            <span>{feature}</span>
                            </div>
                        ))}
                        </div>
                    </div>
                </section>
            </SectionWrapper>

        </div>
    </div>
  )
}