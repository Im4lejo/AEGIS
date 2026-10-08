import { Image, StyleSheet, View, ImageBackground , Pressable , ScrollView} from "react-native";
import user from "../../DATA/users"

export default function Profile() {
    return (
        <ScrollView>
        <View style={styles.container}>
            <ImageBackground
                source={require('../../../assets/background.png')}
                style={styles.profileImgContainer}
                imageStyle={styles.backgroundImage}
                resizeMode="cover"
            >
                <Pressable
                
                />
            </ImageBackground>
            <Image
                source={user.profile_img}
                style={styles.logo}
            />
            <View
                style={styles.personalData}
                />
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
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
        position: 'absolute',
        top: 165,
        left: 25,
        borderWidth: 3,
        borderStyle:"solid",
        borderColor: "#e7e7e7"
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
        alignSelf:"center",
        backgroundColor: "#d3d2d2",
        width: "95%",
        height: 300,
        marginTop: 75,
        borderRadius:5
    }
})