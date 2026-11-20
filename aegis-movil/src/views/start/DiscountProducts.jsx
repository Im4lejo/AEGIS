import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { resolveProductImageUri } from "../../models/catalog/productImage";
import { useFeaturedProductsViewModel } from "../../viewmodels/catalog/useCatalogViewModel";

const fallbackImage = require("../../../assets/producto1.png");

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

export default function DiscountProducts() {
    const router = useRouter();
    const { products, errorMessage, isLoading } =
        useFeaturedProductsViewModel();

    const renderProduct = ({ item }) => {
        const imageUri = resolveProductImageUri(
            item.imagen_principal || item.imagenes?.[0]?.imagen
        );

        return (
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Ver producto ${item.titulo || "sin título"}`}
                onPress={() =>
                    router.push({
                        pathname: "/product/[id]",
                        params: { id: String(item.id) },
                    })
                }
                style={({ pressed }) => [
                    styles.productCard,
                    pressed && styles.pressedCard,
                ]}
            >
                <View style={styles.imageContainer}>
                    <Image
                        source={imageUri ? { uri: imageUri } : fallbackImage}
                        style={styles.productImage}
                        resizeMode="contain"
                    />
                    <View style={styles.stateBadge}>
                        <Text style={styles.stateText}>
                            {item.estado_producto || "Disponible"}
                        </Text>
                    </View>
                </View>
                <Text numberOfLines={2} style={styles.productTitle}>
                    {item.titulo || "Producto sin título"}
                </Text>
                <Text style={styles.priceText}>{formatPrice(item.precio)}</Text>
                <Text numberOfLines={1} style={styles.categoryText}>
                    {item.categoria?.nombre || "Categoría"}
                </Text>
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.heading}>
                <View>
                    <Text style={styles.title}>Productos en descuento</Text>
                    <Text style={styles.subtitle}>
                        Publicaciones activas de la base de datos
                    </Text>
                </View>
                <Ionicons name="pricetag-outline" size={21} color="#6547E8" />
            </View>

            {errorMessage ? (
                <Text accessibilityRole="alert" style={styles.error}>
                    {errorMessage}
                </Text>
            ) : null}
            {isLoading ? (
                <View style={styles.emptyState}>
                    <ActivityIndicator color="#6547E8" />
                    <Text style={styles.emptyText}>Cargando productos...</Text>
                </View>
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderProduct}
                    keyExtractor={(item) => String(item.id)}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.productList}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    ListEmptyComponent={
                        !errorMessage ? (
                            <Text style={styles.emptyText}>
                                No hay productos publicados todavía.
                            </Text>
                        ) : null
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 22,
        paddingBottom: 8,
    },
    heading: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 18,
        marginBottom: 14,
    },
    title: {
        color: "#18233A",
        fontSize: 19,
        fontWeight: "800",
    },
    subtitle: {
        marginTop: 4,
        color: "#858DA0",
        fontSize: 12,
    },
    productList: {
        paddingHorizontal: 18,
        paddingBottom: 10,
    },
    separator: {
        width: 12,
    },
    productCard: {
        width: 164,
        padding: 10,
        borderWidth: 1,
        borderColor: "#E8EAF1",
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        elevation: 2,
        shadowColor: "#253148",
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
    },
    pressedCard: {
        opacity: 0.82,
    },
    imageContainer: {
        height: 132,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
        borderRadius: 11,
        backgroundColor: "#F6F7FA",
    },
    productImage: {
        width: "100%",
        height: "100%",
    },
    stateBadge: {
        position: "absolute",
        top: 8,
        left: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        backgroundColor: "#EAE6FF",
    },
    stateText: {
        color: "#5338CB",
        fontSize: 9,
        fontWeight: "700",
        textTransform: "capitalize",
    },
    productTitle: {
        minHeight: 36,
        color: "#263149",
        fontSize: 13,
        fontWeight: "700",
        lineHeight: 18,
    },
    priceText: {
        marginTop: 7,
        color: "#17243A",
        fontSize: 15,
        fontWeight: "800",
    },
    categoryText: {
        marginTop: 6,
        color: "#818A9A",
        fontSize: 10,
        textTransform: "capitalize",
    },
    error: {
        marginHorizontal: 18,
        marginBottom: 10,
        color: "#B42332",
        fontSize: 12,
    },
    emptyState: {
        minHeight: 150,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    emptyText: {
        paddingHorizontal: 18,
        paddingVertical: 12,
        color: "#858DA0",
        fontSize: 12,
        textAlign: "center",
    },
});
