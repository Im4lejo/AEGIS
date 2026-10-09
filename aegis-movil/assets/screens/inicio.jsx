import { SafeAreaView } from "react-native-web";
import { ScrollView } from "react-native-web";
import { View, Text, StyleSheet, Image } from "react-native";
import ProductosHor from "../components/Start/ProductList";
import ProductosVer from "../components/Start/ProductList2";
const styles = StyleSheet.create({
    primaryText: {
        margin:15,
        fontSize: 32,
        borderStyle:"solid",
        borderBottomColor: "#b119cf",
        borderBottomWidth: 4,
        width:"70%"
    }
})
export default function index() {

    return (
        <SafeAreaView style={{ flex: 1 }}>

            <ScrollView>
                <Text style={styles.primaryText}>Página de productos</Text>
                <Image
                    source={require("../images/blackfriday.jpg")}
                    style={{ width: "100%", height: 180, resizeMode: "cover", marginVertical:15 }}
                />
                {/*npm ci*/}
                <ProductosHor />
                <Image
                    source={require("../images/celulares-banner.png")}
                    
                    style={{ width: "100%", height: 260, resizeMode: "cover"}}
                />
                <ProductosVer />

            </ScrollView>

        </SafeAreaView>

    )
}
