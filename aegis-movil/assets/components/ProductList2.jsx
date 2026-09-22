import { View, Text, StyleSheet, Image, FlatList } from "react-native";
import products from "../DATA/products"
export default function Productos() {
    const renderCard = ({ item }) => (
        <View style={styles.productCard}>
            <Image
                source={item.img}
                style={{ width: 150, height: 150, alignSelf: "center", marginBottom: 15 }}
            />
            <Text >{item.description}</Text>
            <br />
            <Text >$ {item.price}</Text>
           
            <Text >{item.usageTime}</Text>
        </View>
    )
    const styles = StyleSheet.create({
        container: {
            display: "flex",
            backgroundColor: "#f0f0f0"
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
            margin: 10,
            fontSize: 24,
            fontWeight: "semibold"
        },
    });
    return (
        <View style={styles.container}>
            <Text style={styles.titleText}>Productos En descuento</Text>
            <FlatList
                data={products}
                renderItem={renderCard}
                keyExtractor={item => item.id}
                numColumns={2}
            />

        </View>
    )
}