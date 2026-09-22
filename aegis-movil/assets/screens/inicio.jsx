import { SafeAreaView } from "react-native-web";
import { ScrollView } from "react-native-web";
import { View, Text, StyleSheet } from "react-native";
import ProductosHor from "../components/ProductList";
import ProductosVer from "../components/ProductList2";
export default function index() {
    return (
        <SafeAreaView style={{ flex: 1 }}>

            <ScrollView>

                <ProductosHor />

                <ProductosVer />

            </ScrollView>

        </SafeAreaView>

    )
}