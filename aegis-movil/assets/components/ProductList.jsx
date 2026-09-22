import { View, Text, StyleSheet, Image, FlatList } from "react-native";
import products from "../DATA/products"
import { ScrollView } from "react-native-web";
export default function Productos() {
    const renderCard = ({ item }) => (
        <View style={styles.productCard}>
            <Image
                source={item.img}
                style={{ width: 100, height: 100, alignSelf: "center", marginBottom: 15 }}
            />
            <Text >{item.description}</Text>
            <Text >$ {item.price}</Text>
            <Text >$ {item.usageTime}</Text>
        </View>
    )
    const styles = StyleSheet.create({
        container: {
            
            backgroundColor: "#f0f0f0"
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
                <Text style={styles.titleText}>Productos Destacados</Text>
                <FlatList
                    data={products}
                    renderItem={renderCard}
                    keyExtractor={item => item.id}
                    horizontal
                />

            </View>
    )
}