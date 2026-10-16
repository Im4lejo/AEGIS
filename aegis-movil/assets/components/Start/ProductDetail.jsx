import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getUniqueProduct } from "../../../services/api";
import { resolveProductImageUri } from "./productImage";

const fallbackImages = [
    require("../../producto1.png"),
    require("../../producto2.png"),
    require("../../producto3.png"),
];

function formatPrice(price) {
    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice)) {
        return "Precio no disponible";
    }

    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(numericPrice);
}

function ProductImage({ image, fallback, style, resizeMode = "cover" }) {
    const imageUri = resolveProductImageUri(image);

    return (
        <Image
            source={imageUri ? { uri: imageUri } : fallback}
            style={style}
            resizeMode={resizeMode}
        />
    );
}

export default function ProductDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const productId = Array.isArray(id) ? id[0] : id;
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
                const response = await getUniqueProduct(productId);
                const loadedProduct = response.data?.data ?? response.data;

                if (!loadedProduct || !loadedProduct.id) {
                    throw new Error("No se encontraron los datos del producto.");
                }

                if (isActive) {
                    setProduct(loadedProduct);
                    setSelectedImage(0);
                }
            } catch (error) {
                if (isActive) {
                    setErrorMessage(
                        error.response?.data?.message ||
                            error.message ||
                            "No se pudo cargar el producto."
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

    const galleryImages =
        product?.imagenes?.length > 0
            ? product.imagenes.map((image) => image.imagen)
            : product?.imagen_principal
                ? [product.imagen_principal]
                : [];
    const activeImage =
        galleryImages[selectedImage] || product?.imagen_principal || null;
    const sellerName =
        product?.vendedor?.username ||
        [product?.vendedor?.nombre, product?.vendedor?.apellido]
            .filter(Boolean)
            .join(" ") ||
        "Vendedor";
    const sellerImage = resolveProductImageUri(product?.vendedor?.foto_perfil);
    const categoryName = product?.categoria?.nombre || "Productos";

    return (
        <View style={styles.screen}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.breadcrumbs}>
                    <Pressable
                        accessibilityRole="button"
                        onPress={() => router.replace("/(tabs)")}
                    >
                        <Text style={styles.breadcrumbLink}>Inicio</Text>
                    </Pressable>
                    <Text style={styles.breadcrumbSeparator}>/</Text>
                    <Text style={styles.breadcrumbText}>{categoryName}</Text>
                    {product ? (
                        <>
                            <Text style={styles.breadcrumbSeparator}>/</Text>
                            <Text
                                numberOfLines={1}
                                style={styles.breadcrumbCurrent}
                            >
                                {product.titulo}
                            </Text>
                        </>
                    ) : null}
                </View>

                {isLoading ? (
                    <View style={styles.stateContainer}>
                        <ActivityIndicator size="large" color="#317df8" />
                        <Text style={styles.stateText}>Cargando producto...</Text>
                    </View>
                ) : errorMessage ? (
                    <View style={styles.stateContainer}>
                        <Ionicons
                            name="alert-circle-outline"
                            size={32}
                            color="#c24141"
                        />
                        <Text style={styles.errorText}>{errorMessage}</Text>
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => router.back()}
                            style={styles.backButton}
                        >
                            <Text style={styles.backButtonText}>Volver</Text>
                        </Pressable>
                    </View>
                ) : (
                    <>
                        <View style={styles.summaryCard}>
                            <Text style={styles.productCode}>
                                Código de producto: {product.id}
                            </Text>
                            <Text style={styles.productTitle}>
                                {product.titulo}
                            </Text>
                            <Text style={styles.category}>{categoryName}</Text>

                            <View style={styles.sellerRow}>
                                {sellerImage ? (
                                    <Image
                                        source={{ uri: sellerImage }}
                                        style={styles.sellerAvatar}
                                    />
                                ) : (
                                    <View style={styles.sellerAvatarFallback}>
                                        <Ionicons
                                            name="person"
                                            size={20}
                                            color="#4e5968"
                                        />
                                    </View>
                                )}
                                <View style={styles.sellerDetails}>
                                    <Text style={styles.sellerName}>
                                        {sellerName}
                                    </Text>
                                    <View style={styles.sellerBadges}>
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={14}
                                            color="#3b72fc"
                                        />
                                        <Ionicons
                                            name="shield-checkmark"
                                            size={14}
                                            color="#7442e9"
                                        />
                                        {product.vendedor?.reputacion != null ? (
                                            <Text style={styles.sellerRating}>
                                                {product.vendedor.reputacion}
                                            </Text>
                                        ) : null}
                                    </View>
                                </View>
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel="Volver"
                                    onPress={() => router.back()}
                                    style={styles.sellerAction}
                                >
                                    <Ionicons
                                        name="arrow-forward"
                                        size={17}
                                        color="#17253c"
                                    />
                                </Pressable>
                            </View>
                        </View>

                        <View style={styles.galleryCard}>
                            <View style={styles.mainImageContainer}>
                                <ProductImage
                                    image={activeImage}
                                    fallback={fallbackImages[0]}
                                    style={styles.mainImage}
                                    resizeMode="contain"
                                />
                                <View style={styles.imageCounter}>
                                    <Text style={styles.imageCounterText}>
                                        {selectedImage + 1}/
                                        {galleryImages.length || 1}
                                    </Text>
                                </View>
                                {galleryImages.length > 1 ? (
                                    <>
                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityLabel="Imagen anterior"
                                            onPress={() =>
                                                setSelectedImage((current) =>
                                                    current === 0
                                                        ? galleryImages.length - 1
                                                        : current - 1
                                                )
                                            }
                                            style={[
                                                styles.galleryArrow,
                                                styles.previousArrow,
                                            ]}
                                        >
                                            <Ionicons
                                                name="chevron-back"
                                                size={21}
                                                color="#ffffff"
                                            />
                                        </Pressable>
                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityLabel="Imagen siguiente"
                                            onPress={() =>
                                                setSelectedImage((current) =>
                                                    (current + 1) %
                                                    galleryImages.length
                                                )
                                            }
                                            style={[
                                                styles.galleryArrow,
                                                styles.nextArrow,
                                            ]}
                                        >
                                            <Ionicons
                                                name="chevron-forward"
                                                size={21}
                                                color="#ffffff"
                                            />
                                        </Pressable>
                                    </>
                                ) : null}
                            </View>

                            {galleryImages.length > 1 ? (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.thumbnails}
                                >
                                    {galleryImages.map((image, index) => (
                                        <Pressable
                                            key={`${product.id}-image-${index}`}
                                            accessibilityRole="button"
                                            accessibilityLabel={`Ver imagen ${index + 1}`}
                                            onPress={() => setSelectedImage(index)}
                                            style={[
                                                styles.thumbnailFrame,
                                                selectedImage === index &&
                                                    styles.selectedThumbnail,
                                            ]}
                                        >
                                            <ProductImage
                                                image={image}
                                                fallback={fallbackImages[index % fallbackImages.length]}
                                                style={styles.thumbnail}
                                                resizeMode="contain"
                                            />
                                        </Pressable>
                                    ))}
                                </ScrollView>
                            ) : null}
                        </View>

                        <View style={styles.detailsCard}>
                            <Text style={styles.price}>
                                {formatPrice(product.precio)}
                            </Text>
                            <View style={styles.metadataRow}>
                                <Text style={styles.metadataLabel}>Estado</Text>
                                <Text style={styles.metadataValue}>
                                    {product.estado_producto || "No especificado"}
                                </Text>
                            </View>
                            {product.ciudad ? (
                                <View style={styles.metadataRow}>
                                    <Text style={styles.metadataLabel}>Ubicación</Text>
                                    <Text style={styles.metadataValue}>
                                        {product.ciudad}
                                    </Text>
                                </View>
                            ) : null}
                            {product.descripcion ? (
                                <>
                                    <Text style={styles.descriptionTitle}>
                                        Descripción
                                    </Text>
                                    <Text style={styles.description}>
                                        {product.descripcion}
                                    </Text>
                                </>
                            ) : null}
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#f2f3f5",
    },
    content: {
        width: "100%",
        maxWidth: 900,
        alignSelf: "center",
        padding: 12,
        paddingBottom: 28,
    },
    breadcrumbs: {
        minHeight: 24,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 8,
    },
    breadcrumbLink: {
        color: "#347bff",
        fontSize: 11,
    },
    breadcrumbSeparator: {
        color: "#9ba3af",
        fontSize: 11,
    },
    breadcrumbText: {
        color: "#647084",
        fontSize: 11,
    },
    breadcrumbCurrent: {
        flexShrink: 1,
        color: "#263449",
        fontSize: 11,
    },
    summaryCard: {
        marginBottom: 9,
        padding: 13,
        borderRadius: 11,
        backgroundColor: "#ffffff",
        elevation: 2,
        shadowColor: "#1c2a40",
        shadowOpacity: 0.06,
        shadowRadius: 6,
    },
    productCode: {
        marginBottom: 3,
        color: "#979eaa",
        fontSize: 10,
    },
    productTitle: {
        color: "#131c2c",
        fontSize: 19,
        fontWeight: "800",
        lineHeight: 23,
    },
    category: {
        marginTop: 3,
        color: "#687386",
        fontSize: 11,
    },
    sellerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        gap: 8,
    },
    sellerAvatar: {
        width: 34,
        height: 34,
        borderWidth: 1,
        borderColor: "#9ba3af",
        borderRadius: 18,
    },
    sellerAvatarFallback: {
        width: 34,
        height: 34,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#9ba3af",
        borderRadius: 18,
        backgroundColor: "#dfe2e7",
    },
    sellerDetails: {
        flex: 1,
        gap: 3,
    },
    sellerName: {
        color: "#18233a",
        fontSize: 11,
        fontWeight: "700",
    },
    sellerBadges: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    sellerRating: {
        color: "#5c6576",
        fontSize: 9,
    },
    sellerAction: {
        width: 29,
        height: 29,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#aab2bd",
        borderRadius: 16,
    },
    galleryCard: {
        marginBottom: 9,
        padding: 12,
        borderRadius: 11,
        backgroundColor: "#ffffff",
        elevation: 2,
        shadowColor: "#1c2a40",
        shadowOpacity: 0.06,
        shadowRadius: 6,
    },
    mainImageContainer: {
        height: 280,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
        backgroundColor: "#25282b",
    },
    mainImage: {
        width: "100%",
        height: "100%",
    },
    imageCounter: {
        position: "absolute",
        top: 8,
        right: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        backgroundColor: "#263de9",
    },
    imageCounterText: {
        color: "#ffffff",
        fontSize: 10,
        fontWeight: "700",
    },
    galleryArrow: {
        position: "absolute",
        top: "46%",
        width: 32,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20,
        backgroundColor: "rgba(12, 24, 42, 0.58)",
    },
    previousArrow: {
        left: 7,
    },
    nextArrow: {
        right: 7,
    },
    thumbnails: {
        justifyContent: "center",
        gap: 8,
        paddingTop: 12,
    },
    thumbnailFrame: {
        width: 66,
        height: 66,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#d7dbe2",
        borderRadius: 8,
        backgroundColor: "#ffffff",
    },
    selectedThumbnail: {
        borderWidth: 2,
        borderColor: "#315df2",
    },
    thumbnail: {
        width: "100%",
        height: "100%",
    },
    detailsCard: {
        padding: 15,
        borderRadius: 11,
        backgroundColor: "#ffffff",
    },
    price: {
        marginBottom: 10,
        color: "#17243b",
        fontSize: 23,
        fontWeight: "800",
    },
    metadataRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 9,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#e7e9ed",
    },
    metadataLabel: {
        color: "#7c8593",
        fontSize: 12,
    },
    metadataValue: {
        color: "#374257",
        fontSize: 12,
        fontWeight: "600",
        textTransform: "capitalize",
    },
    descriptionTitle: {
        marginTop: 14,
        marginBottom: 5,
        color: "#273349",
        fontSize: 14,
        fontWeight: "700",
    },
    description: {
        color: "#606b7b",
        fontSize: 13,
        lineHeight: 19,
    },
    stateContainer: {
        minHeight: 260,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 24,
        borderRadius: 11,
        backgroundColor: "#ffffff",
    },
    stateText: {
        color: "#6c7686",
        fontSize: 13,
    },
    errorText: {
        color: "#963d3d",
        fontSize: 13,
        textAlign: "center",
    },
    backButton: {
        marginTop: 4,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: "#315df2",
    },
    backButtonText: {
        color: "#ffffff",
        fontSize: 12,
        fontWeight: "700",
    },
});
