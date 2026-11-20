import {
    getCategories,
    getProducts,
    getUniqueProduct,
} from "../api/apiClient";

export async function fetchCategories() {
    const response = await getCategories();
    return response.data.data;
}

export async function fetchFeaturedProducts() {
    const response = await getProducts();
    return response.data.data;
}

export async function fetchAllProducts() {
    const products = [];
    let page = 1;
    let lastPage = 1;

    do {
        const response = await getProducts({ per_page: 50, page });
        const result = response.data;

        products.push(...(Array.isArray(result.data) ? result.data : []));
        lastPage = Number(result.meta?.last_page || result.last_page || 1);
        page += 1;
    } while (page <= lastPage);

    return products;
}

export async function fetchProductById(id) {
    const response = await getUniqueProduct(id);
    const product = response.data?.data ?? response.data;

    if (!product || !product.id) {
        throw new Error("No se encontraron los datos del producto.");
    }

    return product;
}
