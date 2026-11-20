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

export default function ProductList() {
    const router = useRouter();
    const { products, errorMessage, isLoading } =
        useFeaturedProductsViewModel();

    const renderCard = ({ item }) => {
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
                <View style={styles.cardFooter}>
                    <Text numberOfLines={1} style={styles.categoryText}>
                        {item.categoria?.nombre || "Categoría"}
                    </Text>
                    <Ionicons
                        name="arrow-forward-circle"
                        size={20}
                        color="#6547E8"
                    />
                </View>
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.sectionHeading}>
                <View>
                    <Text style={styles.title}>Productos disponibles</Text>
                    <Text style={styles.subtitle}>
                        {products.length
                            ? `${products.length} productos disponibles`
                            : "Encuentra algo para ti"}
                    </Text>
                </View>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Ver todos los productos"
                    onPress={() => router.navigate("/(tabs)/search")}
                    hitSlop={8}
                >
                    <Text style={styles.seeAll}>Ver todos</Text>
                </Pressable>
            </View>

            {errorMessage ? (
                <Text accessibilityRole="alert" style={styles.error}>
                    {errorMessage}
                </Text>
            ) : null}
            {isLoading ? (
                <View style={styles.loading}>
                    <ActivityIndicator color="#6547E8" />
                    <Text style={styles.emptyText}>Cargando productos...</Text>
                </View>
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderCard}
                    keyExtractor={(item) => String(item.id)}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.productList}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    ListEmptyComponent={
                        !errorMessage ? (
                            <Text style={styles.emptyText}>
                                Todavía no hay productos publicados.
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
    sectionHeading: {
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
    seeAll: {
        color: "#6547E8",
        fontSize: 12,
        fontWeight: "700",
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
    cardFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 8,
    },
    categoryText: {
        flex: 1,
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
    loading: {
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
