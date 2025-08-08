//called by Home.jsx and Admin.jsx

export const fetchProductsFromApi = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/product/get_all`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${btoa(import.meta.env.VITE_API_KEY)}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error(`HTTP error ${response.status}`);

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
            return result.data.map(product => ({
                id: product.ProductID,
                title: product.ProductHeaderDescription,
                description: product.ProductDetailDescription,
                discontinued: product.ProductDiscontinued,
                imageBase64: product.ProductImage ? `data:image/jpeg;base64,${product.ProductImage}` : null,
                alt: product.ProductAlt
            }));
        } else {
            console.error("Unexpected response:", result);
            return [];
        }
    } catch (err) {
        console.error("Failed to load products:", err);
        return [];
    }
};
