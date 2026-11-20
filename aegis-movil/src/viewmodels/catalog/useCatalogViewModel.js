import { useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "../../models/api/apiClient";
import {
    fetchAllProducts,
    fetchCategories,
    fetchProductById,
} from "../../models/catalog/catalogRepository";

function getCatalogErrorMessage(error, fallback) {
    return error.response?.data?.message || error.message || fallback;
}

export function useCategoriesViewModel() {
    const [categories, setCategories] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let isActive = true;

        const loadCategories = async () => {
            try {
                const data = await fetchCategories();
                if (isActive) {
                    setCategories(data);
                    setErrorMessage("");
                }
            } catch (error) {
                if (isActive) {
                    setErrorMessage(getApiErrorMessage(error));
                }
            }
        };

        loadCategories();

        return () => {
            isActive = false;
        };
    }, []);

    return { categories, errorMessage };
}

export function useFeaturedProductsViewModel() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let isActive = true;

        const loadProducts = async () => {
            try {
                const data = await fetchAllProducts();
                if (isActive) {
                    setProducts(data);
                    setErrorMessage("");
                }
            } catch (error) {
                if (isActive) {
                    setErrorMessage(getApiErrorMessage(error));
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        loadProducts();

        return () => {
            isActive = false;
        };
    }, []);

    return { products, errorMessage, isLoading };
}

export function useSearchCatalogViewModel(initialQuery = "") {
    const [products, setProducts] = useState([]);
    const [query, setQuery] = useState(initialQuery);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery]);

    useEffect(() => {
        let isActive = true;

        const loadProducts = async () => {
            setIsLoading(true);
            setErrorMessage("");

            try {
                const data = await fetchAllProducts();
                if (isActive) {
                    setProducts(data);
                }
            } catch (error) {
                if (isActive) {
                    setErrorMessage(
                        getCatalogErrorMessage(
                            error,
                            "No se pudieron cargar los productos."
                        )
                    );
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        loadProducts();

        return () => {
            isActive = false;
        };
    }, []);

    const filteredProducts = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase();
        if (!normalizedQuery) {
            return products;
        }

        return products.filter((product) =>
            [
                product.titulo,
                product.descripcion,
                product.categoria?.nombre,
                product.estado_producto,
                product.ciudad,
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value).toLocaleLowerCase().includes(normalizedQuery)
                )
        );
    }, [products, query]);

    return {
        errorMessage,
        filteredProducts,
        isLoading,
        query,
        setQuery,
    };
}

export function useProductDetailViewModel(productId) {
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let isActive = true;

        const loadProduct = async () => {
            setIsLoading(true);
            setErrorMessage("");

            try {
                const loadedProduct = await fetchProductById(productId);
                if (isActive) {
                    setProduct(loadedProduct);
                    setSelectedImage(0);
                }
            } catch (error) {
                if (isActive) {
                    setErrorMessage(
                        getCatalogErrorMessage(
                            error,
                            "No se pudo cargar el producto."
                        )
                    );
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        if (productId) {
            loadProduct();
        } else {
            setErrorMessage("No se indicó el producto que deseas consultar.");
            setIsLoading(false);
        }

        return () => {
            isActive = false;
        };
    }, [productId]);

    return {
        errorMessage,
        isLoading,
        product,
        selectedImage,
        setSelectedImage,
    };
}
