//called by Home.jsx and Admin.jsx
const showLogs = import.meta.env.VITE_SHOW_CONSOLE_LOGS === 'true'

export const fetchProductsFromApi = async (showDiscontinued = false, signal) => {
    try {
        const Url = showDiscontinued
            ? `${import.meta.env.VITE_BASE_URL}/product/get_all`
            : `${import.meta.env.VITE_BASE_URL}/product/get_all_active_products`;

        const response = await fetch(Url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json'
            },
            ...(signal ? { signal } : {})
        });

        if (!response.ok) throw new Error(`HTTP error ${response.status}`);

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
            return result.data.map(product => ({
                id: product.ProductID,
                title: product.ProductHeaderDescription,
                description: product.ProductDetailDescription,
                discontinued: product.ProductDiscontinued,
                imageBase64: product.ProductImage
                    ? `data:image/jpeg;base64,${product.ProductImage}`
                    : null,
                alt: product.ProductAlt
            }));
        } else {
            if (showLogs) {
                console.error("Unexpected response:", result);
            }
            return [];
        }
    } catch (err) {
        if (err.name === 'AbortError') {              // request was cancelled
            return [];
        }
        if (showLogs) {
            console.error("Failed to load products:", err);
        }
        return [];
    }
};
