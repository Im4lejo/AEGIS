import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getProducts } from "../../../services/api";
import { resolveProductImageUri } from "./productImage";

const fallbackImage = require("../../producto1.png");

async function getAllProducts() {
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

function ProductCard({ product, onPress }) {
    const imageUri = resolveProductImageUri(product.imagen_principal);

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ver producto ${product.titulo}`}
            onPress={onPress}
            style={({ pressed }) => [
                styles.productCard,
                pressed && styles.pressedCard,
            ]}
        >
            <View style={styles.productImageContainer}>
                <Image
                    source={imageUri ? { uri: imageUri } : fallbackImage}
                    style={styles.productImage}
                    resizeMode="contain"
                />
            </View>
            <Text numberOfLines={2} style={styles.productTitle}>
                {product.titulo || "Producto sin título"}
            </Text>
            <Text style={styles.productPrice}>
                {formatPrice(product.precio)}
            </Text>
            <View style={styles.productMeta}>
                <Text numberOfLines={1} style={styles.productCategory}>
                    {product.categoria?.nombre || product.estado_producto || ""}
                </Text>
                <Ionicons name="chevron-forward" size={15} color="#8993a3" />
            </View>
        </Pressable>
    );
}

function formatPrice(price) {
    const amount = Number(price);
    if (!Number.isFinite(amount)) {
        return "Precio no disponible";
    }

    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(amount);
}

export default function SearchCatalog({
    initialQuery = "",
    showBackButton = false,
}) {
    const router = useRouter();
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
                const allProducts = await getAllProducts();
                if (isActive) {
                    setProducts(allProducts);
                }
            } catch (error) {
                if (isActive) {
                    setErrorMessage(
                        error.response?.data?.message ||
                            error.message ||
                            "No se pudieron cargar los productos."
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

    const submitSearch = () => {
        const searchQuery = query.trim();
        if (!searchQuery) {
            return;
        }

        router.push({
            pathname: "/(tabs)/search-results",
            params: { q: searchQuery },
        });
    };

    return (
        <View style={styles.screen}>
            <View style={styles.navigationBar}>
                {showBackButton ? (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Volver a la búsqueda"
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={20} color="#ffffff" />
                    </Pressable>
                ) : null}
                <View style={styles.brand}>
                    <Text style={styles.brandName}>AEGIS</Text>
                </View>
                <View style={styles.searchBar}>
                    <TextInput
                        accessibilityLabel="Buscar productos"
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={submitSearch}
                        returnKeyType="search"
                        placeholder="Busca un producto..."
                        placeholderTextColor="#8b95a5"
                        style={styles.searchInput}
                    />
                    {query ? (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Limpiar búsqueda"
                            onPress={() => setQuery("")}
                            hitSlop={8}
                        >
                            <Ionicons
                                name="close-circle"
                                size={17}
                                color="#8792a3"
                            />
                        </Pressable>
                    ) : null}
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Buscar"
                        onPress={submitSearch}
                        hitSlop={8}
                    >
                        <Ionicons name="search" size={18} color="#34445d" />
                    </Pressable>
                </View>
            </View>

            <View style={styles.headingRow}>
                <View>
                    <Text style={styles.heading}>
                        {showBackButton ? "Resultados de búsqueda" : "Explorar productos"}
                    </Text>
                    <Text style={styles.subheading}>
                        {isLoading
                            ? "Cargando catálogo..."
                            : `${filteredProducts.length} productos`}
                    </Text>
                </View>
                {showBackButton && query.trim() ? (
                    <Pressable
                        accessibilityRole="button"
                        onPress={() => router.replace("/(tabs)/search")}
                        style={styles.clearSearchButton}
                    >
                        <Text style={styles.clearSearchText}>Ver todos</Text>
                    </Pressable>
                ) : null}
            </View>

            {isLoading ? (
                <View style={styles.stateContainer}>
                    <ActivityIndicator size="large" color="#317df8" />
                    <Text style={styles.stateText}>Cargando productos...</Text>
                </View>
            ) : errorMessage ? (
                <View style={styles.stateContainer}>
                    <Ionicons
                        name="alert-circle-outline"
                        size={30}
                        color="#bd3b3b"
                    />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
            ) : filteredProducts.length ? (
                <FlatList
                    data={filteredProducts}
                    keyExtractor={(item) => String(item.id)}
                    numColumns={2}
                    renderItem={({ item }) => (
                        <ProductCard
                            product={item}
                            onPress={() =>
                                router.push(`/(tabs)/product/${item.id}`)
                            }
                        />
                    )}
                    contentContainerStyle={styles.productList}
                    columnWrapperStyle={styles.productRow}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.stateContainer}>
                    <Ionicons
                        name="search-outline"
                        size={34}
                        color="#8792a3"
                    />
                    <Text style={styles.emptyTitle}>
                        {query.trim()
                            ? "No encontramos productos"
                            : "Todavía no hay productos"}
                    </Text>
                    <Text style={styles.stateText}>
                        {query.trim()
                            ? "Prueba con otro nombre, categoría o descripción."
                            : "Los productos disponibles aparecerán aquí."}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#f3f5f8",
    },
    navigationBar: {
        minHeight: 58,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 14,
        backgroundColor: "#0d30cc",
    },
    backButton: {
        width: 27,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
    },
    brand: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    brandName: {
        color: "#ffffff",
        fontSize: 13,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
    searchBar: {
        flex: 1,
        height: 36,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 11,
        borderRadius: 20,
        backgroundColor: "#ffffff",
    },
    searchInput: {
        flex: 1,
        color: "#26364d",
        fontSize: 12,
        paddingVertical: 0,
    },
    headingRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 10,
    },
    heading: {
        color: "#1d2a40",
        fontSize: 18,
        fontWeight: "800",
    },
    subheading: {
        marginTop: 3,
        color: "#808a99",
        fontSize: 11,
    },
    clearSearchButton: {
        paddingHorizontal: 11,
        paddingVertical: 7,
        borderRadius: 14,
        backgroundColor: "#e4eaff",
    },
    clearSearchText: {
        color: "#315df2",
        fontSize: 11,
        fontWeight: "700",
    },
    productList: {
        width: "100%",
        maxWidth: 760,
        alignSelf: "center",
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    productRow: {
        justifyContent: "space-between",
    },
    productCard: {
        width: "48.5%",
        marginBottom: 12,
        padding: 9,
        borderWidth: 1,
        borderColor: "#e2e6ed",
        borderRadius: 11,
        backgroundColor: "#ffffff",
        elevation: 1,
        shadowColor: "#26344a",
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    pressedCard: {
        opacity: 0.8,
    },
    productImageContainer: {
        height: 145,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
        borderRadius: 8,
        backgroundColor: "#f7f8fa",
    },
    productImage: {
        width: "100%",
        height: "100%",
    },
    productTitle: {
        minHeight: 36,
        color: "#253148",
        fontSize: 13,
        fontWeight: "700",
        lineHeight: 17,
    },
    productPrice: {
        marginTop: 6,
        color: "#1d2c46",
        fontSize: 14,
        fontWeight: "800",
    },
    productMeta: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 6,
    },
    productCategory: {
        flex: 1,
        color: "#858e9c",
        fontSize: 10,
        textTransform: "capitalize",
    },
    stateContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingHorizontal: 28,
        paddingBottom: 30,
    },
    stateText: {
        color: "#818b9a",
        fontSize: 12,
        textAlign: "center",
    },
    errorText: {
        color: "#a04444",
        fontSize: 13,
        textAlign: "center",
    },
    emptyTitle: {
        color: "#344159",
        fontSize: 15,
        fontWeight: "700",
        textAlign: "center",
    },
});
