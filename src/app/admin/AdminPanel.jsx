"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import RichTextEditor from "./components/RichTextEditor"
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
    name: "",
    description: "",
    short_description: "",
    full_description: "",
    background_video: "",
    features: [],
    images: [],
    specifications: [],
    video_preview: null
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
      const [fetchedProducts, fetchedNews, fetchedServices] = await Promise.all([
        api.getProducts(),
        api.getNews(),
        api.getServices()
      ]);

      setProducts(fetchedProducts)
      setNews(fetchedNews)
      setServices(fetchedServices)
      // Initialize stats with current data counts
      setStats({
        totalProducts: fetchedProducts.length,
        totalNews: fetchedNews.length,
        totalServices: fetchedServices.length
      })
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
        const currentItems = formData[fieldName] || []
        const newItems = [...currentItems]
        newItems[index] = value
        setFormData((prev) => ({ ...prev, [fieldName]: newItems }))
      },
      handleAdd: () => {
        setFormData((prev) => ({ 
          ...prev, 
          [fieldName]: [...(prev[fieldName] || []), ""] 
        }))
      },
      handleRemove: (index) => {
        const currentItems = formData[fieldName] || []
        const newItems = currentItems.filter((_, i) => i !== index)
        setFormData((prev) => ({ ...prev, [fieldName]: newItems }))
      },
    }
  }

  const productFeaturesHandlers = createDynamicHandlers("features", "product")
  const productImagesHandlers = createDynamicHandlers("images", "product")
  const productSpecificationsHandlers = createDynamicHandlers("specifications", "product")

  const handleProductFileChange = async (e, fieldName) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setLoading(true)
    try {
      if (fieldName === "image_file") {
        // Handle multiple image uploads
        const uploadPromises = Array.from(files).map(file => api.uploadFile(file))
        const results = await Promise.all(uploadPromises)
        setProductFormData((prev) => ({
          ...prev,
          images: [...(prev.images || []), ...results.map(r => r.url)],
        }))
      } else if (fieldName === "video_file") {
        // Handle single video upload
        console.log('Uploading video file:', files[0].name);
        const result = await api.uploadFile(files[0]);
        console.log('Upload result:', result);
        const fullUrl = result.url.startsWith('/') ? result.url : `/${result.url}`;
        setProductFormData((prev) => ({
          ...prev,
          background_video: fullUrl,
        }));
        console.log('Updated form data with video:', fullUrl);
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

    // Validate required fields
    if (!productFormData.name || !productFormData.short_description || !productFormData.full_description) {
      setError("لطفاً نام، توضیحات مختصر و توضیحات کامل محصول را وارد کنید");
      setLoading(false);
      return;
    }

    // Clean up the data before sending
    const cleanedData = {
      ...productFormData,
      features: productFormData.features?.filter(Boolean) || [],
      images: productFormData.images?.filter(Boolean) || [],
      specifications: productFormData.specifications?.filter(Boolean) || [],
      background_video: productFormData.background_video || null
    };

    try {
      console.log("Sending product data:", JSON.stringify(cleanedData, null, 2));
      console.log("Selected product:", selectedProduct);
      
      if (selectedProduct && selectedProduct.id) {
        console.log("Updating product with ID:", selectedProduct.id);
        const result = await api.updateProduct(selectedProduct.id, cleanedData);
        console.log("Update result:", result);
      } else {
        console.log("Creating new product");
        const result = await api.createProduct(cleanedData);
        console.log("Create result:", result);
      }
      
      setSelectedProduct(null)
      resetProductForm()
      loadData()
    } catch (err) {
      console.error("Full error details:", err);
      setError(`خطا در ذخیره محصول: ${err.message}`)
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

  const handleEditProduct = async (product) => {
    console.log('Editing product:', product);
    setLoading(true);
    try {
      // Fetch fresh product data to ensure we have all fields
      const freshProduct = await api.getProduct(product.id);
      console.log('Fresh product data:', freshProduct);
      
      setSelectedProduct(freshProduct);
      setProductFormData({
        name: freshProduct.name || "",
        short_description: freshProduct.short_description || "",
        full_description: freshProduct.full_description || "",
        background_video: freshProduct.background_video || "",
        features: Array.isArray(freshProduct.features) ? freshProduct.features : [],
        images: Array.isArray(freshProduct.images) ? freshProduct.images : [],
        specifications: Array.isArray(freshProduct.specifications) ? freshProduct.specifications : []
      });
    } catch (err) {
      console.error('Error loading product details:', err);
      setError('خطا در بارگذاری اطلاعات محصول');
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteProduct = async (id) => {
    setLoading(true)
    setError(null)
    if (window.confirm("آیا مطمئنید که می‌خواهید این محصول را حذف کنید؟")) {
      try {
        await api.deleteProduct(id)
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
      name: "",
      short_description: "",
      full_description: "",
      background_video: "",
      features: [],
      images: [],
      specifications: []
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
      const result = await api.uploadFile(file)
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
    
    // Validate required fields
    if (!newsFormData.title || !newsFormData.content) {
      setError("لطفاً عنوان و محتوای خبر را وارد کنید");
      setLoading(false);
      return;
    }
    
    console.log('Submitting news data:', newsFormData);
    
    try {
      let result;
      if (selectedNews && selectedNews.id) {
        console.log('Updating existing news:', selectedNews.id);
        result = await api.updateNews(selectedNews.id, newsFormData);
      } else {
        console.log('Creating new news');
        result = await api.createNews(newsFormData);
      }
      console.log('API response:', result);
      
      setSelectedNews(null)
      resetNewsForm()
      await loadData() // منتظر بمانیم تا دیتا لود شود
      
    } catch (err) {
      const errorMessage = `خطا در ذخیره خبر: ${err.message || 'خطای ناشناخته'}`;
      setError(errorMessage)
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
        await api.deleteNews(id)
        loadData()
      } catch (err) {
        setError(`خطا در حذف خبر: ${err.message}`)
        console.error("Error deleting news:", err)
      } finally {
        setLoading(false)
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

  const DynamicInputList = ({ label, items = [], handlers, placeholder }) => (
    <div className="form-group">
      <label>{label}:</label>
      {Array.isArray(items) && items.map((item, index) => (
        <div key={index} className="dynamic-input-group">
          <input
            type="text"
            value={item || ''}
            onChange={(e) => handlers?.handleChange(index, e.target.value)}
            placeholder={placeholder}
          />
          <button type="button" onClick={() => handlers?.handleRemove(index)} className="remove-button">
            &times;
          </button>
        </div>
      ))}
      <button type="button" onClick={handlers?.handleAdd} className="add-item-button">
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
                <p>هیچ محصولی یافت نشد. می‌توانید یک محصول جدید اضافه کنید.</p>
              ) : (
                products.map((product) => (
                  <li key={product.id}>
                    <span>{product.name}</span>
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
                  <label>نام محصول:</label>
                  <input
                    type="text"
                    name="name"
                    value={productFormData.name}
                    onChange={handleProductInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>توضیحات مختصر (حداکثر 150 کاراکتر):</label>
                  <textarea
                    name="short_description"
                    value={productFormData.short_description}
                    onChange={handleProductInputChange}
                    maxLength={150}
                    required
                  ></textarea>
                  <small className="character-count">{(productFormData.short_description || '').length}/150</small>
                </div>
                <div className="form-group">
                  <label>توضیحات کامل:</label>
                  <RichTextEditor
                    value={productFormData.full_description || ''}
                    onChange={(content) => setProductFormData(prev => ({...prev, full_description: content}))}
                  />
                </div>
                <div className="form-group video-upload-group">
                  <label>ویدئو پس زمینه:</label>
                  <div className="video-upload-container">
                    <div className="video-upload-input">
                      <input
                        type="file"
                        id="productVideoUpload"
                        accept="video/mp4,video/webm"
                        onChange={(e) => handleProductFileChange(e, "video_file")}
                        className="video-file-input"
                      />
                      <label htmlFor="productVideoUpload" className="video-upload-label">
                        <span>انتخاب ویدئو</span>
                        <small>فرمت‌های مجاز: MP4, WebM</small>
                      </label>
                    </div>
                    
                    {productFormData.background_video && (
                      <div className="video-preview-container">
                        <div className="video-preview-header">
                          <span className="video-file-name">
                            {productFormData.background_video.split("/").pop()}
                          </span>
                          <button
                            type="button"
                            className="remove-video-btn"
                            onClick={() => setProductFormData(prev => ({...prev, background_video: ""}))}
                          >
                            حذف ویدئو
                          </button>
                        </div>
                        <video
                          src={productFormData.background_video}
                          controls
                          className="video-preview"
                          onError={(e) => {
                            console.error("Video load error:", e);
                            e.target.parentElement.classList.add("video-error");
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <DynamicInputList
                  label="تصاویر محصول"
                  items={productFormData.images || []}
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
                  items={productFormData.features || []}
                  handlers={productFeaturesHandlers}
                  placeholder="ویژگی جدید"
                />
                <DynamicInputList
                  label="مشخصات فنی"
                  items={productFormData.specifications || []}
                  handlers={productSpecificationsHandlers}
                  placeholder="مشخصات جدید"
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
                  <label>تصویر خبر:</label>
                  <div className="file-input-group">
                    <input
                      type="file"
                      id="newsImageUpload"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleNewsFileChange}
                    />
                    <label htmlFor="newsImageUpload">انتخاب عکس</label>
                    {newsFormData.image && (
                      <div className="image-preview-container">
                        <span className="file-name">{newsFormData.image.split("/").pop()}</span>
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => setNewsFormData(prev => ({...prev, image: ""}))}
                        >
                          حذف عکس
                        </button>
                        <img src={newsFormData.image} alt="News Preview" className="file-preview" />
                      </div>
                    )}
                  </div>
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

