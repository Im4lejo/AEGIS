import { View, Text, StyleSheet, FlatList } from "react-native";
import { getCategories } from "../../../services/api";
import { useEffect, useState } from "react";
import { LinearGradient } from 'expo-linear-gradient';
export default function Categorias() {
    const [categories, setCategories] = useState([]);
    useEffect(() => {
        uploadCategories();
    }, []);
    const uploadCategories = async () => {
        const res = await getCategories();
        setCategories(res.data.data);
    };
    const renderCard = ({ item }) => (
        
            <Text style={styles.text}>{item.nombre}</Text>
        
    )
    const styles = StyleSheet.create({
        category: {
            flexDirection: "column",
            backgroundColor: "#6b19a1",
            padding: 5
        },
        text: {
            color:"#f3f3f3",
            fontSize: 16,
            fontWeight: "semibold",
            padding:15
        },
        
    });
    return (
        <LinearGradient
                        colors={[ '#131EBB', '#371174']}
                        locations={[0, 0.52, 1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.background}
                    >
            <FlatList
                data={categories}
                renderItem={renderCard}
                keyExtractor={item => String(item.id)}
                horizontal
            />

        </LinearGradient>
    )
}