import { Image, Pressable, StyleSheet, Text, View, TextInput } from "react-native";
import aegisLogo from "../icon.png";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import user from "../DATA/users"
export default function Profile() {
    return (
        <View style={styles.container}>
            <Image
                source={user.profile_img}
                style={styles.logo}
            />
            
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    logo: {
        width: 88,
        height: 88,
        resizeMode: 'contain',
    }
})