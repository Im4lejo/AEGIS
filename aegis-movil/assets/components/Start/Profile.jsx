import { Image, StyleSheet, View, ImageBackground, ScrollView, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import user from "../../DATA/users"

export default function Profile() {
    return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.container}>
                <View style={styles.primaryBackground}>
                    <ImageBackground
                        source={require('../../../assets/background.png')}
                        style={styles.profileImgContainer}
                        imageStyle={styles.backgroundImage}
                        resizeMode="cover"
                    >
                        <View style={styles.coverEditButton}>
                            <Ionicons name="pencil" size={20} color="#ffffff" />
                            <Text style={styles.cardTitle}>Editar Fondo</Text>
                        </View>
                    </ImageBackground>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={user.profile_img}
                            style={styles.logo}
                        />
                        <View style={styles.avatarEditButton}>
                            <Ionicons name="pencil" size={18} color="#ffffff" />
                        </View>
                    </View>
                    <Text style={styles.primaryName}>{user.name}</Text>
                    <View style={styles.cardContainer}>
                   
                        <View style={styles.card_1}>
                            <Ionicons name="trophy-sharp" size={24} color="#ffffff" />
                            <Text style={styles.cardTitle}>5</Text>
                            <Text style={styles.cardDescription}>Top vendedores semanales</Text>
                        </View>
                        <View style={styles.card_2}>
                            <Ionicons name="star" size={24} color="#ffffff" />
                            <Text style={styles.cardTitle}>4.7</Text>
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
                    <Text style={styles.description}><strong>Descripción</strong></Text>
                    <Text>Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas eligendi hic facilis, voluptatem eos velit nobis nesciunt perferendis accusamus consequuntur recusandae dolores quaerat, corporis illo temporibus sapiente reprehenderit rem aut.</Text>
                    <Text><strong>Lugar de residencia</strong></Text>
                    <Text>Popayán, Cauca</Text>
                    <Text><strong>Fecha de Nacimiento</strong></Text>
                    <Text>29 de marzo del 2006</Text>
                    <Text><strong>Fecha de registro de cuenta</strong></Text>
                    <Text>30/04/2026</Text>

                </View>


            </View>
        </ScrollView>
    )
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
        width: "100%",
        height: 225,
        borderRadius: 15,
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
})