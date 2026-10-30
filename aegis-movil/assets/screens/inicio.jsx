import { ScrollView, Text, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProductosHor from "../components/Start/ProductList";
import ProductosVer from "../components/Start/DiscountProducts";
import Categorias from "../components/Start/categories";

const styles = StyleSheet.create({
    primaryText: {
        margin: 15,
        fontSize: 28,
        borderStyle: "solid",
        borderBottomColor: "#b119cf",
        borderBottomWidth: 4,
        width: "60%"
    },
    categoryContainer: {
        display: "flex",
        flexDirection:"row"
    }
})
export default function index() {

    return (
        <SafeAreaView style={{ flex: 1 }}>

            <ScrollView>
                <Categorias/>
                <Text style={styles.primaryText}>Página de productos</Text>
                <Image
                    source={require("../images/blackfriday.jpg")}
                    style={{ width: "100%", height: 180, resizeMode: "cover", marginVertical: 15 }}
                />
                {/*npm ci*/}
                <ProductosHor />

                <Image
                    source={require("../images/celulares-banner.png")}

                    style={{ width: "100%", height: 260, resizeMode: "cover" }}
                />
                <ProductosVer />

            </ScrollView>

        </SafeAreaView>

    )
}
