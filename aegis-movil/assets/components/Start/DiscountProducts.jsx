import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
import products from "../../DATA/products";

export default function Productos() {
    const router = useRouter();

    const renderCard = (item) => (
        <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`Ver producto ${item.name}`}
            onPress={() => router.push(`/(tabs)/product/${item.id}`)}
            style={styles.productCard}
        >
            <Image
                source={item.img}
                style={{ width: 150, height: 150, alignSelf: "center", marginBottom: 15 }}
                resizeMode="contain"
            />
            <Text>{item.name}</Text>
            <Text>$ {item.price}</Text>
            <Text>{item.usageTime}</Text>
        </Pressable>
    );
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: "#f0f0f0"
        },
        productsGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
        },
        productCard: {
            flexDirection: "column",
            backgroundColor: "#ffffff",
            margin: 10,
            borderWidth: 1,
            borderColor: "#cfcfcf",
            borderRadius: 5,
            width: 200,
            height: 300,
            padding: 5
        },
        titleText: {
            margin: 15,
            fontSize: 28,
            borderStyle: "solid",
            borderBottomColor: "#1986cf",
            borderBottomWidth: 4,
            width: "70%"
        },
    });
    return (
        <View style={styles.container}>
            <Text style={styles.titleText}>Productos En descuento</Text>
            <View style={styles.productsGrid}>
                {products.map(renderCard)}
            </View>
        </View>
    )
}