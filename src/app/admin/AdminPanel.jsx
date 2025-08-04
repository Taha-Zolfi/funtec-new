"use client"

import { useState, useEffect } from "react"
import { db } from "../api" // Adjusted import path for flat structure
import "./AdminPanel.css" // Import the CSS file

// WARNING: Hardcoding passwords is a security risk. Use environment variables in production.
const ADMIN_PASSWORD = "LaserTech2024!"

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")

  const [products, setProducts] = useState([])
  const [news, setNews] = useState([])
  const [services, setServices] = useState([])
  const [stats, setStats] = useState({})

  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedNews, setSelectedNews] = useState(null)
  const [selectedService, setSelectedService] = useState(null)

  const [productFormData, setProductFormData] = useState({
    title: "",
    description: "",
    is_featured: false,
    background_video: "",
    features: [],
    images: [],
    specifications: [],
    reviews: [],
  })

  const [newsFormData, setNewsFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    description: "",
    author: "",
    category: "",
    image: "",
    is_featured: false,
    views: 0,
  })

  const [serviceFormData, setServiceFormData] = useState({
    title: "",
    description: "",
    mainImage: "",
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated")
    if (storedAuth === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated, activeTab])

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem("isAuthenticated", "true")
      setError(null)
    } else {
      setError("رمز عبور اشتباه است.")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("isAuthenticated")
    setPassword("")
    setProducts([])
    setNews([])
    setServices([])
    setStats({})
    setSelectedProduct(null)
    setSelectedNews(null)
    setSelectedService(null)
    resetProductForm()
    resetNewsForm()
    resetServiceForm()
  }

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const fetchedProducts = await db.getProducts()
      const fetchedNews = await db.getNews()
      const fetchedServices = await db.getServices()
      const fetchedStats = await db.getStats()

      setProducts(fetchedProducts)
      setNews(fetchedNews)
      setServices(fetchedServices)
      setStats(fetchedStats)
    } catch (err) {
      let errorMessage = `خطا در بارگذاری اطلاعات: ${err.message}`
      if (err.message.includes("Unexpected token")) {
        errorMessage = "خطا در ارتباط با سرور: پاسخ دریافتی یک JSON معتبر نیست. لطفاً فایل‌های سرور (PHP) را بررسی کنید."
      }
      setError(errorMessage)
      console.error("Failed to load data:", err)
    } finally {
      setLoading(false)
    }
  }

  // --- Product Form Handlers ---
  const handleProductInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setProductFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const createDynamicHandlers = (fieldName, formType = "product") => {
    const setFormData = formType === "product" ? setProductFormData : setServiceFormData
    const formData = formType === "product" ? productFormData : serviceFormData

    return {
      handleChange: (index, value) => {
        const newItems = [...formData[fieldName]]
        newItems[index] = value
        setFormData((prev) => ({ ...prev, [fieldName]: newItems }))
      },
      handleAdd: () => {
        setFormData((prev) => ({ ...prev, [fieldName]: [...prev[fieldName], ""] }))
      },
      handleRemove: (index) => {
        const newItems = formData[fieldName].filter((_, i) => i !== index)
        setFormData((prev) => ({ ...prev, [fieldName]: newItems }))
      },
    }
  }

  const productFeaturesHandlers = createDynamicHandlers("features", "product")
  const productImagesHandlers = createDynamicHandlers("images", "product")
  const productSpecificationsHandlers = createDynamicHandlers("specifications", "product")
  const productReviewsHandlers = createDynamicHandlers("reviews", "product")

  const handleProductFileChange = async (e, fieldName) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    try {
      const result = await db.uploadFile(file)
      if (fieldName === "image_file") {
        setProductFormData((prev) => ({
          ...prev,
          images: [...prev.images, result.url],
        }))
      } else if (fieldName === "video_file") {
        setProductFormData((prev) => ({
          ...prev,
          background_video: result.url,
        }))
      }
      setError(null)
    } catch (err) {
      setError(`خطا در آپلود فایل: ${err.message}`)
      console.error("File upload error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitProduct = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (selectedProduct && selectedProduct.id) {
        await db.updateProduct(selectedProduct.id, productFormData)
      } else {
        await db.createProduct(productFormData)
      }
      setSelectedProduct(null)
      resetProductForm()
      loadData()
    } catch (err) {
      setError(`خطا در ذخیره محصول: ${err.message}`)
      console.error("Error saving product:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelProductEdit = () => {
    setSelectedProduct(null)
    resetProductForm()
  }

  const handleAddProduct = () => {
    setSelectedProduct({})
    resetProductForm()
  }

  const handleEditProduct = (product) => {
    setSelectedProduct(product)
    setProductFormData({
      ...product,
      is_featured: Boolean(product.is_featured),
      features: Array.isArray(product.features) ? product.features : [],
      images: Array.isArray(product.images) ? product.images : [],
      specifications:
        typeof product.specifications === "string" && product.specifications ? product.specifications.split(",") : [],
      reviews: typeof product.reviews === "string" && product.reviews ? product.reviews.split(",") : [],
    })
  }

  const handleDeleteProduct = async (id) => {
    setLoading(true)
    setError(null)
    if (window.confirm("آیا مطمئنید که می‌خواهید این محصول را حذف کنید؟")) {
      try {
        await db.deleteProduct(id)
        loadData()
      } catch (err) {
        setError(`خطا در حذف محصول: ${err.message}`)
        console.error("Error deleting product:", err)
      } finally {
        setLoading(false)
      }
    }
  }

  const resetProductForm = () => {
    setProductFormData({
      title: "",
      description: "",
      is_featured: false,
      background_video: "",
      features: [],
      images: [],
      specifications: [],
      reviews: [],
    })
  }

  // --- News Form Handlers ---
  const handleNewsInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setNewsFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }))
  }

  const handleNewsFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    try {
      const result = await db.uploadFile(file)
      setNewsFormData((prev) => ({
        ...prev,
        image: result.url,
      }))
      setError(null)
    } catch (err) {
      setError(`خطا در آپلود عکس خبر: ${err.message}`)
      console.error("News image upload error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitNews = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (selectedNews && selectedNews.id) {
        await db.updateNews(selectedNews.id, newsFormData)
      } else {
        await db.createNews(newsFormData)
      }
      setSelectedNews(null)
      resetNewsForm()
      loadData()
    } catch (err) {
      setError(`خطا در ذخیره خبر: ${err.message}`)
      console.error("Error saving news:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelNewsEdit = () => {
    setSelectedNews(null)
    resetNewsForm()
  }

  const handleAddNews = () => {
    setSelectedNews({})
    resetNewsForm()
  }

  const handleEditNews = (newsItem) => {
    setSelectedNews(newsItem)
    setNewsFormData({
      ...newsItem,
      is_featured: Boolean(newsItem.is_featured),
    })
  }

  const handleDeleteNews = async (id) => {
    setLoading(true)
    setError(null)
    if (window.confirm("آیا مطمئنید که می‌خواهید این خبر را حذف کنید؟")) {
      try {
        await db.deleteNews(id)
        loadData()
      } catch (err) {
        setError(`خطا در حذف خبر: ${err.message}`)
        console.error("Error deleting news:", err)
      } finally {
      }
    }
  }

  const resetNewsForm = () => {
    setNewsFormData({
      title: "",
      excerpt: "",
      content: "",
      description: "",
      author: "",
      category: "",
      image: "",
      is_featured: false,
      views: 0,
    })
  }

  // --- Service Form Handlers ---
  const handleServiceInputChange = (e) => {
    const { name, value } = e.target
    setServiceFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleServiceFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    try {
      const result = await db.uploadFile(file)
      setServiceFormData((prev) => ({
        ...prev,
        mainImage: result.url,
      }))
      setError(null)
    } catch (err) {
      setError(`خطا در آپلود فایل: ${err.message}`)
      console.error("File upload error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitService = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (selectedService && selectedService.id) {
        await db.updateService(selectedService.id, serviceFormData)
      } else {
        await db.createService(serviceFormData)
      }
      setSelectedService(null)
      resetServiceForm()
      loadData()
    } catch (err) {
      setError(`خطا در ذخیره خدمت: ${err.message}`)
      console.error("Error saving service:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelServiceEdit = () => {
    setSelectedService(null)
    resetServiceForm()
  }

  const handleAddService = () => {
    setSelectedService({})
    resetServiceForm()
  }

  const handleEditService = (service) => {
    setSelectedService(service)
    setServiceFormData({
      title: service.title,
      description: service.description,
      mainImage: service.mainImage,
    })
  }

  const handleDeleteService = async (id) => {
    setLoading(true)
    setError(null)
    if (window.confirm("آیا مطمئنید که می‌خواهید این خدمت را حذف کنید؟")) {
      try {
        await db.deleteService(id)
        loadData()
      } catch (err) {
        setError(`خطا در حذف خدمت: ${err.message}`)
        console.error("Error deleting service:", err)
      } finally {
        setLoading(false)
      }
    }
  }

  const resetServiceForm = () => {
    setServiceFormData({
      title: "",
      description: "",
      mainImage: "",
    })
  }

  const DynamicInputList = ({ label, items, handlers, placeholder }) => (
    <div className="form-group">
      <label>{label}:</label>
      {items.map((item, index) => (
        <div key={index} className="dynamic-input-group">
          <input
            type="text"
            value={item}
            onChange={(e) => handlers.handleChange(index, e.target.value)}
            placeholder={placeholder}
          />
          <button type="button" onClick={() => handlers.handleRemove(index)} className="remove-button">
            &times;
          </button>
        </div>
      ))}
      <button type="button" onClick={handlers.handleAdd} className="add-item-button">
        + افزودن {label}
      </button>
    </div>
  )

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>ورود به پنل مدیریت</h2>
          <div className="form-group">
            <label htmlFor="password">رمز عبور:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-btn">
            ورود
          </button>
          <p className="password-hint">رمز عبور: LaserTech2024!</p>
        </form>
      </div>
    )
  }

  return (
    <div className="admin-panel">
      <header className="header">
        <h1>پنل مدیریت</h1>
        <button onClick={handleLogout} className="logout-button">
          خروج
        </button>
      </header>
      <nav className="sidebar">
        <ul>
          <li onClick={() => setActiveTab("dashboard")} className={activeTab === "dashboard" ? "active" : ""}>
            داشبورد
          </li>
          <li onClick={() => setActiveTab("products")} className={activeTab === "products" ? "active" : ""}>
            مدیریت محصولات
          </li>
          <li onClick={() => setActiveTab("news")} className={activeTab === "news" ? "active" : ""}>
            مدیریت اخبار
          </li>
          <li onClick={() => setActiveTab("services")} className={activeTab === "services" ? "active" : ""}>
            مدیریت خدمات
          </li>
        </ul>
      </nav>
      <main className="main-content">
        {loading && <div className="loading-spinner"></div>}
        {error && <div className="error-alert">{error}</div>}
        {activeTab === "dashboard" && (
          <div className="dashboard-section">
            <h2>داشبورد</h2>
            <div className="stats-cards">
              <div className="card">
                <h3>تعداد کل محصولات</h3>
                <p>{stats.total_products}</p>
              </div>
              <div className="card">
                <h3>تعداد محصولات ویژه</h3>
                <p>{stats.featured_products}</p>
              </div>
              <div className="card">
                <h3>تعداد کل اخبار</h3>
                <p>{stats.total_news}</p>
              </div>
              <div className="card">
                <h3>تعداد کل خدمات</h3>
                <p>{stats.total_services || services.length}</p>
              </div>
            </div>
            <div className="latest-items">
              <h3>آخرین محصولات</h3>
              <ul>
                {products.slice(0, 5).map((product) => (
                  <li key={product.id}>{product.title}</li>
                ))}
              </ul>
              <h3>آخرین اخبار</h3>
              <ul>
                {news.slice(0, 5).map((item) => (
                  <li key={item.id}>{item.title}</li>
                ))}
              </ul>
              <h3>آخرین خدمات</h3>
              <ul>
                {services.slice(0, 5).map((item) => (
                  <li key={item.id}>{item.title}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {activeTab === "products" && (
          <div className="products-section">
            <h2>مدیریت محصولات</h2>
            <button className="add-button" onClick={handleAddProduct}>
              افزودن محصول جدید
            </button>
            <ul className="item-list">
              {products.length === 0 ? (
                <p>هیچ محصولی ��افت نشد. می‌توانید یک محصول جدید اضافه کنید.</p>
              ) : (
                products.map((product) => (
                  <li key={product.id}>
                    <span>{product.title}</span>
                    <div className="item-actions">
                      <button onClick={() => handleEditProduct(product)}>ویرایش</button>
                      <button onClick={() => handleDeleteProduct(product.id)}>حذف</button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
        {activeTab === "news" && (
          <div className="news-section">
            <h2>مدیریت اخبار</h2>
            <button className="add-button" onClick={handleAddNews}>
              افزودن خبر جدید
            </button>
            <ul className="item-list">
              {news.length === 0 ? (
                <p>هیچ خبری یافت نشد. می‌توانید یک خبر جدید اضافه کنید.</p>
              ) : (
                news.map((item) => (
                  <li key={item.id}>
                    <span>{item.title}</span>
                    <div className="item-actions">
                      <button onClick={() => handleEditNews(item)}>ویرایش</button>
                      <button onClick={() => handleDeleteNews(item.id)}>حذف</button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
        {activeTab === "services" && (
          <div className="services-section">
            <h2>مدیریت خدمات</h2>
            <button className="add-button" onClick={handleAddService}>
              افزودن خدمت جدید
            </button>
            <ul className="item-list">
              {services.length === 0 ? (
                <p>هیچ خدمتی یافت نشد. می‌توانید یک خدمت جدید اضافه کنید.</p>
              ) : (
                services.map((service) => (
                  <li key={service.id}>
                    <span>{service.title}</span>
                    <div className="item-actions">
                      <button onClick={() => handleEditService(service)}>ویرایش</button>
                      <button onClick={() => handleDeleteService(service.id)}>حذف</button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
        {selectedProduct !== null && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{selectedProduct && selectedProduct.id ? "ویرایش محصول" : "افزودن محصول جدید"}</h3>
                <button className="close-modal-btn" onClick={handleCancelProductEdit}>
                  &times;
                </button>
              </div>
              <form onSubmit={handleSubmitProduct} className="modal-form">
                <div className="form-group">
                  <label>عنوان:</label>
                  <input
                    type="text"
                    name="title"
                    value={productFormData.title}
                    onChange={handleProductInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>توضیحات:</label>
                  <textarea
                    name="description"
                    value={productFormData.description}
                    onChange={handleProductInputChange}
                    required
                  ></textarea>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={productFormData.is_featured}
                      onChange={handleProductInputChange}
                    />
                    محصول ویژه
                  </label>
                </div>
                <div className="form-group">
                  <label>ویدئو پس زمینه (URL یا آپلود):</label>
                  <input
                    type="text"
                    name="background_video"
                    value={productFormData.background_video}
                    onChange={handleProductInputChange}
                    placeholder="http://example.com/video.mp4"
                  />
                  <div className="file-input-group">
                    <input
                      type="file"
                      id="productVideoUpload"
                      accept="video/mp4,video/webm"
                      onChange={(e) => handleProductFileChange(e, "video_file")}
                    />
                    <label htmlFor="productVideoUpload">یا آپلود ویدئو</label>
                    {productFormData.background_video && (
                      <span className="file-name">{productFormData.background_video.split("/").pop()}</span>
                    )}
                  </div>
                  {productFormData.background_video && (
                    <video src={productFormData.background_video} controls className="file-preview" />
                  )}
                </div>
                <DynamicInputList
                  label="تصاویر محصول"
                  items={productFormData.images}
                  handlers={productImagesHandlers}
                  placeholder="URL تصویر"
                />
                <div className="file-input-group">
                  <input
                    type="file"
                    id="productImageUpload"
                    accept="image/png,image/jpeg,image/jpg"
                    multiple
                    onChange={(e) => handleProductFileChange(e, "image_file")}
                  />
                  <label htmlFor="productImageUpload">یا آپلود تصاویر</label>
                </div>
                <DynamicInputList
                  label="ویژگی‌ها"
                  items={productFormData.features}
                  handlers={productFeaturesHandlers}
                  placeholder="ویژگی جدید"
                />
                <DynamicInputList
                  label="مشخصات"
                  items={productFormData.specifications}
                  handlers={productSpecificationsHandlers}
                  placeholder="مشخصات محصول"
                />
                <DynamicInputList
                  label="نظرات"
                  items={productFormData.reviews}
                  handlers={productReviewsHandlers}
                  placeholder="نظر مشتری"
                />
                <div className="form-actions">
                  <button type="button" className="cancel" onClick={handleCancelProductEdit}>
                    لغو
                  </button>
                  <button type="submit" className="save">
                    ذخیره محصول
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {selectedNews !== null && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{selectedNews && selectedNews.id ? "ویرایش خبر" : "افزودن خبر جدید"}</h3>
                <button className="close-modal-btn" onClick={handleCancelNewsEdit}>
                  &times;
                </button>
              </div>
              <form onSubmit={handleSubmitNews} className="modal-form">
                <div className="form-group">
                  <label>عنوان:</label>
                  <input
                    type="text"
                    name="title"
                    value={newsFormData.title}
                    onChange={handleNewsInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>خلاصه (Excerpt):</label>
                  <textarea name="excerpt" value={newsFormData.excerpt} onChange={handleNewsInputChange}></textarea>
                </div>
                <div className="form-group">
                  <label>محتوا:</label>
                  <textarea
                    name="content"
                    value={newsFormData.content}
                    onChange={handleNewsInputChange}
                    required
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>توضیحات (Description):</label>
                  <textarea
                    name="description"
                    value={newsFormData.description}
                    onChange={handleNewsInputChange}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>نویسنده:</label>
                  <input type="text" name="author" value={newsFormData.author} onChange={handleNewsInputChange} />
                </div>
                <div className="form-group">
                  <label>دسته‌بندی:</label>
                  <input type="text" name="category" value={newsFormData.category} onChange={handleNewsInputChange} />
                </div>
                <div className="form-group">
                  <label>تصویر خبر (URL یا آپلود):</label>
                  <input
                    type="url"
                    name="image"
                    value={newsFormData.image}
                    onChange={handleNewsInputChange}
                    placeholder="http://example.com/news_image.jpg"
                  />
                  <div className="file-input-group">
                    <input
                      type="file"
                      id="newsImageUpload"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleNewsFileChange}
                    />
                    <label htmlFor="newsImageUpload">یا آپلود عکس</label>
                    {newsFormData.image && <span className="file-name">{newsFormData.image.split("/").pop()}</span>}
                  </div>
                  {newsFormData.image && (
                    <img src={newsFormData.image || "/placeholder.svg"} alt="News Preview" className="file-preview" />
                  )}
                </div>
                <div className="form-group">
                  <label>بازدیدها:</label>
                  <input
                    type="number"
                    name="views"
                    value={newsFormData.views}
                    onChange={handleNewsInputChange}
                    min="0"
                  />
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={Boolean(newsFormData.is_featured)}
                      onChange={handleNewsInputChange}
                    />
                    خبر ویژه
                  </label>
                </div>
                <div className="form-actions">
                  <button type="button" className="cancel" onClick={handleCancelNewsEdit}>
                    لغو
                  </button>
                  <button type="submit" className="save">
                    ذخیره خبر
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {selectedService !== null && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{selectedService && selectedService.id ? "ویرایش خدمت" : "افزودن خدمت جدید"}</h3>
                <button className="close-modal-btn" onClick={handleCancelServiceEdit}>
                  &times;
                </button>
              </div>
              <form onSubmit={handleSubmitService} className="modal-form">
                <div className="form-group">
                  <label>عنوان:</label>
                  <input
                    type="text"
                    name="title"
                    value={serviceFormData.title}
                    onChange={handleServiceInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>توضیحات:</label>
                  <textarea
                    name="description"
                    value={serviceFormData.description}
                    onChange={handleServiceInputChange}
                    required
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>تصویر اصلی (URL یا آپلود):</label>
                  <input
                    type="text"
                    name="mainImage"
                    value={serviceFormData.mainImage}
                    onChange={handleServiceInputChange}
                    placeholder="http://example.com/main_service_image.jpg"
                  />
                  <div className="file-input-group">
                    <input
                      type="file"
                      id="serviceMainImageUpload"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(e) => handleServiceFileChange(e, "mainImage_file")}
                    />
                    <label htmlFor="serviceMainImageUpload">یا آپلود تصویر اصلی</label>
                    {serviceFormData.mainImage && (
                      <span className="file-name">{serviceFormData.mainImage.split("/").pop()}</span>
                    )}
                  </div>
                  {serviceFormData.mainImage && (
                    <img
                      src={serviceFormData.mainImage || "/placeholder.svg"}
                      alt="Main Service Preview"
                      className="file-preview"
                    />
                  )}
                </div>
                <div className="form-actions">
                  <button type="button" className="cancel" onClick={handleCancelServiceEdit}>
                    لغو
                  </button>
                  <button type="submit" className="save">
                    ذخیره خدمت
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminPanel

