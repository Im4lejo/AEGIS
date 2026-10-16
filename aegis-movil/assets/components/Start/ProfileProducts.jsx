import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import products from "../../DATA/products";

export default function ProfileProducts() {
    const router = useRouter();

    return (
        <View style={styles.grid}>
            {products.map((product) => (
                <Pressable
                    key={product.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver producto ${product.name}`}
                    onPress={() => router.push(`/(tabs)/product/${product.id}`)}
                    style={styles.productCard}
                >
                    <Image
                        source={product.img}
                        style={styles.productImage}
                        resizeMode="contain"
                    />
                    <Text numberOfLines={2} style={styles.productName}>
                        {product.name}
                    </Text>
                    <Text style={styles.productPrice}>
                        $ {Number(product.price).toLocaleString("es-CO")}
                    </Text>
                    <Text numberOfLines={1} style={styles.productUsage}>
                        {product.usageTime}
                    </Text>
                </Pressable>
            ))}
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
    productUsage: {
        marginTop: 4,
        color: "#687386",
        fontSize: 11,
    },
});
