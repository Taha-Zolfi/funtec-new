"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { api } from "@/lib/api"
import RichTextEditor from "./components/RichTextEditor"
import "./AdminPanel.css"
import { FiGrid, FiPackage, FiFileText, FiBriefcase, FiRotateCw, FiClock, FiLogOut, FiPlus, FiEdit, FiTrash2, FiUploadCloud, FiX, FiCheckCircle, FiLoader, FiZap } from "react-icons/fi";

// ====================================================================
// Custom Hook for Draft Management (Local Storage)
// ====================================================================
const useDraft = (keyPrefix, initialState) => {
    const DRAFT_KEY = `admin_draft_${keyPrefix}`;

    const saveDraft = useCallback((data) => {
        if (typeof window !== "undefined") {
            try {
                // Save with a small delay to avoid excessive writes to local storage
                setTimeout(() => localStorage.setItem(DRAFT_KEY, JSON.stringify(data)), 500);
            } catch (e) {
                console.warn(`Could not save draft for ${keyPrefix}.`, e);
            }
        }
    }, [DRAFT_KEY]);

    const restoreDraft = useCallback(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(DRAFT_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed && parsed.translations) {
                        return parsed;
                    }
                } catch (e) {
                    console.error(`Failed to parse stored draft for ${keyPrefix}.`, e);
                    localStorage.removeItem(DRAFT_KEY);
                }
            }
        }
        return initialState;
    }, [DRAFT_KEY, initialState]);

    const clearDraft = useCallback(() => {
        if (typeof window !== "undefined") {
            localStorage.removeItem(DRAFT_KEY);
        }
    }, [DRAFT_KEY]);

    return { saveDraft, restoreDraft, clearDraft };
};

// --- Helper Components & Initial Structures (Defined outside to prevent re-creation) ---
const AdvancedImageUploader = ({ label, images = [], onImagesChange, multiple = false, accept = "image/*" }) => {
    const [uploadingFiles, setUploadingFiles] = useState([]);
    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        const newUploads = files.map(file => ({ id: `${file.name}-${Date.now()}`, file, preview: URL.createObjectURL(file), status: 'uploading' }));
        setUploadingFiles(prev => [...prev, ...newUploads]);
        try {
            const uploadPromises = newUploads.map(upload => api.uploadFile(upload.file));
            const results = await Promise.all(uploadPromises);
            const successfulUrls = results.map(r => r.url);
            onImagesChange([...images, ...successfulUrls]);
            setUploadingFiles(prev => prev.map(uf => newUploads.find(nu => nu.id === uf.id) ? { ...uf, status: 'success' } : uf));
            setTimeout(() => { setUploadingFiles(prev => prev.filter(uf => uf.status !== 'success')); }, 2000);
        } catch (error) {
            console.error("Upload failed:", error);
            setUploadingFiles(prev => prev.map(uf => newUploads.find(nu => nu.id === uf.id) ? { ...uf, status: 'error' } : uf));
        }
    };
    const handleRemoveImage = (indexToRemove) => { onImagesChange(images.filter((_, index) => index !== indexToRemove)); };
    return (
        <div className="uploader-container">
            <label className="uploader-label">{label}</label>
            <div className="image-previews-container">
                {images.map((imgUrl, index) => (<div key={index} className="preview-item"><img src={imgUrl} alt="Preview" /><button type="button" className="remove-image-btn" onClick={() => handleRemoveImage(index)}><FiTrash2 /></button></div>))}
                {uploadingFiles.map(upload => (<div key={upload.id} className="preview-item"><img src={upload.preview} alt="Uploading preview" style={{ opacity: 0.5 }} /><div className="preview-overlay" style={{ opacity: 1, backdropFilter: 'blur(2px)' }}>{upload.status === 'uploading' && <FiLoader className="spinner" />}{upload.status === 'success' && <FiCheckCircle style={{ color: 'var(--color-success)'}} />}{upload.status === 'error' && <FiX style={{ color: 'var(--color-danger)'}} />}</div></div>))}
            </div>
            <label htmlFor={`file-upload-${label}`} className="file-dropzone"><FiUploadCloud className="dropzone-icon" /><span>فایل خود را بکشید و رها کنید یا برای انتخاب کلیک کنید</span></label>
            <input id={`file-upload-${label}`} type="file" onChange={handleFileChange} multiple={multiple} accept={accept} />
        </div>
    );
};
const DynamicInputList = ({ label, items = [], handlers, placeholder }) => (
    <div className="form-group">
      <label>{label}:</label>
      {Array.isArray(items) && items.map((item) => (
        <div key={item.id} className="dynamic-input-group" style={{display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px'}}>
          <input type="text" value={item.value || ''} onChange={(e) => handlers?.handleChange(item.id, e.target.value)} placeholder={placeholder} />
          <button type="button" onClick={() => handlers?.handleRemove(item.id)} className="remove-button" style={{background: 'var(--color-danger)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display:'flex', justifyContent:'center', alignItems:'center'}}><FiTrash2 /></button>
        </div>
      ))}
      <button type="button" onClick={handlers?.handleAdd} className="add-item-button" style={{background: 'var(--background-tertiary)', border: 'none', color: 'white', borderRadius: 'var(--border-radius-md)', padding: '8px 16px', cursor: 'pointer', display:'flex', gap: '8px', alignItems:'center'}}><FiPlus /> افزودن</button>
    </div>
);

const AllowedPhonesManager = ({ phones = [], setPhones, setError, setLoading, loadData }) => {
  const [newPhone, setNewPhone] = useState('');
  const addPhone = async () => {
    if (!newPhone) return;
    setLoading(true);
    try {
      await fetch('/api/admin/allowed-phones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: newPhone }) });
      setNewPhone('');
      await loadData();
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  const removePhone = async (id) => {
    if (!confirm('آیا از حذف این شماره اطمینان دارید؟')) return;
    setLoading(true);
    try {
      await fetch('/api/admin/allowed-phones', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      await loadData();
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  return (
    <div>
      <div className="form-group"><label>افزودن شماره</label><div style={{display:'flex',gap:8}}><input type="text" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="مثال: 09121234567" /><button type="button" onClick={addPhone} className="add-button">افزودن</button></div></div>
      <div className="item-list-container"><div className="item-list-header"><span>شماره</span><span className="actions-header">عملیات</span></div>
        <ul className="item-list">{Array.isArray(phones) && phones.length ? phones.map(p => (<li key={p.id}><span>{p.phone}</span><div className="item-actions"><button className="delete-btn" onClick={() => removePhone(p.id)}><FiTrash2/></button></div></li>)) : <li className="empty">لیستی یافت نشد</li>}</ul>
      </div>
    </div>
  );
};
const getInitialProductForm = () => ({ background_video: "", images: [], translations: { fa: { name: "", short_description: "", full_description: "", features: [], specifications: [] }, en: { name: "", short_description: "", full_description: "", features: [], specifications: [] }, ar: { name: "", short_description: "", full_description: "", features: [], specifications: [] } } });
const getInitialNewsForm = () => ({ image: "", is_featured: false, translations: { fa: { title: "", excerpt: "", content: "" }, en: { title: "", excerpt: "", content: "" }, ar: { title: "", excerpt: "", content: "" } } });
const getInitialServiceForm = () => ({ images: [], translations: { fa: { name: "", description: "", features: [], benefits: [] }, en: { name: "", description: "", features: [], benefits: [] }, ar: { name: "", description: "", features: [], benefits: [] } } });

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [modalLocale, setModalLocale] = useState("fa");

  // Data states
  const [products, setProducts] = useState([]);
  const [news, setNews] = useState([]);
  const [services, setServices] = useState([]);
  const [cabins, setCabins] = useState([]);
  const [timelineItems, setTimelineItems] = useState([]);
  const [allowedPhones, setAllowedPhones] = useState([]);
  const [stats, setStats] = useState({});
  const [serviceRequests, setServiceRequests] = useState([]);

  // Modal & Form states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedTimelineItem, setSelectedTimelineItem] = useState(null);
  const [selectedServiceRequest, setSelectedServiceRequest] = useState(null);
  
  // [FIX] Memoize initial states to prevent re-creation on every render
  const initialProductState = useMemo(() => getInitialProductForm(), []);
  const initialNewsState = useMemo(() => getInitialNewsForm(), []);
  const initialServiceState = useMemo(() => getInitialServiceForm(), []);

  const productDraft = useDraft('product', initialProductState);
  const newsDraft = useDraft('news', initialNewsState);
  const serviceDraft = useDraft('service', initialServiceState);
  
  const [productFormData, setProductFormData] = useState(initialProductState);
  const [newsFormData, setNewsFormData] = useState(initialNewsState);
  const [serviceFormData, setServiceFormData] = useState(initialServiceState);
  const [timelineFormData, setTimelineFormData] = useState({ title: '', description: '', image_url: '', target_link: '', sort_order: 0 });

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cabinLoading, setCabinLoading] = useState({});

  // --- Effects & Auth ---
  useEffect(() => {
    const storedAuth = typeof window !== "undefined" ? localStorage.getItem("isAuthenticated") : null;
    if (storedAuth === "true") {
      setIsAuthenticated(true);
    } else {
      setLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, n, s, c, t, reqs] = await Promise.all([
  api.getProducts({ locale: 'fa' }),
  api.getNews({ locale: 'fa' }),
  fetch('/api/services?locale=fa&admin=1').then(r => r.json()),
        api.getCabins(),
        api.getTimelineItems(),
        fetch('/api/simple-service-requests').then(r => r.json())
      ]);
  // fetch allowed phones
  let phones = [];
  try {
    const rawPhones = await fetch('/api/admin/allowed-phones').then(r => r.json());
    phones = Array.isArray(rawPhones) ? rawPhones : [];
  } catch(e) { phones = []; }
      setProducts(p);
      setNews(n);
      setServices(s);
      setCabins(c);
      setTimelineItems(t);
      setServiceRequests(Array.isArray(reqs) ? reqs : []);
  setAllowedPhones(phones);
      setStats({ totalProducts: p.length, totalNews: n.length, totalServices: s.length, totalRequests: (Array.isArray(reqs) ? reqs.length : 0) });
    } catch (err) {
      setError(`خطا در بارگذاری اطلاعات: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array means this function is created only once

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  const handleLogin = (e) => { e.preventDefault(); if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) { setIsAuthenticated(true); localStorage.setItem("isAuthenticated", "true"); setError(null); } else { setError("رمز عبور اشتباه است."); } };
  const handleLogout = () => { setIsAuthenticated(false); localStorage.removeItem("isAuthenticated"); };

  // --- Save Draft on Form Change ---
  useEffect(() => { if (selectedProduct) productDraft.saveDraft(productFormData); }, [productFormData, selectedProduct, productDraft]);
  useEffect(() => { if (selectedNews) newsDraft.saveDraft(newsFormData); }, [newsFormData, selectedNews, newsDraft]);
  useEffect(() => { if (selectedService) serviceDraft.saveDraft(serviceFormData); }, [serviceFormData, selectedService, serviceDraft]);

  // --- Generic Handlers ---
  const createDynamicHandlers = useCallback((setFormData, fieldName, locale) => ({
    handleChange: (id, newValue) => setFormData(prev => ({ ...prev, translations: { ...prev.translations, [locale]: { ...prev.translations[locale], [fieldName]: prev.translations[locale][fieldName].map(item => item.id === id ? { ...item, value: newValue } : item) } } })),
    handleAdd: () => setFormData(prev => ({ ...prev, translations: { ...prev.translations, [locale]: { ...prev.translations[locale], [fieldName]: [...(prev.translations[locale][fieldName] || []), { id: Date.now() + Math.random(), value: "" }] } } })),
    handleRemove: (id) => setFormData(prev => ({ ...prev, translations: { ...prev.translations, [locale]: { ...prev.translations[locale], [fieldName]: prev.translations[locale][fieldName].filter(item => item.id !== id) } } })),
  }), []);

  // --- Product Handlers ---
  const resetProductForm = useCallback(() => { setProductFormData(initialProductState); setModalLocale('fa'); }, [initialProductState]);
  const handleAddProduct = useCallback(() => { setProductFormData(productDraft.restoreDraft()); setSelectedProduct({}); }, [productDraft]);
  const handleCancelProductEdit = useCallback(() => { setSelectedProduct(null); resetProductForm(); productDraft.clearDraft(); }, [resetProductForm, productDraft]);
  const handleEditProduct = useCallback(async (product) => {
    setLoading(true);
    try {
      const freshData = await api.getProduct(product.id);
      setSelectedProduct(freshData);
      const formattedData = getInitialProductForm();
      formattedData.images = freshData.images || [];
      formattedData.background_video = freshData.background_video || "";
      for (const lang of ['fa', 'en', 'ar']) {
          const translation = freshData.translations?.[lang];
          if (translation) {
              formattedData.translations[lang] = { ...translation, features: (translation.features || []).map(value => ({ id: Date.now() + Math.random(), value })), specifications: (translation.specifications || []).map(value => ({ id: Date.now() + Math.random(), value })) };
          }
      }
      setProductFormData(formattedData);
      setModalLocale('fa');
      productDraft.clearDraft();
    } catch (err) { setError('خطا در بارگذاری محصول'); } finally { setLoading(false); }
  }, [productDraft]);
  const handleSubmitProduct = useCallback(async (e) => {
    e.preventDefault(); setLoading(true);
    const dataToSend = JSON.parse(JSON.stringify(productFormData));
    for (const lang in dataToSend.translations) {
        dataToSend.translations[lang].features = dataToSend.translations[lang].features?.map(item => item.value).filter(Boolean) || [];
        dataToSend.translations[lang].specifications = dataToSend.translations[lang].specifications?.map(item => item.value).filter(Boolean) || [];
    }
    try {
      if (selectedProduct?.id) await api.updateProduct(selectedProduct.id, dataToSend); else await api.createProduct(dataToSend);
      productDraft.clearDraft();
      handleCancelProductEdit();
      await loadData();
    } catch (err) { setError(`خطا در ذخیره محصول: ${err.message}`); } finally { setLoading(false); }
  }, [productFormData, selectedProduct, productDraft, handleCancelProductEdit, loadData]);
  const handleDeleteProduct = useCallback(async (id) => { if (window.confirm("آیا برای حذف این محصول مطمئن هستید؟")) { setLoading(true); try { await api.deleteProduct(id); await loadData(); } catch (err) { setError(`خطا در حذف: ${err.message}`); } finally { setLoading(false); } } }, [loadData]);
  
  // --- News Handlers ---
  const resetNewsForm = useCallback(() => { setNewsFormData(initialNewsState); setModalLocale('fa'); }, [initialNewsState]);
  const handleAddNews = useCallback(() => { setNewsFormData(newsDraft.restoreDraft()); setSelectedNews({}); }, [newsDraft]);
  const handleCancelNewsEdit = useCallback(() => { setSelectedNews(null); resetNewsForm(); newsDraft.clearDraft(); }, [resetNewsForm, newsDraft]);
  const handleEditNews = useCallback(async (item) => {
    setLoading(true);
    try {
        const freshData = await api.getNewsItem(item.id);
        setSelectedNews(freshData);
        const formattedData = getInitialNewsForm();
        formattedData.image = freshData.image || "";
        formattedData.is_featured = freshData.is_featured || false;
        formattedData.translations = { ...formattedData.translations, ...(freshData.translations || {}) };
        setNewsFormData(formattedData);
        setModalLocale('fa');
        newsDraft.clearDraft();
    } catch (err) { setError('خطا در بارگذاری خبر'); } finally { setLoading(false); }
  }, [newsDraft]);
  const handleSubmitNews = useCallback(async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (selectedNews?.id) await api.updateNews(selectedNews.id, newsFormData); else await api.createNews(newsFormData);
      newsDraft.clearDraft();
      handleCancelNewsEdit();
      await loadData();
    } catch (err) { setError(`خطا در ذخیره خبر: ${err.message}`); } finally { setLoading(false); }
  }, [newsFormData, selectedNews, newsDraft, handleCancelNewsEdit, loadData]);
  const handleDeleteNews = useCallback(async (id) => { if (window.confirm("آیا برای حذف این خبر مطمئن هستید؟")) { setLoading(true); try { await api.deleteNews(id); await loadData(); } catch (err) { setError(`خطا در حذف: ${err.message}`); } finally { setLoading(false); } } }, [loadData]);

  // --- Service Handlers ---
  const resetServiceForm = useCallback(() => { setServiceFormData(initialServiceState); setModalLocale('fa'); }, [initialServiceState]);
  const handleAddService = useCallback(() => { setServiceFormData(serviceDraft.restoreDraft()); setSelectedService({}); }, [serviceDraft]);
  const handleCancelServiceEdit = useCallback(() => { setSelectedService(null); resetServiceForm(); serviceDraft.clearDraft(); }, [resetServiceForm, serviceDraft]);
  const handleEditService = useCallback(async (service) => {
    setLoading(true);
    try {
      const freshData = await api.getService(service.id);
      setSelectedService(freshData);
      const formattedData = getInitialServiceForm();
      formattedData.images = freshData.images || [];
      for (const lang of ['fa', 'en', 'ar']) {
          const translation = freshData.translations?.[lang];
          if (translation) {
              formattedData.translations[lang] = { ...translation, features: (translation.features || []).map(value => ({ id: Date.now() + Math.random(), value })), benefits: (translation.benefits || []).map(value => ({ id: Date.now() + Math.random(), value })) };
          }
      }
      setServiceFormData(formattedData);
      setModalLocale('fa');
      serviceDraft.clearDraft();
    } catch (err) { setError('خطا در بارگذاری خدمت'); } finally { setLoading(false); }
  }, [serviceDraft]);
  const handleSubmitService = useCallback(async (e) => {
    e.preventDefault(); setLoading(true);
    const dataToSend = JSON.parse(JSON.stringify(serviceFormData));
    for (const lang in dataToSend.translations) {
        dataToSend.translations[lang].features = dataToSend.translations[lang].features?.map(item => item.value).filter(Boolean) || [];
        dataToSend.translations[lang].benefits = dataToSend.translations[lang].benefits?.map(item => item.value).filter(Boolean) || [];
    }
    try {
      if (selectedService?.id) await api.updateService(selectedService.id, dataToSend); else await api.createService(dataToSend);
      serviceDraft.clearDraft();
      handleCancelServiceEdit();
      await loadData();
    } catch (err) { setError(`خطا در ذخیره: ${err.message}`); } finally { setLoading(false); }
  }, [serviceFormData, selectedService, serviceDraft, handleCancelServiceEdit, loadData]);
  const handleDeleteService = useCallback(async (id) => { if (window.confirm("آیا برای حذف این خدمت مطمئن هستید؟")) { setLoading(true); try { await api.deleteService(id); await loadData(); } catch (err) { setError(`خطا در حذف: ${err.message}`); } finally { setLoading(false); } } }, [loadData]);

  // --- Handlers for form input changes within the modal ---
  const handleProductFormChange = (field, value) => { setProductFormData(prev => ({...prev, translations: {...prev.translations, [modalLocale]: {...prev.translations[modalLocale], [field]: value}}})); };
  const handleNewsFormChange = (field, value) => { setNewsFormData(prev => ({...prev, translations: {...prev.translations, [modalLocale]: {...prev.translations[modalLocale], [field]: value}}})); };
  const handleServiceFormChange = (field, value) => { setServiceFormData(prev => ({...prev, translations: {...prev.translations, [modalLocale]: {...prev.translations[modalLocale], [field]: value}}})); };

  // --- Cabin & Timeline handlers ---
  const handleCabinChange = (id, field, value) => setCabins(cabins.map(c => c.id === id ? { ...c, [field]: value } : c));
  const handleCabinImageUpload = async (id, file) => { if (!file) return; setCabinLoading(prev => ({ ...prev, [id]: true })); try { const result = await api.uploadFile(file); handleCabinChange(id, 'image_url', result.url); } catch (err) { setError(`خطا در آپلود: ${err.message}`); } finally { setCabinLoading(prev => ({ ...prev, [id]: false })); } };
  const handleSaveCabin = async (id) => { const cabinToSave = cabins.find(c => c.id === id); if (!cabinToSave) return; setCabinLoading(prev => ({ ...prev, [id]: true })); try { await api.updateCabin(id, { image_url: cabinToSave.image_url, target_link: cabinToSave.target_link }); } catch (err) { setError(`خطا در ذخیره: ${err.message}`); } finally { setCabinLoading(prev => ({ ...prev, [id]: false })); } };
  const resetTimelineForm = () => setTimelineFormData({ title: '', description: '', image_url: '', target_link: '', sort_order: 0 });
  const handleAddTimelineItem = () => { resetTimelineForm(); setSelectedTimelineItem({}); };
  const handleEditTimelineItem = (item) => { setSelectedTimelineItem(item); setTimelineFormData(item); };
  const handleCancelTimelineEdit = () => { setSelectedTimelineItem(null); resetTimelineForm(); };
  const handleDeleteTimelineItem = async (id) => { if (window.confirm("آیا مطمئنید؟")) { setLoading(true); try { await api.deleteTimelineItem(id); await loadData(); } catch (err) { setError(`خطا در حذف: ${err.message}`); } finally { setLoading(false); } } };
  const handleSubmitTimeline = async (e) => { e.preventDefault(); setLoading(true); try { if (selectedTimelineItem?.id) await api.updateTimelineItem(selectedTimelineItem.id, timelineFormData); else await api.createTimelineItem(timelineFormData); handleCancelTimelineEdit(); await loadData(); } catch (err) { setError(`خطا در ذخیره: ${err.message}`); } finally { setLoading(false); } };

  if (!isAuthenticated) return (<div className="login-container"><form className="login-form" onSubmit={handleLogin}><div className="form-group"><label htmlFor="password">رمز عبور</label><input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>{error && <p className="error-alert">{error}</p>}<button type="submit" className="login-btn">ورود</button></form></div>);

  const ModalTabs = () => (
    <div className="modal-tabs">
        <button type="button" onClick={() => setModalLocale('fa')} className={modalLocale === 'fa' ? 'active' : ''}>فارسی</button>
        <button type="button" onClick={() => setModalLocale('en')} className={modalLocale === 'en' ? 'active' : ''}>English</button>
        <button type="button" onClick={() => setModalLocale('ar')} className={modalLocale === 'ar' ? 'active' : ''}>العربية</button>
    </div>
  );

  return (
    <div className="admin-panel">
        <header className="header"><h1>پنل مدیریت</h1><button onClick={handleLogout} className="logout-button"><FiLogOut /> خروج</button></header>
        <nav className="sidebar"><div className="sidebar-header"><FiZap /> LaserTech</div><ul>
            <li onClick={() => setActiveTab("dashboard")} className={activeTab === "dashboard" ? "active" : ""}><FiGrid /> داشبورد</li>
            <li onClick={() => setActiveTab("products")} className={activeTab === "products" ? "active" : ""}><FiPackage /> محصولات</li>
            <li onClick={() => setActiveTab("news")} className={activeTab === "news" ? "active" : ""}><FiFileText /> اخبار</li>
            <li onClick={() => setActiveTab("services")} className={activeTab === "services" ? "active" : ""}><FiBriefcase /> خدمات</li>
            <li onClick={() => setActiveTab("ferrisWheel")} className={activeTab === "ferrisWheel" ? "active" : ""}><FiRotateCw/> چرخ و فلک</li>
            <li onClick={() => setActiveTab("allowedPhones")} className={activeTab === "allowedPhones" ? "active" : ""}><FiPlus/> شماره‌های مجاز</li>
            <li onClick={() => setActiveTab("timeline")} className={activeTab === "timeline" ? "active" : ""}><FiClock /> تایم‌لاین</li>
            <li onClick={() => setActiveTab("requests")} className={activeTab === "requests" ? "active" : ""}><FiFileText /> درخواست‌ها</li>
        </ul></nav>
        <main className="main-content">{loading ? <div className="loading-spinner"></div> : <> {error && <div className="error-alert">{error}</div>}
            {activeTab === "dashboard" && <div>
              <h2>داشبورد</h2>
              <div className="stats-cards">
                <div className="card"><div className="card-header"><FiPackage className="icon" /><h3>محصولات</h3></div><p>{stats.totalProducts || 0}</p></div>
                <div className="card"><div className="card-header"><FiFileText className="icon" /><h3>اخبار</h3></div><p>{stats.totalNews || 0}</p></div>
                <div className="card"><div className="card-header"><FiBriefcase className="icon" /><h3>خدمات</h3></div><p>{stats.totalServices || 0}</p></div>
                <div className="card"><div className="card-header"><FiFileText className="icon" /><h3>درخواست‌ها</h3></div><p>{stats.totalRequests || 0}</p></div>
              </div>

              <div className="requests-panel" style={{marginTop:16}}>
                <div className="requests-header">
                  <h3>آخرین درخواست‌های خدمات</h3>
                  <div className="requests-tools">
                    <input placeholder="جستجو…" onChange={(e)=>{ const q=e.target.value.toLowerCase(); const base = (Array.isArray(serviceRequests)?serviceRequests:[]); const filtered = base.filter(x=> (x.service_name||'').toLowerCase().includes(q) || (x.message||'').toLowerCase().includes(q) || (x.requester_phone||'').toLowerCase().includes(q)); setServiceRequests(filtered.length || q ? filtered : base); }} />
                    <select onChange={(e)=>{ const val=e.target.value; const data=[...(serviceRequests||[])]; if(val==='latest'){ data.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)); } if(val==='oldest'){ data.sort((a,b)=>new Date(a.created_at)-new Date(b.created_at)); } if(val==='pending'){ data.sort((a,b)=>((a.status||'').localeCompare(b.status||''))); } setServiceRequests(data); }}>
                      <option value="latest">جدیدترین</option>
                      <option value="oldest">قدیمی‌ترین</option>
                      <option value="pending">مرتب‌سازی وضعیت</option>
                    </select>
                  </div>
                </div>
                <div className="requests-list">
                  {(serviceRequests || []).map(r => (
                    <div key={r.id} className="request-row">
                      <div className="request-main">
                        <div className="request-title">{r.service_name || 'خدمت'} <span className={`status-badge ${((r.status||'pending').toLowerCase()==='in_progress') ? 'status-in-progress' : ((r.status||'pending').toLowerCase()==='done') ? 'status-completed' : ((r.status||'pending').toLowerCase()==='cancelled' ? 'status-cancelled' : 'status-pending')}`}>{r.status || 'pending'}</span></div>
                        <div className="request-meta">
                          <span>{new Date(r.created_at).toLocaleString('fa-IR')}</span>
                          {r.requester_phone && <span> | {r.requester_phone}</span>}
                        </div>
                        <details className="request-details-box">
                          <summary>مشاهده پیام</summary>
                          <div className="request-message">{r.message}</div>
                        </details>
                      </div>
                      <div className="request-actions">
                        <button className="req-btn" title="علامت انجام شد" onClick={async ()=>{ await fetch('/api/simple-service-requests', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: r.id, status: 'done' }) }); await loadData(); }}>انجام شد</button>
                        <button className="req-btn secondary" title="در حال پیگیری" onClick={async ()=>{ await fetch('/api/simple-service-requests', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: r.id, status: 'in_progress' }) }); await loadData(); }}>در حال پیگیری</button>
                        <button className="req-btn danger" title="حذف" onClick={async ()=>{ if(!confirm('حذف این درخواست؟')) return; await fetch('/api/simple-service-requests', { method:'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: r.id }) }); await loadData(); }}>حذف</button>
                      </div>
                    </div>
                  ))}
                  {(!serviceRequests || serviceRequests.length === 0) && (
                    <div className="request-empty">درخواستی ثبت نشده است</div>
                  )}
                </div>
              </div>
            </div>}
            {activeTab === "products" && <div><div className="page-header"><h2>مدیریت محصولات</h2><button className="add-button" onClick={handleAddProduct}><FiPlus /> محصول جدید</button></div><div className="item-list-container"><div className="item-list-header"><span>نام محصول (فارسی)</span><span className="actions-header">عملیات</span></div><ul className="item-list">{products.map(p => (<li key={p.id}><span>{p.name}</span><div className="item-actions"><button className="edit-btn" onClick={() => handleEditProduct(p)}><FiEdit/></button><button className="delete-btn" onClick={() => handleDeleteProduct(p.id)}><FiTrash2/></button></div></li>))}</ul></div></div>}
            {activeTab === "news" && <div><div className="page-header"><h2>مدیریت اخبار</h2><button className="add-button" onClick={handleAddNews}><FiPlus /> خبر جدید</button></div><div className="item-list-container"><div className="item-list-header"><span>عنوان خبر (فارسی)</span><span className="actions-header">عملیات</span></div><ul className="item-list">{news.map(n => (<li key={n.id}><span>{n.title}</span><div className="item-actions"><button className="edit-btn" onClick={() => handleEditNews(n)}><FiEdit/></button><button className="delete-btn" onClick={() => handleDeleteNews(n.id)}><FiTrash2/></button></div></li>))}</ul></div></div>}
            {activeTab === "services" && <div><div className="page-header"><h2>مدیریت خدمات</h2><button className="add-button" onClick={handleAddService}><FiPlus /> خدمت جدید</button></div><div className="item-list-container"><div className="item-list-header"><span>عنوان خدمت (فارسی)</span><span className="actions-header">عملیات</span></div><ul className="item-list">{services.map(s => (<li key={s.id}><span>{s.name}</span><div className="item-actions"><button className="edit-btn" onClick={() => handleEditService(s)}><FiEdit/></button><button className="delete-btn" onClick={() => handleDeleteService(s.id)}><FiTrash2/></button></div></li>))}</ul></div></div>}
            {activeTab === "allowedPhones" && <div><div className="page-header"><h2>شماره‌های مجاز برای ورود</h2></div>
              <div className="allowed-phones-container">
                <AllowedPhonesManager phones={allowedPhones} setPhones={setAllowedPhones} setError={setError} setLoading={setLoading} loadData={loadData} />
              </div>
            </div>}
            {activeTab === "ferrisWheel" && <div><h2>مدیریت کابین‌های چرخ و فلک</h2><div className="cabin-editor-grid">{cabins.sort((a,b)=>a.cabin_number-b.cabin_number).map(c=>(<div key={c.id} className="cabin-editor-card"><h3>کابین {c.cabin_number}</h3><div className="cabin-preview"><img src={c.image_url||'/placeholder.webp'} alt="Preview"/></div><div className="cabin-inputs"><div className="form-group"><label>لینک مقصد</label><input type="text" value={c.target_link} onChange={(e)=>handleCabinChange(c.id,'target_link',e.target.value)}/></div><div className="form-group"><label>تصویر جدید</label><input type="file" accept="image/*" onChange={(e)=>handleCabinImageUpload(c.id,e.target.files[0])}/></div><button className="save-cabin-btn" onClick={()=>handleSaveCabin(c.id)} disabled={cabinLoading[c.id]}>{cabinLoading[c.id] ? 'در حال ذخیره...' : 'ذخیره تغییرات'}</button></div></div>))}</div></div>}
            {activeTab === "timeline" && <div><div className="page-header"><h2>مدیریت تایم‌لاین</h2><button className="add-button" onClick={handleAddTimelineItem}><FiPlus /> آیتم جدید</button></div><div className="item-list-container"><div className="item-list-header"><span>عنوان آیتم</span><span className="actions-header">عملیات</span></div><ul className="item-list">{timelineItems.sort((a,b) => a.sort_order - b.sort_order).map(item=>(<li key={item.id}><span>{item.sort_order} - {item.title}</span><div className="item-actions"><button className="edit-btn" onClick={()=>handleEditTimelineItem(item)}><FiEdit/></button><button className="delete-btn" onClick={()=>handleDeleteTimelineItem(item.id)}><FiTrash2/></button></div></li>))}</ul></div></div>}
            {activeTab === "requests" && <div>
              <div className="page-header"><h2>درخواست‌های خدمات</h2></div>
              <div className="requests-container" style={{display:'flex', gap: 20}}>
                <div style={{flex:'0 0 420px'}}>
                  <div className="item-list-container"><div className="item-list-header"><span>درخواست</span><span className="actions-header">وضعیت</span></div>
                    <ul className="item-list" style={{maxHeight: '60vh', overflowY: 'auto'}}>
                      {(serviceRequests||[]).map(r => (<li key={r.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', borderBottom:'1px solid rgba(255,255,255,0.04)', cursor:'pointer'}} onClick={() => setSelectedServiceRequest(r)}>
                        <div><strong>{r.service_name}</strong><div className="meta" style={{fontSize:12, opacity:0.8}}>{new Date(r.created_at).toLocaleString('fa-IR')}</div></div>
                        <div style={{minWidth:120, textAlign:'center'}}>{r.status}</div>
                      </li>))}
                      {(!serviceRequests || serviceRequests.length===0) && <li className="empty">درخواستی ثبت نشده است</li>}
                    </ul>
                  </div>
                </div>
                <div style={{flex:1}}>
                  <div className="panel">
                    {selectedServiceRequest ? (
                      <div style={{padding:16}}>
                        <h3>{selectedServiceRequest.service_name}</h3>
                        <p className="small-meta">ایجاد شده: {new Date(selectedServiceRequest.created_at).toLocaleString('fa-IR')}</p>
                        {selectedServiceRequest.requester_phone && <p><strong>شماره تماس:</strong> {selectedServiceRequest.requester_phone}</p>}
                        <p><strong>توضیحات:</strong></p>
                        <p style={{whiteSpace:'pre-wrap', background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8}}>{selectedServiceRequest.message}</p>
                        <div style={{marginTop:12}}>
                          <label>وضعیت</label>
                          <select value={selectedServiceRequest.status} onChange={async (e) => {
                            const newStatus = e.target.value;
                            try {
                              await fetch('/api/simple-service-requests', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedServiceRequest.id, status: newStatus, admin_notes: selectedServiceRequest.admin_notes || '' }) });
                              setSelectedServiceRequest(prev => ({ ...prev, status: newStatus }));
                              await loadData();
                            } catch (err) { setError('خطا در به‌روز رسانی وضعیت'); }
                          }}>
                            <option value="pending">در انتظار</option>
                            <option value="in_progress">در حال انجام</option>
                            <option value="not_done">انجام نشده</option>
                            <option value="done">انجام شده</option>
                          </select>
                        </div>

                        <div style={{marginTop:12}}>
                          <label>یادداشت ادمین</label>
                          <textarea value={selectedServiceRequest.admin_notes || ''} onChange={(e) => setSelectedServiceRequest(prev => ({ ...prev, admin_notes: e.target.value }))} rows={4} style={{width:'100%', marginTop:8}} />
                          <div style={{display:'flex', gap:8, marginTop:8}}>
                            <button className="save-btn" onClick={async () => {
                              try {
                                await fetch('/api/simple-service-requests', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedServiceRequest.id, admin_notes: selectedServiceRequest.admin_notes || '' }) });
                                await loadData();
                                setError(null);
                              } catch (err) { setError('خطا در ذخیره یادداشت'); }
                            }}>ذخیره یادداشت</button>
                            <button className="cancel-btn" onClick={() => setSelectedServiceRequest(null)}>بستن</button>
                          </div>
                        </div>
                      </div>
                    ) : (<div style={{padding:16}}>یک درخواست را انتخاب کنید تا جزئیات را ببینید.</div>)}
                  </div>
                </div>
              </div>
            </div>}
        </>}
        </main>

        {selectedProduct && <div className="modal-overlay"><div className="modal-content"><div className="modal-header"><h3>{selectedProduct.id ? "ویرایش محصول" : "افزودن محصول"}</h3><button onClick={handleCancelProductEdit} className="close-modal-btn"><FiX/></button></div><form onSubmit={handleSubmitProduct}><ModalTabs/>
        <div className="modal-body">
            <div className="translatable-content">
                <div className="form-group"><label>نام محصول</label><input type="text" value={productFormData.translations[modalLocale]?.name || ''} onChange={e => handleProductFormChange('name', e.target.value)} required={modalLocale === 'fa'} /></div>
                <div className="form-group"><label>توضیح کوتاه</label><textarea value={productFormData.translations[modalLocale]?.short_description || ''} onChange={e => handleProductFormChange('short_description', e.target.value)}></textarea></div>
                <div className="form-group"><label>توضیح کامل</label><RichTextEditor value={productFormData.translations[modalLocale]?.full_description || ''} onChange={content => handleProductFormChange('full_description', content)} /></div>
                <DynamicInputList label="ویژگی‌ها" items={productFormData.translations[modalLocale]?.features || []} handlers={createDynamicHandlers(setProductFormData, "features", modalLocale)} placeholder="ویژگی جدید" />
                <DynamicInputList label="مشخصات فنی" items={productFormData.translations[modalLocale]?.specifications || []} handlers={createDynamicHandlers(setProductFormData, "specifications", modalLocale)} placeholder="مشخصات جدید" />
            </div>
            <div className="non-translatable-content">
                <h4>تنظیمات کلی محصول</h4>
                <AdvancedImageUploader label="تصاویر گالری محصول" images={productFormData.images} onImagesChange={newImgs => setProductFormData(p => ({...p, images: newImgs}))} multiple={true} />
                <AdvancedImageUploader label="ویدئوی پس‌زمینه" images={productFormData.background_video ? [productFormData.background_video] : []} onImagesChange={newVids => setProductFormData(p => ({...p, background_video: newVids[0] || ''}))} accept="video/*" />
            </div>
        </div>
        <div className="form-actions"><button type="button" className="cancel-btn" onClick={handleCancelProductEdit}>لغو</button><button type="submit" className="save-btn" disabled={loading}>ذخیره همه زبان‌ها</button></div></form></div></div>}
        
        {selectedNews && <div className="modal-overlay"><div className="modal-content"><div className="modal-header"><h3>{selectedNews.id ? "ویرایش خبر" : "افزودن خبر"}</h3><button onClick={handleCancelNewsEdit} className="close-modal-btn"><FiX/></button></div><form onSubmit={handleSubmitNews}><ModalTabs/>
        <div className="modal-body">
            <div className="translatable-content">
                <div className="form-group"><label>عنوان</label><input type="text" value={newsFormData.translations[modalLocale]?.title || ''} onChange={e => handleNewsFormChange('title', e.target.value)} required={modalLocale === 'fa'} /></div>
                <div className="form-group"><label>خلاصه</label><textarea value={newsFormData.translations[modalLocale]?.excerpt || ''} onChange={e => handleNewsFormChange('excerpt', e.target.value)}></textarea></div>
                <div className="form-group"><label>محتوا</label><RichTextEditor value={newsFormData.translations[modalLocale]?.content || ''} onChange={content => handleNewsFormChange('content', content)}/></div>
            </div>
            <div className="non-translatable-content">
                <h4>تنظیمات کلی خبر</h4>
                <AdvancedImageUploader label="تصویر شاخص" images={newsFormData.image ? [newsFormData.image] : []} onImagesChange={newImgs => setNewsFormData(p => ({...p, image: newImgs[0] || ''}))} />
            </div>
        </div>
        <div className="form-actions"><button type="button" className="cancel-btn" onClick={handleCancelNewsEdit}>لغو</button><button type="submit" className="save-btn" disabled={loading}>ذخیره همه زبان‌ها</button></div></form></div></div>}
        
        {selectedService && <div className="modal-overlay"><div className="modal-content"><div className="modal-header"><h3>{selectedService.id ? "ویرایش خدمت" : "افزودن خدمت"}</h3><button onClick={handleCancelServiceEdit} className="close-modal-btn"><FiX/></button></div><form onSubmit={handleSubmitService}><ModalTabs/>
        <div className="modal-body">
             <div className="translatable-content">
                <div className="form-group"><label>عنوان خدمت</label><input type="text" value={serviceFormData.translations[modalLocale]?.name || ''} onChange={e => handleServiceFormChange('name', e.target.value)} required={modalLocale === 'fa'} /></div>
                <div className="form-group"><label>توضیحات</label><RichTextEditor value={serviceFormData.translations[modalLocale]?.description || ''} onChange={content => handleServiceFormChange('description', content)} /></div>
                <DynamicInputList label="ویژگی‌ها" items={serviceFormData.translations[modalLocale]?.features || []} handlers={createDynamicHandlers(setServiceFormData, "features", modalLocale)} placeholder="ویژگی جدید"/>
                <DynamicInputList label="مزایا" items={serviceFormData.translations[modalLocale]?.benefits || []} handlers={createDynamicHandlers(setServiceFormData, "benefits", modalLocale)} placeholder="مزیت جدید"/>
             </div>
             <div className="non-translatable-content">
                <h4>تنظیمات کلی خدمت</h4>
                <AdvancedImageUploader label="تصاویر" images={serviceFormData.images} onImagesChange={newImgs => setServiceFormData(p => ({...p, images: newImgs}))} multiple={true}/>
             </div>
        </div>
        <div className="form-actions"><button type="button" className="cancel-btn" onClick={handleCancelServiceEdit}>لغو</button><button type="submit" className="save-btn" disabled={loading}>ذخیره همه زبان‌ها</button></div></form></div></div>}
        
        {selectedTimelineItem && <div className="modal-overlay"><div className="modal-content"><div className="modal-header"><h3>{selectedTimelineItem.id ? "ویرایش آیتم" : "افزودن آیتم"}</h3><button onClick={handleCancelTimelineEdit} className="close-modal-btn"><FiX/></button></div><form onSubmit={handleSubmitTimeline}><div className="form-group"><label>عنوان</label><input type="text" value={timelineFormData.title} onChange={e => setTimelineFormData({...timelineFormData, title: e.target.value})} required /></div><div className="form-group"><label>توضیحات</label><textarea value={timelineFormData.description} onChange={e => setTimelineFormData({...timelineFormData, description: e.target.value})}></textarea></div><div className="form-group"><label>لینک مقصد</label><input type="text" value={timelineFormData.target_link} onChange={e => setTimelineFormData({...timelineFormData, target_link: e.target.value})} /></div><div className="form-group"><label>ترتیب نمایش</label><input type="number" value={timelineFormData.sort_order} onChange={e => setTimelineFormData({...timelineFormData, sort_order: e.target.value})} /></div>
        <AdvancedImageUploader label="تصویر آیتم" images={timelineFormData.image_url ? [timelineFormData.image_url] : []} onImagesChange={newImgs => setTimelineFormData(p => ({...p, image_url: newImgs[0] || ''}))} />
        <div className="form-actions"><button type="button" className="cancel-btn" onClick={handleCancelTimelineEdit}>لغو</button><button type="submit" className="save-btn" disabled={loading}>ذخیره</button></div></form></div></div>}
    </div>
);
};

export default AdminPanel;