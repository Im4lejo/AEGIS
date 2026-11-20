import { View, Text, StyleSheet, FlatList } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useCategoriesViewModel } from "../../viewmodels/catalog/useCatalogViewModel";
export default function Categorias() {
    const { categories } = useCategoriesViewModel();
    const renderCard = ({ item }) => (
        <View style={styles.category} >
            <LinearGradient
                colors={["#282557", "#500944"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <Text style={styles.text}>{item.nombre}</Text>
            </LinearGradient>
        </View>
    )
    const styles = StyleSheet.create({
        category: {
            flexDirection: "column",
            backgroundColor: "#dadada",
            margin: 10,
            borderColor: "#55555500",
            borderWidth: 1,
            borderRadius: 12,
            justifyContent: "center",
            width: 100,
            height: 100
        },
        gradient: {
            flex: 1,
            borderRadius: 11,
            justifyContent: "center",
            padding: 5,
        },
        text: {
            color: "#ffffff",
            fontSize: 12,
            fontWeight: "semibold",
            textAlign: "center",
        },
        error: {
            color: "#ffffff",
            padding: 10,
        },
        titleText: {
            margin: 15,
            fontSize: 28,
            borderStyle: "solid",
            borderBottomColor: "#53b1f0",
            borderBottomWidth: 4,
            width: "45%"
        },
    });
    return (
        <View>
            <Text style={styles.titleText}>Categorías</Text>
            <FlatList
                data={categories}
                renderItem={renderCard}
                keyExtractor={item => String(item.id)}
                horizontal
            />
        </View>
    )
}