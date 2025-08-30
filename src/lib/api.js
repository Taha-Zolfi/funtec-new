// --- START OF FILE src/lib/api.js ---

async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
      details: 'Failed to parse error response'
    }));
    
    const errorMessage = error.details 
      ? `${error.message}\nDetails: ${error.details}`
      : error.message || 'Unknown error';
      
    throw new Error(`API Error: ${response.status} - ${errorMessage}`);
  }
  return response.json();
}

export const api = {
  // --- Product Operations ---
  getProducts: () => fetch('/api/products').then(handleResponse),
  getProduct: (id) => fetch(`/api/products?id=${id}`).then(handleResponse),
  createProduct: (productData) => fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productData) }).then(handleResponse),
  updateProduct: (id, productData) => fetch(`/api/products?id=${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productData) }).then(handleResponse),
  deleteProduct: (id) => fetch(`/api/products?id=${id}`, { method: 'DELETE' }).then(handleResponse),
  
  // --- Service Operations ---
  getServices: () => fetch('/api/services').then(handleResponse),
  getService: (id) => fetch(`/api/services?id=${id}`).then(handleResponse),
  createService: (serviceData) => fetch('/api/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(serviceData) }).then(handleResponse),
  updateService: (id, serviceData) => fetch(`/api/services?id=${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(serviceData) }).then(handleResponse),
  deleteService: (id) => fetch(`/api/services?id=${id}`, { method: 'DELETE' }).then(handleResponse),

  // --- Comment Operations ---
  submitComment: (productId, commentData) => fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, ...commentData }) }).then(handleResponse),

  // --- News Operations ---
  getNews: () => fetch('/api/news').then(handleResponse),
  getNewsItem: (id) => fetch(`/api/news?id=${id}`).then(handleResponse),
  createNews: (newsData) => fetch('/api/news', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newsData) }).then(handleResponse),
  updateNews: (id, newsData) => fetch(`/api/news?id=${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newsData) }).then(handleResponse),
  deleteNews: (id) => fetch(`/api/news?id=${id}`, { method: 'DELETE' }).then(handleResponse),

  // --- Cabin Operations ---
  getCabins: () => fetch('/api/cabins').then(handleResponse),
  updateCabin: (id, cabinData) => fetch('/api/cabins', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...cabinData }),
  }).then(handleResponse),

  // --- Timeline Operations ---
  getTimelineItems: () => fetch('/api/timeline').then(handleResponse),
  createTimelineItem: (itemData) => fetch('/api/timeline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData),
  }).then(handleResponse),
  updateTimelineItem: (id, itemData) => fetch('/api/timeline', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...itemData }),
  }).then(handleResponse),
  deleteTimelineItem: (id) => fetch('/api/timeline', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  }).then(handleResponse),

  // --- File Upload ---
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  }
};