import { View,Text, Image, Button } from "react-native-web";
import aegisLogo from "../icon.png"
import { StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
export default function Login() {
    return (
        <View style={styles.container}>
            <LinearGradient
                // Array con los colores del gradiente
                colors={['#196edde3', '#131ebbde', '#371174dc']}
                // Controla dónde empieza y termina el gradiente (valores de 0 a 1)
                start={{ x: 10, y: 0 }} // Esquina superior izquierda
                end={{ x: 30, y: 10 }}   // Esquina inferior derecha
                style={styles.background}
            >
                <Image
                    source={aegisLogo}
                    style={styles.logo}
                />
                
                <Text style={styles.textPrimary}>Bienvenid@ a AEGIS </Text>
                <Text style={styles.textSecondary}>Inicia sesión o registrate para disfrutar al máximo nuestra APP</Text>
                <Button
                    style={styles.login}
                    title="Iniciar Sesión"
                />
                <Text>O</Text>
                <Button
                    style={styles.register}
                    title="Regístrate"
                />
            </LinearGradient>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
      background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 50
    },
    textPrimary: {
        margin:10,
        color:"#fdfdfd",
        fontSize: 16,
        fontFamily: "sans-serif",
        fontWeight:"semibold"
    },
    textSecondary: {
        margin: 15,
        color: "#ffffff",
        fontFamily: "sans-serif",
        fontSize: 14
    },
    login: {
        borderRadius: 25,
        margin: 15,
        color: "#ffffff",
        fontFamily: "sans-serif",
        fontSize: 14
    },
    register: {
        borderRadius: 25,

    },
})