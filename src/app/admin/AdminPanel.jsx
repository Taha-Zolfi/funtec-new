"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import RichTextEditor from "./components/RichTextEditor"
import "./AdminPanel.css" // Import the CSS file

// WARNING: Hardcoding passwords is a security risk. Use environment variables in production.
const ADMIN_PASSWORD = "LaserTech2024!"

// BUG FIX: Components are moved outside of the AdminPanel component.
// This prevents them from being recreated on every render, which was causing the focus loss issue.
const DynamicInputList = ({ label, items = [], handlers, placeholder }) => (
  <div className="form-group">
    <label>{label}:</label>
    {Array.isArray(items) && items.map((item) => (
      <div key={item.id} className="dynamic-input-group">
        <input
          type="text"
          value={item.value || ''}
          onChange={(e) => handlers?.handleChange(item.id, e.target.value)}
          placeholder={placeholder}
        />
        <button type="button" onClick={() => handlers?.handleRemove(item.id)} className="remove-button">
          &times;
        </button>
      </div>
    ))}
    <button type="button" onClick={handlers?.handleAdd} className="add-item-button">
      + افزودن {label}
    </button>
  </div>
);

const SimpleDynamicInputList = ({ label, items = [], handlers, placeholder }) => (
  <div className="form-group">
    <label>{label}:</label>
    {Array.isArray(items) && items.map((item, index) => (
      <div key={`image-${index}`} className="dynamic-input-group">
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
);


const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")

  const [products, setProducts] = useState([])
  const [news, setNews] = useState([])
  const [services, setServices] = useState([])
  const [stats, setStats] = useState({})
  const [cabins, setCabins] = useState([]);
  const [timelineItems, setTimelineItems] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedNews, setSelectedNews] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedTimelineItem, setSelectedTimelineItem] = useState(null);

  const [productFormData, setProductFormData] = useState({ name: "", short_description: "", full_description: "", background_video: "", features: [], images: [], specifications: [] })
  const [newsFormData, setNewsFormData] = useState({ title: "", excerpt: "", content: "", image: "", is_featured: false })
  const [serviceFormData, setServiceFormData] = useState({ title: "", description: "", mainImage: "" })
  const [timelineFormData, setTimelineFormData] = useState({ title: '', description: '', image_url: '', target_link: '', sort_order: 0 });

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cabinLoading, setCabinLoading] = useState({});

  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated")
    if (storedAuth === "true") setIsAuthenticated(true)
  }, [])

  useEffect(() => {
    if (isAuthenticated) loadData()
  }, [isAuthenticated])

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
  }

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedProducts, fetchedNews, fetchedServices, fetchedCabins, fetchedTimeline] = await Promise.all([
        api.getProducts(), api.getNews(), api.getServices(), api.getCabins(), api.getTimelineItems()
      ]);
      setProducts(fetchedProducts);
      setNews(fetchedNews);
      setServices(fetchedServices);
      setCabins(fetchedCabins);
      setTimelineItems(fetchedTimeline);
      setStats({
        totalProducts: fetchedProducts.length,
        totalNews: fetchedNews.length,
        totalServices: fetchedServices.length,
      });
    } catch (err) {
      setError(`خطا در بارگذاری اطلاعات: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Product Handlers ---
  const resetProductForm = () => setProductFormData({ name: "", short_description: "", full_description: "", background_video: "", features: [], images: [], specifications: [] });
  const handleAddProduct = () => { resetProductForm(); setSelectedProduct({}); };
  const handleCancelProductEdit = () => { setSelectedProduct(null); resetProductForm(); };
  const handleProductInputChange = (e) => setProductFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const createDynamicHandlers = (fieldName) => ({
      handleChange: (id, newValue) => setProductFormData(prev => ({ ...prev, [fieldName]: prev[fieldName].map(item => item.id === id ? { ...item, value: newValue } : item) })),
      handleAdd: () => setProductFormData(prev => ({ ...prev, [fieldName]: [...(prev[fieldName] || []), { id: Date.now() + Math.random(), value: "" }] })),
      handleRemove: (id) => setProductFormData(prev => ({ ...prev, [fieldName]: prev[fieldName].filter(item => item.id !== id) })),
  });
  const createSimpleDynamicHandlers = (fieldName) => ({
      handleChange: (index, value) => { const newItems = [...(productFormData[fieldName] || [])]; newItems[index] = value; setProductFormData(prev => ({ ...prev, [fieldName]: newItems })); },
      handleAdd: () => setProductFormData(prev => ({ ...prev, [fieldName]: [...(prev[fieldName] || []), ""] })),
      handleRemove: (index) => setProductFormData(prev => ({ ...prev, [fieldName]: (prev[fieldName] || []).filter((_, i) => i !== index) })),
  });
  const productFeaturesHandlers = createDynamicHandlers("features");
  const productSpecificationsHandlers = createDynamicHandlers("specifications");
  const productImagesHandlers = createSimpleDynamicHandlers("images");
  const handleProductFileChange = async (e, fieldName) => {
    const files = e.target.files; if (!files.length) return; setLoading(true);
    try {
      if (fieldName === "image_file") {
        const results = await Promise.all(Array.from(files).map(api.uploadFile));
        setProductFormData(prev => ({ ...prev, images: [...(prev.images || []), ...results.map(r => r.url)] }));
      } else if (fieldName === "video_file") {
        const result = await api.uploadFile(files[0]);
        setProductFormData(prev => ({ ...prev, background_video: result.url }));
      }
    } catch (err) { setError(`خطا در آپلود: ${err.message}`); } finally { setLoading(false); }
  };
  const handleEditProduct = async (product) => {
    setLoading(true);
    try {
      const freshProduct = await api.getProduct(product.id);
      setSelectedProduct(freshProduct);
      setProductFormData({
        name: freshProduct.name || "",
        short_description: freshProduct.short_description || "",
        full_description: freshProduct.full_description || "",
        background_video: freshProduct.background_video || "",
        images: Array.isArray(freshProduct.images) ? freshProduct.images : [],
        features: (freshProduct.features || []).map(value => ({ id: Date.now() + Math.random(), value })),
        specifications: (freshProduct.specifications || []).map(value => ({ id: Date.now() + Math.random(), value })),
      });
    } catch (err) { setError('خطا در بارگذاری محصول'); } finally { setLoading(false); }
  };
  const handleSubmitProduct = async (e) => {
    e.preventDefault(); setLoading(true);
    const cleanedData = { ...productFormData, features: productFormData.features?.map(item => item.value).filter(Boolean) || [], images: productFormData.images?.filter(Boolean) || [], specifications: productFormData.specifications?.map(item => item.value).filter(Boolean) || [] };
    try {
      if (selectedProduct?.id) await api.updateProduct(selectedProduct.id, cleanedData); else await api.createProduct(cleanedData);
      handleCancelProductEdit(); await loadData();
    } catch (err) { setError(`خطا در ذخیره محصول: ${err.message}`); } finally { setLoading(false); }
  };
  const handleDeleteProduct = async (id) => { if (window.confirm("آیا مطمئنید؟")) { setLoading(true); try { await api.deleteProduct(id); await loadData(); } catch (err) { setError(`خطا در حذف: ${err.message}`); } finally { setLoading(false); } } };

  // --- News Handlers ---
  const resetNewsForm = () => setNewsFormData({ title: "", excerpt: "", content: "", image: "", is_featured: false });
  const handleAddNews = () => { resetNewsForm(); setSelectedNews({}); };
  const handleCancelNewsEdit = () => { setSelectedNews(null); resetNewsForm(); };
  const handleEditNews = (newsItem) => {
    setSelectedNews(newsItem);
    setNewsFormData({ title: newsItem.title || "", excerpt: newsItem.excerpt || "", content: newsItem.content || "", image: newsItem.image || "", is_featured: Boolean(newsItem.is_featured) });
  };
  const handleNewsInputChange = (e) => { const { name, value, type, checked } = e.target; setNewsFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value })); };
  const handleNewsFileChange = async (e) => {
    const file = e.target.files[0]; if (!file) return; setLoading(true);
    try {
      const result = await api.uploadFile(file);
      setNewsFormData(prev => ({ ...prev, image: result.url }));
    } catch (err) { setError(`خطا در آپلود: ${err.message}`); } finally { setLoading(false); }
  };
  const handleSubmitNews = async (e) => {
    e.preventDefault(); setLoading(true);
    if (!newsFormData.title || !newsFormData.content) { setError("عنوان و محتوا الزامی است"); setLoading(false); return; }
    try {
      if (selectedNews?.id) await api.updateNews(selectedNews.id, newsFormData); else await api.createNews(newsFormData);
      handleCancelNewsEdit(); await loadData();
    } catch (err) { setError(`خطا در ذخیره خبر: ${err.message}`); } finally { setLoading(false); }
  };
  const handleDeleteNews = async (id) => { if (window.confirm("آیا مطمئنید؟")) { setLoading(true); try { await api.deleteNews(id); await loadData(); } catch (err) { setError(`خطا در حذف: ${err.message}`); } finally { setLoading(false); } } };

  // --- Service Handlers ---
  const resetServiceForm = () => setServiceFormData({ title: "", description: "", mainImage: "" });
  const handleAddService = () => { resetServiceForm(); setSelectedService({}); };
  const handleCancelServiceEdit = () => { setSelectedService(null); resetServiceForm(); };
  const handleEditService = (service) => { setSelectedService(service); setServiceFormData({ title: service.name, description: service.description, mainImage: Array.isArray(service.images) && service.images.length > 0 ? service.images[0] : "" }); };
  const handleServiceInputChange = (e) => { const { name, value } = e.target; setServiceFormData(prev => ({ ...prev, [name]: value })); };
  const handleServiceFileChange = async (e) => {
    const file = e.target.files[0]; if (!file) return; setLoading(true);
    try {
      const result = await api.uploadFile(file);
      setServiceFormData(prev => ({ ...prev, mainImage: result.url }));
    } catch (err) { setError(`خطا در آپلود: ${err.message}`); } finally { setLoading(false); }
  };
  const handleSubmitService = async (e) => {
    e.preventDefault(); setLoading(true);
    const serviceData = { name: serviceFormData.title, description: serviceFormData.description, images: serviceFormData.mainImage ? [serviceFormData.mainImage] : [] };
    try {
      if (selectedService?.id) await api.updateService(selectedService.id, serviceData); else await api.createService(serviceData);
      handleCancelServiceEdit(); await loadData();
    } catch (err) { setError(`خطا در ذخیره: ${err.message}`); } finally { setLoading(false); }
  };
  const handleDeleteService = async (id) => { if (window.confirm("آیا مطمئنید؟")) { setLoading(true); try { await api.deleteService(id); await loadData(); } catch (err) { setError(`خطا در حذف: ${err.message}`); } finally { setLoading(false); } } };

  // --- Cabin Handlers ---
  const handleCabinChange = (id, field, value) => setCabins(cabins.map(c => c.id === id ? { ...c, [field]: value } : c));
  const handleCabinImageUpload = async (id, file) => {
    if (!file) return; setCabinLoading(prev => ({ ...prev, [id]: true }));
    try {
      const result = await api.uploadFile(file);
      handleCabinChange(id, 'image_url', result.url);
    } catch (err) { setError(`خطا در آپلود: ${err.message}`); } finally { setCabinLoading(prev => ({ ...prev, [id]: false })); }
  };
  const handleSaveCabin = async (id) => {
    const cabinToSave = cabins.find(c => c.id === id); if (!cabinToSave) return; setCabinLoading(prev => ({ ...prev, [id]: true }));
    try {
      await api.updateCabin(id, { image_url: cabinToSave.image_url, target_link: cabinToSave.target_link });
      setCabinLoading(prev => ({ ...prev, [`success_${id}`]: true }));
      setTimeout(() => setCabinLoading(prev => ({ ...prev, [`success_${id}`]: false })), 2000);
    } catch (err) { setError(`خطا در ذخیره: ${err.message}`); } finally { setCabinLoading(prev => ({ ...prev, [id]: false })); }
  };

  // --- Timeline Handlers ---
  const resetTimelineForm = () => setTimelineFormData({ title: '', description: '', image_url: '', target_link: '', sort_order: 0 });
  const handleAddTimelineItem = () => { resetTimelineForm(); setSelectedTimelineItem({}); };
  const handleEditTimelineItem = (item) => { setSelectedTimelineItem(item); setTimelineFormData({ title: item.title || '', description: item.description || '', image_url: item.image_url || '', target_link: item.target_link || '', sort_order: item.sort_order || 0 }); };
  const handleCancelTimelineEdit = () => { setSelectedTimelineItem(null); resetTimelineForm(); };
  const handleDeleteTimelineItem = async (id) => { if (window.confirm("آیا مطمئنید؟")) { setLoading(true); try { await api.deleteTimelineItem(id); await loadData(); } catch (err) { setError(`خطا در حذف: ${err.message}`); } finally { setLoading(false); } } };
  const handleTimelineInputChange = (e) => { const { name, value } = e.target; setTimelineFormData(prev => ({ ...prev, [name]: value })); };
  const handleTimelineImageUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return; setLoading(true);
    try {
      const result = await api.uploadFile(file);
      setTimelineFormData(prev => ({ ...prev, image_url: result.url }));
    } catch (err) { setError(`خطا در آپلود: ${err.message}`); } finally { setLoading(false); }
  };
  const handleSubmitTimeline = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (selectedTimelineItem?.id) await api.updateTimelineItem(selectedTimelineItem.id, timelineFormData); else await api.createTimelineItem(timelineFormData);
      handleCancelTimelineEdit(); await loadData();
    } catch (err) { setError(`خطا در ذخیره: ${err.message}`); } finally { setLoading(false); }
  };
  
  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>ورود به پنل مدیریت</h2>
          <div className="form-group"><label htmlFor="password">رمز عبور:</label><input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          {error && <p className="error-alert">{error}</p>}
          <button type="submit" className="login-btn">ورود</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <header className="header"><h1>پنل مدیریت</h1><button onClick={handleLogout} className="logout-button">خروج</button></header>
      <nav className="sidebar">
        <ul>
          <li onClick={() => setActiveTab("dashboard")} className={activeTab === "dashboard" ? "active" : ""}>داشبورد</li>
          <li onClick={() => setActiveTab("products")} className={activeTab === "products" ? "active" : ""}>محصولات</li>
          <li onClick={() => setActiveTab("news")} className={activeTab === "news" ? "active" : ""}>اخبار</li>
          <li onClick={() => setActiveTab("services")} className={activeTab === "services" ? "active" : ""}>خدمات</li>
          <li onClick={() => setActiveTab("ferrisWheel")} className={activeTab === "ferrisWheel" ? "active" : ""}>چرخ و فلک</li>
          <li onClick={() => setActiveTab("timeline")} className={activeTab === "timeline" ? "active" : ""}>تایم‌لاین</li>
        </ul>
      </nav>
      <main className="main-content">
        {loading && <div className="loading-spinner"></div>}
        {error && <div className="error-alert">{error}</div>}
        {activeTab === "dashboard" && (<div><h2>داشبورد</h2><div className="stats-cards"><div className="card"><h3>محصولات</h3><p>{stats.totalProducts || 0}</p></div><div className="card"><h3>اخبار</h3><p>{stats.totalNews || 0}</p></div><div className="card"><h3>خدمات</h3><p>{stats.totalServices || 0}</p></div></div></div>)}
        {activeTab === "products" && (<div><h2>مدیریت محصولات</h2><button className="add-button" onClick={handleAddProduct}>افزودن محصول</button><ul className="item-list">{products.map(p => (<li key={p.id}><span>{p.name}</span><div className="item-actions"><button className="edit-btn" onClick={() => handleEditProduct(p)}>ویرایش</button><button className="delete-btn" onClick={() => handleDeleteProduct(p.id)}>حذف</button></div></li>))}</ul></div>)}
        {activeTab === "news" && (<div><h2>مدیریت اخبار</h2><button className="add-button" onClick={handleAddNews}>افزودن خبر</button><ul className="item-list">{news.map(n => (<li key={n.id}><span>{n.title}</span><div className="item-actions"><button className="edit-btn" onClick={() => handleEditNews(n)}>ویرایش</button><button className="delete-btn" onClick={() => handleDeleteNews(n.id)}>حذف</button></div></li>))}</ul></div>)}
        {activeTab === "services" && (<div><h2>مدیریت خدمات</h2><button className="add-button" onClick={handleAddService}>افزودن خدمت</button><ul className="item-list">{services.map(s => (<li key={s.id}><span>{s.name}</span><div className="item-actions"><button className="edit-btn" onClick={() => handleEditService(s)}>ویرایش</button><button className="delete-btn" onClick={() => handleDeleteService(s.id)}>حذف</button></div></li>))}</ul></div>)}
        {activeTab === "ferrisWheel" && (<div><h2>مدیریت کابین‌ها</h2><div className="cabin-editor-grid">{cabins.sort((a,b)=>a.cabin_number-b.cabin_number).map(c=>(<div key={c.id} className="cabin-editor-card"><h3>کابین {c.cabin_number}</h3><div className="cabin-preview"><img src={c.image_url||'/placeholder.webp'} alt="Preview"/></div><div className="cabin-inputs"><div className="form-group"><label>لینک:</label><input type="text" value={c.target_link} onChange={(e)=>handleCabinChange(c.id,'target_link',e.target.value)}/></div><div className="form-group"><label>عکس:</label><input type="file" onChange={(e)=>handleCabinImageUpload(c.id,e.target.files[0])}/></div><button className="save-cabin-btn" onClick={()=>handleSaveCabin(c.id)} disabled={cabinLoading[c.id]}>{cabinLoading[c.id]?'...':(cabinLoading[`success_${c.id}`]?'✓':'ذخیره')}</button></div></div>))}</div></div>)}
        {activeTab === "timeline" && (<div><h2>مدیریت تایم‌لاین</h2><button className="add-button" onClick={handleAddTimelineItem}>افزودن آیتم</button><ul className="item-list">{timelineItems.map(item=>(<li key={item.id}><span>{item.sort_order} - {item.title}</span><div className="item-actions"><button className="edit-btn" onClick={()=>handleEditTimelineItem(item)}>ویرایش</button><button className="delete-btn" onClick={()=>handleDeleteTimelineItem(item.id)}>حذف</button></div></li>))}</ul></div>)}
      </main>

      {/* MODALS */}
      {selectedProduct && (<div className="modal-overlay"><div className="modal-content"><div className="modal-header"><h3>{selectedProduct.id ? "ویرایش محصول" : "افزودن"}</h3><button onClick={handleCancelProductEdit}>&times;</button></div><form onSubmit={handleSubmitProduct}>{/* Product form fields */}</form></div></div>)}
      {selectedNews && (<div className="modal-overlay"><div className="modal-content"><div className="modal-header"><h3>{selectedNews.id ? "ویرایش خبر" : "افزودن"}</h3><button onClick={handleCancelNewsEdit}>&times;</button></div><form onSubmit={handleSubmitNews}>{/* News form fields */}</form></div></div>)}
      {selectedService && (<div className="modal-overlay"><div className="modal-content"><div className="modal-header"><h3>{selectedService.id ? "ویرایش خدمت" : "افزودن"}</h3><button onClick={handleCancelServiceEdit}>&times;</button></div><form onSubmit={handleSubmitService}>{/* Service form fields */}</form></div></div>)}
      
      {selectedTimelineItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{selectedTimelineItem.id ? "ویرایش آیتم تایم‌لاین" : "افزودن آیتم جدید"}</h3>
              <button className="close-modal-btn" onClick={handleCancelTimelineEdit}>&times;</button>
            </div>
            <form onSubmit={handleSubmitTimeline}>
              <div className="form-group"><label>عنوان:</label><input type="text" name="title" value={timelineFormData.title} onChange={handleTimelineInputChange} required /></div>
              <div className="form-group"><label>توضیحات:</label><textarea name="description" value={timelineFormData.description} onChange={handleTimelineInputChange}></textarea></div>
              <div className="form-group"><label>لینک مقصد:</label><input type="text" name="target_link" value={timelineFormData.target_link} onChange={handleTimelineInputChange} placeholder="/products/1" /></div>
              <div className="form-group"><label>ترتیب نمایش (عدد کوچکتر بالاتر):</label><input type="number" name="sort_order" value={timelineFormData.sort_order} onChange={handleTimelineInputChange} /></div>
              <div className="form-group">
                <label>عکس:</label>
                <label htmlFor="timelineImageUpload" className="file-upload-label">
                    <span>{timelineFormData.image_url ? "تغییر عکس" : "انتخاب عکس"}</span>
                    <small>برای آپلود کلیک کنید</small>
                </label>
                <input 
                  type="file" 
                  id="timelineImageUpload" 
                  onChange={handleTimelineImageUpload} 
                  accept="image/*" 
                  style={{ display: 'none' }}
                />
                {timelineFormData.image_url && (
                  <div className="previews-container">
                    <div className="preview-item">
                      <img src={timelineFormData.image_url} alt="Preview"/>
                      <button 
                        type="button" 
                        className="remove-preview-btn" 
                        onClick={() => setTimelineFormData(prev => ({...prev, image_url: ""}))}
                      >&times;</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCancelTimelineEdit}>لغو</button>
                <button type="submit" className="save-btn" disabled={loading}>ذخیره</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;