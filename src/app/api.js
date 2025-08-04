const BASE_URL = 'https://funtec.ir/api';

/**
 * A helper function to send requests and handle network errors.
 */
const fetchData = async (url, options = {}) => {
    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Server Error: ${response.status} - ${errorData.message || 'Unknown response'}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const text = await response.text();
            // Return an empty object if the response body is empty, otherwise parse it.
            return text ? JSON.parse(text) : {};
        }
        
        // Return a success message for non-JSON responses (like DELETE).
        return { message: "Operation was successful." };
    } catch (error) {
        console.error("api.js: Error in API communication:", error);
        throw error;
    }
};

export const db = {
    // --- Product Operations ---
    getProducts: async () => {
        try {
            const products = await fetchData(`${BASE_URL}/products.php`); //
            // The backend already processes the data, so we can map it directly.
            return products.map(p => ({
                ...p,
                features: Array.isArray(p.features) ? p.features : [], //
                images: Array.isArray(p.images) ? p.images : [], //
                reviews: Array.isArray(p.reviews) ? p.reviews : [] //
            }));
        } catch (error) {
            console.error("api.js: Error fetching products:", error);
            throw error;
        }
    },

    getProduct: async (id) => {
        try {
            const product = await fetchData(`${BASE_URL}/products.php?id=${id}`); //
            // The backend sends processed data, so we just ensure types are correct.
            return {
                ...product,
                features: Array.isArray(product.features) ? product.features : [], //
                images: Array.isArray(product.images) ? product.images : [], //
                reviews: Array.isArray(product.reviews) ? product.reviews : [] //
            };
        } catch (error) {
            console.error("api.js: Error fetching single product:", error);
            throw error;
        }
    },

    createProduct: (productData) => {
        // Prepare the payload by converting arrays to strings for the PHP backend.
        const payload = {
            ...productData,
            features: Array.isArray(productData.features) ? productData.features.join(',') : '', //
            images: Array.isArray(productData.images) ? productData.images.join(',') : '', //
            reviews: Array.isArray(productData.reviews) ? JSON.stringify(productData.reviews) : '[]' //
        };
        return fetchData(`${BASE_URL}/products.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    },

    updateProduct: (id, productData) => {
        const payload = {
            ...productData,
            features: Array.isArray(productData.features) ? productData.features.join(',') : '', //
            images: Array.isArray(productData.images) ? productData.images.join(',') : '', //
            reviews: Array.isArray(productData.reviews) ? JSON.stringify(productData.reviews) : '[]' //
        };
        return fetchData(`${BASE_URL}/products.php?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    },

    deleteProduct: (id) => fetchData(`${BASE_URL}/products.php?id=${id}`, {
        method: 'DELETE',
    }),

    addReview: (productId, reviewData) => fetchData(`${BASE_URL}/products.php?id=${productId}&action=add_review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review: reviewData }),
    }),
    
    // --- Service Operations ---
    getServices: async () => {
        try {
            // The PHP endpoint for services will return data already formatted with arrays.
            return await fetchData(`${BASE_URL}/services.php`);
        } catch (error) {
            console.error("api.js: Error fetching services:", error);
            throw error;
        }
    },

    getService: async (id) => {
        try {
            // The PHP endpoint for a single service will also return formatted data.
            return await fetchData(`${BASE_URL}/services.php?id=${id}`);
        } catch (error) {
            console.error("api.js: Error fetching single service:", error);
            throw error;
        }
    },

    createService: (serviceData) => {
        // Convert arrays to strings for the backend, as expected by the services.php file.
        const payload = {
            ...serviceData,
            features: Array.isArray(serviceData.features) ? serviceData.features.join(',') : '',
            benefits: Array.isArray(serviceData.benefits) ? serviceData.benefits.join(',') : '',
            images: Array.isArray(serviceData.images) ? serviceData.images.join(',') : '',
            reviews: Array.isArray(serviceData.reviews) ? JSON.stringify(serviceData.reviews) : '[]'
        };
        return fetchData(`${BASE_URL}/services.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    },

    updateService: (id, serviceData) => {
        const payload = {
            ...serviceData,
            features: Array.isArray(serviceData.features) ? serviceData.features.join(',') : '',
            benefits: Array.isArray(serviceData.benefits) ? serviceData.benefits.join(',') : '',
            images: Array.isArray(serviceData.images) ? serviceData.images.join(',') : '',
            reviews: Array.isArray(serviceData.reviews) ? JSON.stringify(serviceData.reviews) : '[]'
        };
        return fetchData(`${BASE_URL}/services.php?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    },

    deleteService: (id) => fetchData(`${BASE_URL}/services.php?id=${id}`, {
        method: 'DELETE',
    }),

    // --- News Operations ---
    getNews: async () => {
        try {
            const newsItems = await fetchData(`${BASE_URL}/news.php`); //
            // Normalize the data received from the API.
            return newsItems.map(item => ({
                ...item,
                is_featured: !!item.is_featured,
                views: Number(item.views || 0),
            }));
        } catch (error) {
            console.error("api.js: Error fetching news:", error);
            throw error;
        }
    },

    getNewsItem: async (id) => {
        const item = await fetchData(`${BASE_URL}/news.php?id=${id}`); //
        return {
            ...item,
            is_featured: !!item.is_featured,
            views: Number(item.views || 0),
        };
    },

    createNews: (newsData) => fetchData(`${BASE_URL}/news.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newsData),
    }),

    updateNews: (id, newsData) => fetchData(`${BASE_URL}/news.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newsData),
    }),

    deleteNews: (id) => fetchData(`${BASE_URL}/news.php?id=${id}`, {
        method: 'DELETE',
    }),

    // --- Other Operations ---
    getStats: () => fetchData(`${BASE_URL}/stats_read.php`),

    clearAllData: () => fetchData(`${BASE_URL}/clear_all_data.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true }),
    }),

    uploadFile: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch(`${BASE_URL}/upload.php`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(`Upload Error: ${response.status} - ${errorData.message || 'Unknown response'}`);
            }
            return await response.json();
        } catch (error) {
            console.error("api.js: Error uploading file:", error);
            throw error;
        }
    }
};
