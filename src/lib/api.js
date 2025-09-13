// مسیر: src/lib/api.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

async function handleResponse(response) {
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API Error: ${response.status} - ${response.statusText} - ${errorBody}`);
  }
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  }
  return {};
}

function getUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export const api = {
  // --- Product Operations ---
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(getUrl(`/products?${query}`)).then(handleResponse);
  },
  getProduct: (id, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(getUrl(`/products/${id}?${query}`)).then(handleResponse);
  },
  createProduct: (productData) => fetch(getUrl('/products'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productData) }).then(handleResponse),
  updateProduct: (id, productData) => fetch(getUrl(`/products/${id}`), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productData) }).then(handleResponse),
  deleteProduct: (id) => fetch(getUrl(`/products/${id}`), { method: 'DELETE' }).then(handleResponse),
  
  // --- Service Operations ---
  getServices: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(getUrl(`/services?${query}`)).then(handleResponse);
  },
  getService: (id, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(getUrl(`/services/${id}?${query}`)).then(handleResponse);
  },
  createService: (serviceData) => fetch(getUrl('/services'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(serviceData) }).then(handleResponse),
  updateService: (id, serviceData) => fetch(getUrl(`/services/${id}`), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(serviceData) }).then(handleResponse),
  deleteService: (id) => fetch(getUrl(`/services/${id}`), { method: 'DELETE' }).then(handleResponse),

  // --- News Operations ---
  getNews: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(getUrl(`/news?${query}`)).then(handleResponse);
  },
  getNewsItem: (id, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(getUrl(`/news/${id}?${query}`)).then(handleResponse);
  },
  createNews: (newsData) => fetch(getUrl('/news'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newsData) }).then(handleResponse),
  updateNews: (id, newsData) => fetch(getUrl(`/news/${id}`), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newsData) }).then(handleResponse),
  deleteNews: (id) => fetch(getUrl(`/news/${id}`), { method: 'DELETE' }).then(handleResponse),

  // --- Comment Operations ---
  submitComment: (productId, commentData) => fetch(getUrl('/comments'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, ...commentData }) }).then(handleResponse),
  
  // --- Cabin & Timeline Operations ---
  getCabins: () => fetch(getUrl('/cabins')).then(handleResponse),
  updateCabin: (id, cabinData) => fetch(getUrl(`/cabins/${id}`), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cabinData) }).then(handleResponse),
  
  getTimelineItems: () => fetch(getUrl('/timeline')).then(handleResponse),
  
  createTimelineItem: (itemData) => fetch(getUrl('/timeline'), { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(itemData) 
  }).then(handleResponse),
  
  // [FIX] اصلاح تابع به‌روزرسانی برای هماهنگی با بک‌اند
  updateTimelineItem: (id, itemData) => fetch(getUrl('/timeline'), { // به آدرس /timeline می‌فرستد
    method: 'PUT', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ id, ...itemData }) // id را هم در body می‌فرستد
  }).then(handleResponse),
  
  // [FIX] اصلاح تابع حذف برای هماهنگی با بک‌اند
  deleteTimelineItem: (id) => fetch(getUrl('/timeline'), { // ۱. به آدرس /api/timeline درخواست می‌فرستد
    method: 'DELETE', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ id }) // ۲. شناسه را در بدنه (body) درخواست قرار می‌دهد
  }).then(handleResponse),

  // --- File Upload ---
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(getUrl('/upload'), { method: 'POST', body: formData });
    return handleResponse(response);
  }
};