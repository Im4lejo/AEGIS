import { Image, StyleSheet, View, ScrollView, Text, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Redirect } from "expo-router";
import ProfileProducts from "./ProfileProducts";
import { useAuth } from "../../context/AuthContext";
export default function Profile() {
    const { user } = useAuth();
    const [selectedSection, setSelectedSection] = useState("publicaciones");

    if (!user) {
        return <Redirect href="/auth" />;
    }

    return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.container}>
                <View style={styles.primaryBackground}>
                    <View style={styles.profileImgContainer}>
                        {user?.img_background_url ? (
                            <Image
                                source={{ uri: user.img_background_url }}
                                style={styles.backgroundImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <LinearGradient
                                colors={["#101edb", "#5925d3", "#9325d3"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.backgroundImage}
                            />
                        )}
                        <View style={styles.coverEditButton}>
                            <Ionicons name="pencil" size={20} color="#ffffff" />
                            <Text style={styles.cardTitle}>Editar Fondo</Text>
                        </View>
                    </View>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={
                                user?.foto_perfil_url
                                    ? { uri: user.foto_perfil_url }
                                    : require("../../default-profile.png")
                            }
                            style={styles.logo}
                        />
                        <View style={styles.avatarEditButton}>
                            <Ionicons name="pencil" size={18} color="#ffffff" />
                        </View>
                    </View>
                    <Text style={styles.primaryName}>{user.nombre} {user.apellido}  </Text>
                    <Text style={styles.username}>@{user.username}</Text>
                    <View style={styles.cardContainer}>
                   
                        <View style={styles.card_1}>
                            <Ionicons name="trophy-sharp" size={24} color="#ffffff" />
                            <Text style={styles.cardTitle}>5</Text>
                            <Text style={styles.cardDescription}>Top vendedores semanales</Text>
                        </View>
                        <View style={styles.card_2}>
                            <Ionicons name="star" size={24} color="#ffffff" />
                            <Text style={styles.cardTitle}>{user.reputacion}</Text>
                            <Text style={styles.cardDescription}>Reseñas</Text>
                        </View>
                        <View style={styles.card_3}>
                            <Ionicons name="ribbon" size={24} color="#ffffff" />
                            <Text style={styles.cardTitle}>Confiable</Text>
                            <Text style={styles.cardDescription}>Medalla de honor</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.personalData}>
                    <Text style={styles.description}>Descripción</Text>
                    <Text style={styles.usernameDATA}>{user.descripcion}</Text>
                    <Text>Lugar de residencia</Text>
                    <Text style={styles.usernameDATA}>{user.ciudad}</Text>
                    <Text>Fecha de Nacimiento</Text>
                    <Text style={styles.usernameDATA}>29 de marzo del 2006</Text>
                    <Text>Fecha de registro de cuenta</Text>
                    <Text style={styles.usernameDATA}>{user.fecha_registro}</Text>
                </View>
                <View style={styles.sectionTabs}>
                    <Pressable
                        accessibilityRole="tab"
                        accessibilityState={{ selected: selectedSection === "publicaciones" }}
                        onPress={() => setSelectedSection("publicaciones")}
                        style={[
                            styles.sectionTab,
                            selectedSection === "publicaciones" && styles.selectedSectionTab,
                        ]}
                    >
                        <Text
                            style={[
                                styles.sectionTabText,
                                selectedSection === "publicaciones" && styles.selectedSectionTabText,
                            ]}
                        >
                            Publicaciones
                        </Text>
                    </Pressable>
                    <Pressable
                        accessibilityRole="tab"
                        accessibilityState={{ selected: selectedSection === "productos" }}
                        onPress={() => setSelectedSection("productos")}
                        style={[
                            styles.sectionTab,
                            selectedSection === "productos" && styles.selectedSectionTab,
                        ]}
                    >
                        <Text
                            style={[
                                styles.sectionTabText,
                                selectedSection === "productos" && styles.selectedSectionTabText,
                            ]}
                        >
                            Productos
                        </Text>
                    </Pressable>
                </View>
                {selectedSection === "publicaciones" ? (
                    <Publicaciones />
                ) : (
                    <ProfileProducts />
                )}


            </View>
        </ScrollView>
    )
}

function Publicaciones() {
    return <Text style={styles.sectionPlaceholder}>Sin publicaciones aún</Text>;
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',

    },
    scrollView: {
        position: 'relative',
        backgroundColor: "#e0e0e0",
        flex: 1,
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
    },
    logo: {
        width: 130,
        height: 130,
        borderRadius: 65,
        resizeMode: 'cover',
        borderWidth: 3,
        borderStyle: "solid",
        borderColor: "#e7e7e7"
    },
    avatarContainer: {
        position: "absolute",
        top: 165,
        left: 25,
        width: 130,
        height: 130,
    },
    coverEditButton: {
        position: "absolute",
        display: "flex",
        flexDirection:"row",
        top: 12,
        left: 12,
        width: "fit-content",
        height: 40,
        borderWidth: 1.5,
        borderColor: "#ffffff",
        borderRadius: 8,
        backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
        padding:5
    },
    avatarEditButton: {
        position: "absolute",
        top: 80,
        right: -9,
        width: 38,
        height: 38,
        borderRadius: 19,
        borderWidth: 2,
        borderColor: "#ffffff",
        backgroundColor: "#5220c7",
        alignItems: "center",
        justifyContent: "center",
        elevation: 3,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
    },
    profileImgContainer: {
        height: 225,
        margin: 5,
        borderWidth: 0,
        borderRadius: 15,
        overflow: 'hidden',
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: "#e6e6e6"
    },
    personalData: {
        alignSelf: "center",
        backgroundColor: "#f3f3f3",
        width: "95%",

        marginTop: 15,
        borderRadius: 7,
        gap: 15,
        padding: 15
    },
    primaryName: {
        marginLeft: "40%",
        fontSize: 20,
        fontWeight: "semibold",
        marginBottom: 15,
        
    },
    username: {
        marginLeft: "40%",
        fontSize: 16,
        fontWeight: "semibold",
        marginBottom: 15,
        color:"#595959"
    },
    usernameDATA: {
        fontSize: 16,
        fontWeight: "semibold",
        marginBottom: 15,
        color:"#595959"
    },
    primaryBackground: {
       backgroundColor:"#f5f5f5"
    },
    card_1: {
        marginVertical:10,
        width: "30%",
        height: 110,
        backgroundColor: "#101edb",
        borderRadius: 12,
        justifyContent: "center",
        alignItems:"center"
    },
    card_2: {
        marginVertical: 10,
        width: "30%",
        height: 110,
        backgroundColor: "#5925d3",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center"
    },
    card_3: {
        marginVertical: 10,
        width: "30%",
        height: 110,
        backgroundColor: "#9325d3",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center"
    },
    cardContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        gap: 10,
        justifyContent:"center"
    },
    cardTitle: {
        color: "#ffffff",
        fontSize: 18,
        margin: 5
    },
    cardDescription: {
        color: "#c4c4c4",
        fontSize: 10,
        
    },
    sectionTabs: {
        flexDirection: "row",
        marginTop: 18,
        borderBottomWidth: 1,
        borderBottomColor: "#c9c9c9",
        backgroundColor: "#f3f3f3",
    },
    sectionTab: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: 3,
        borderBottomColor: "transparent",
    },
    selectedSectionTab: {
        borderBottomColor: "#317df8",
    },
    sectionTabText: {
        color: "#666666",
        fontWeight: "600",
    },
    selectedSectionTabText: {
        color: "#317df8",
    },
    sectionPlaceholder: {
        padding: 16,
        color: "#666666",
    },
})