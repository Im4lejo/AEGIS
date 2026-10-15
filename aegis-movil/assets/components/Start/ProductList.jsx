import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, FlatList } from "react-native";
import { getProducts } from "../../../services/api";
import img from "../../producto1.png"
export default function Productos() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        uploadProducts();
    }, []);

        const uploadProducts = async () => {
            const res = await getProducts();
            setProducts(res.data.data) || [];
        };

    const renderCard = ({ item }) => (
        <View style={styles.productCard}>
            <Image
                source={img}
                style={{ width: 100, height: 100, alignSelf: "center", marginBottom: 15 }}
            />
            <Text style={styles.descripctionText}>{item.descripcion}</Text>
            <Text style={styles.priceText}>$ {item.precio}</Text>
            <Text style={styles.usageText}>{item.estado_producto}</Text>
        </View>
    );

    const styles = StyleSheet.create({
        container: {
            backgroundColor: "#f0f0f0",
        },
        productCard: {
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#ffffff",
            margin: 10,
            borderWidth: 1,
            borderColor: "#cfcfcf",
            borderRadius: 5,
            width: 150,
            height: 250,
            padding: 7,
        },
        titleText: {
            margin: 15,
            fontSize: 28,
            borderStyle: "solid",
            borderBottomColor: "#1c19cf",
            borderBottomWidth: 4,
            width: "65%"
        },
        descripctionText: {
       
            fontWeight: "600",
        },
        priceText: {
            marginVertical:5,
            color: "#d12121",
        },
        usageText: {
            color: "#555555",
        },
    });

    return (
        <View style={styles.container}>
            <Text style={styles.titleText}>Productos Destacados</Text>
       
            <FlatList
                data={products.slice(0, 10)}
                renderItem={renderCard}
                keyExtractor={(item) => item.id}
                horizontal
            />
        </View>
    );
}