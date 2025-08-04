"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { Sparkles } from "lucide-react"
import { db } from "../../api"
import "./services.css"

// Individual Service Item Component
const ServiceItem = memo(({ service, index }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const isEven = index % 2 === 0 // Determines if the image is on the right (even index) or left (odd index)

  return (
    <section className={`service-section ${isEven ? "even" : "odd"}`}>
      <div className="service-content-wrapper">
        <div className="service-image-container">
          <img
            src={
              service.mainImage ||
              `/placeholder.svg?height=600&width=600&text=${encodeURIComponent(service.title || "خدمت")}`
            }
            alt={service.title || "خدمت"}
            className={`service-image ${imageLoaded ? "loaded" : ""}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.target.src = `/placeholder.svg?height=600&width=600&text=${encodeURIComponent(service.title || "خدمت")}`
            }}
          />
          {service.is_featured && (
            <div className="service-featured-badge">
              <Sparkles size={20} />
              <span>ویژه</span>
            </div>
          )}
        </div>
        <div className="service-text-container">
          <h2 className="service-title">{service.title || "خدمت بدون نام"}</h2>
          <p className="service-description">{service.description || "توضیحی برای این خدمت موجود نیست."}</p>
        </div>
      </div>
    </section>
  )
})

// Main Services Component
const Services = () => {
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load services
  const loadServices = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log("Loading services...")

      const allServices = await db.getServices()
      console.log("Raw services from API:", allServices)

      if (!allServices || !Array.isArray(allServices)) {
        console.error("Invalid services data:", allServices)
        setServices([])
        return
      }

      const BASE_URL = "https://funtec.ir" // Assuming this is your base URL for images

      const mappedServices = allServices.map((service) => {
        let processedImages = []
        const rawImagesFromAPI = service.images

        if (Array.isArray(rawImagesFromAPI)) {
          processedImages = rawImagesFromAPI
        } else if (typeof rawImagesFromAPI === "string" && rawImagesFromAPI.trim() !== "") {
          processedImages = rawImagesFromAPI.split(",").map((img) => img.trim())
        }

        const finalImages = processedImages
          .filter((img) => img && typeof img === "string" && img.trim() !== "")
          .map((img) => {
            const path = img.trim().startsWith("/") ? img.trim() : `/${img.trim()}`
            return `${BASE_URL}${path}`
          })

        let mainImage =
          finalImages.length > 0
            ? finalImages[0]
            : `/placeholder.svg?height=600&width=600&text=${encodeURIComponent(service.title || "خدمت")}`
        if (finalImages.length === 0 && service.image && typeof service.image === "string") {
          const path = service.image.trim().startsWith("/") ? service.image.trim() : `/${service.image.trim()}`
          mainImage = `${BASE_URL}${path}`
        }

        return {
          ...service,
          images: finalImages,
          mainImage: mainImage,
          // Explicitly remove properties not needed for this simplified display
          features: undefined,
          benefits: undefined,
          reviews: undefined,
          price: undefined,
        }
      })

      console.log("Processed services:", mappedServices)
      setServices(mappedServices)
    } catch (err) {
      console.error("Error loading services:", err)
      setServices([])
      setError("خطا در بارگذاری خدمات. لطفاً اتصال اینترنت خود را بررسی کنید یا بعداً دوباره امتحان کنید.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadServices()
  }, [loadServices])

  if (isLoading) {
    return (
      <div className="services-page loading">
        <div className="services-loading-container">
          <div className="services-loading-spinner"></div>
          <h2>در حال بارگذاری خدمات...</h2>
          <p>لطفاً صبر کنید</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="services-page error">
        <div className="services-error-container">
          <h2>خطا در بارگذاری</h2>
          <p>{error}</p>
          <button onClick={loadServices} className="services-retry-btn">
            تلاش مجدد
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="services-page">
      <div className="services-main-header">
        <h1 className="services-main-title">
          <span className="services-title-word">خدمات</span>
          <span className="services-title-word highlight">فان تک</span>
        </h1>
        <p className="services-main-subtitle">
          مجموعه کاملی از خدمات تخصصی شهربازی شامل نصب، نگهداری، مشاوره و پشتیبانی
        </p>
      </div>

      <main className="services-main-content">
        {services.length > 0 ? (
          services.map((service, index) => <ServiceItem key={service.id} service={service} index={index} />)
        ) : (
          <div className="services-empty-state">
            <div className="services-empty-content">
              <div className="services-empty-icon">
                <Sparkles size={80} />
              </div>
              <h3>خدمتی یافت نشد</h3>
              <p>در حال حاضر خدمتی برای نمایش موجود نیست. لطفاً بعداً دوباره بررسی کنید.</p>
              <button className="services-reset-btn" onClick={loadServices}>
                تلاش مجدد برای بارگذاری
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// Set display names
ServiceItem.displayName = "ServiceItem"

export default Services
