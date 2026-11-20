import {
    ActivityIndicator,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import { resolveProductImageUri } from "../../models/catalog/productImage";

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

export default function ProfileProducts({
    products = [],
    isLoading = false,
    errorMessage = "",
}) {
    const router = useRouter();

    if (isLoading) {
        return (
            <View style={styles.state}>
                <ActivityIndicator color="#317df8" />
                <Text style={styles.stateText}>Cargando tus productos...</Text>
            </View>
        );
    }

    if (errorMessage) {
        return (
            <Text accessibilityRole="alert" style={styles.stateText}>
                {errorMessage}
            </Text>
        );
    }

    if (!products.length) {
        return (
            <Text style={styles.stateText}>
                Aún no has publicado productos.
            </Text>
        );
    }

    return (
        <View style={styles.grid}>
            {products.map((product) => {
                const imageUri = resolveProductImageUri(
                    product.imagen_principal || product.imagenes?.[0]?.imagen
                );

                return (
                    <Pressable
                        key={product.id}
                        accessibilityRole="button"
                        accessibilityLabel={`Ver producto ${product.titulo || "sin título"}`}
                        onPress={() =>
                            router.push({
                                pathname: "/product/[id]",
                                params: { id: String(product.id) },
                            })
                        }
                        style={styles.productCard}
                    >
                        <Image
                            source={imageUri ? { uri: imageUri } : fallbackImage}
                            style={styles.productImage}
                            resizeMode="contain"
                        />
                        <Text numberOfLines={2} style={styles.productName}>
                            {product.titulo || "Producto sin título"}
                        </Text>
                        <Text style={styles.productPrice}>
                            {formatPrice(product.precio)}
                        </Text>
                        <Text numberOfLines={1} style={styles.productState}>
                            {product.estado_producto || "Disponible"}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 18,
    },
    productCard: {
        width: "48%",
        minHeight: 220,
        marginBottom: 12,
        padding: 10,
        borderWidth: 1,
        borderColor: "#e0e2e7",
        borderRadius: 10,
        backgroundColor: "#ffffff",
    },
    productImage: {
        width: "100%",
        height: 130,
        marginBottom: 8,
    },
    productName: {
        minHeight: 36,
        color: "#273349",
        fontSize: 13,
        fontWeight: "600",
    },
    productPrice: {
        marginTop: 5,
        color: "#d12121",
        fontSize: 14,
        fontWeight: "700",
    },
    productState: {
        marginTop: 4,
        color: "#687386",
        fontSize: 11,
        textTransform: "capitalize",
    },
    state: {
        minHeight: 120,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    stateText: {
        padding: 16,
        color: "#667085",
        fontSize: 12,
        textAlign: "center",
    },
});
