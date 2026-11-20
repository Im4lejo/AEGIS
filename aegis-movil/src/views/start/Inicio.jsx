import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import ProductList from "./ProductList";
import DiscountProducts from "./DiscountProducts";
import Categories from "./Categories";

export default function Inicio() {
    const router = useRouter();

    return (
        <View style={styles.screen}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                <View style={styles.header}>
                    <Text style={styles.brand}>AEGIS</Text>
                    <Text style={styles.heading}>Explora tu próximo hallazgo</Text>
                    <Text style={styles.subtitle}>
                        Tecnología y productos de segunda mano, en un solo lugar.
                    </Text>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Ir a buscar productos"
                        onPress={() => router.navigate("/(tabs)/search")}
                        style={({ pressed }) => [
                            styles.searchBar,
                            pressed && styles.searchBarPressed,
                        ]}
                    >
                        <Ionicons name="search" size={19} color="#6547E8" />
                        <Text style={styles.searchPlaceholder}>
                            Buscar productos...
                        </Text>
                        <Ionicons
                            name="arrow-forward"
                            size={18}
                            color="#8992A3"
                        />
                    </Pressable>
                </View>

                <Image
                    source={require("../../../assets/images/blackfriday.jpg")}
                    style={styles.banner}
                    resizeMode="cover"
                    accessibilityLabel="Promociones de AEGIS"
                />

                <Categories />
                <ProductList />
                <Image
                    source={require("../../../assets/images/celulares-banner.png")}
                    style={styles.secondaryBanner}
                    resizeMode="cover"
                    accessibilityLabel="Productos de tecnología móvil"
                />
                <DiscountProducts />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#F5F6FA",
    },
    content: {
        paddingBottom: 24,
    },
    header: {
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 16,
        backgroundColor: "#FFFFFF",
    },
    brand: {
        color: "#6547E8",
        fontSize: 12,
        fontWeight: "900",
        letterSpacing: 1.5,
    },
    heading: {
        marginTop: 9,
        color: "#18233A",
        fontSize: 23,
        fontWeight: "800",
    },
    subtitle: {
        marginTop: 5,
        color: "#7D8698",
        fontSize: 13,
        lineHeight: 19,
    },
    searchBar: {
        minHeight: 48,
        flexDirection: "row",
        alignItems: "center",
        gap: 11,
        marginTop: 17,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: "#E5E7EF",
        borderRadius: 14,
        backgroundColor: "#F8F8FB",
    },
    searchBarPressed: {
        opacity: 0.75,
    },
    searchPlaceholder: {
        flex: 1,
        color: "#9299A8",
        fontSize: 13,
    },
    banner: {
        width: "100%",
        height: 150,
        marginTop: 14,
        borderRadius: 14,
    },
    secondaryBanner: {
        width: "100%",
        height: 190,
        marginTop: 12,
    },
});
