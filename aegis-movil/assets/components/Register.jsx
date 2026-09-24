import { Image, Pressable, StyleSheet, Text, View, TextInput } from "react-native";
import aegisLogo from "../icon.png";
import { LinearGradient } from 'expo-linear-gradient';
import Index from "../screens/Inicio";
import { Ionicons } from '@expo/vector-icons';
export default function Authenticator() {
    return (
        <View style={styles.container}>

            <LinearGradient
                colors={['#196EDE', '#131EBB', '#371174']}
                locations={[0, 0.52, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.background}
            >
                <Pressable
                    onPress={() => { }}
                    style={styles.indexButton}
                >

                    <Text style={styles.comeBackText}><Ionicons name="arrow-back" size={13} color="white" /> Regresar al inicio</Text>
                </Pressable>
                <View style={styles.content}>
                    <View style={styles.logoFrame}>
                        <Image source={aegisLogo} style={styles.logo} />
                    </View>
                    <Text style={styles.textPrimary}>Bienvenid@ de nuevo!</Text>
                    <Text style={styles.welcomeText}>Bienvenid@, ingresa tus datos en los campos</Text>
                    <View style={styles.subContent}>
                        <View style={styles.actions}>
                            <Text style={styles.loginText}>Correo o teléfono</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Correo o teléfono"
                                placeholderTextColor="#dfdfdf"
                            //value={ }
                            //onChangeText={(newValue) => setText(newValue)} // Actualiza el estado
                            //autoCapitalize="none"  // Evita mayúsculas automáticas si no se desean
                            //autoCorrect={false} 
                            />
                            <Text style={styles.loginText}>Contraseña</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Contraseña"
                                placeholderTextColor="#dfdfdf"
                            //onPress={}
                            //value={ }
                            //onChangeText={(newValue) => setText(newValue)} // Actualiza el estado
                            //autoCapitalize="none"  // Evita mayúsculas automáticas si no se desean
                            //autoCorrect={false} 
                            />
                            <Pressable
                                onPress={() => { }}
                                style={({ pressed }) => [styles.login, pressed && styles.pressed]}
                            >
                                <Text style={styles.loginButtonText}>Iniciar sesión</Text>
                            </Pressable>

                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                            </View>

                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>¿No tienes cuenta?, <Text>Registrate aquí</Text></Text>
                                <View style={styles.dividerLine} />
                            </View>
                        </View>
                    </View>
                </View>
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
        padding: 24,
    },
    content: {
        width: '100%',
        maxWidth: 390,
        alignItems: 'center',
        padding: 28,
        borderRadius: 28,
        backgroundColor: 'rgba(8, 16, 91, 0.25)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.22)',
    },
    subContent: {
        width: '100%',
        marginTop: 20,
        maxWidth: 390,
        alignItems: 'center',
        padding: 16,
        borderRadius: 28,
        backgroundColor: 'rgba(8, 16, 91, 0.22)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.23)',
    },
    logoFrame: {
        width: 118,
        height: 118,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderRadius: 59,
        backgroundColor: 'rgba(255, 255, 255, 0.14)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.35)',
    },
    logo: {
        width: 88,
        height: 88,
        resizeMode: 'contain',
    },
    eyebrow: {
        marginBottom: 10,
        color: 'rgba(255, 255, 255, 0.72)',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.8,
    },
    textPrimary: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: 0,
        textAlign: 'center',
    },
    textSecondary: {
        maxWidth: 300,
        marginTop: 12,
        color: 'rgba(255, 255, 255, 0.82)',
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
    },
    actions: {
        width: '100%',
        marginTop: 10,
    },
    login: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 40,
        marginVertical: 15,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        shadowColor: '#080D5C',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    indexButton: {
        alignSelf: 'flex-start',
        justifyContent: 'center',
        minHeight: 20,
        borderRadius: 25,
        padding: 5,
        backgroundColor: 'rgba(255, 255, 255, 0)',
        borderColor: "#f1efef",
        borderWidth: 1,
        marginBottom: 15,
    },
    input: {
        padding: 10,
        justifyContent: 'center',
        minHeight: 40,
        borderRadius: 0,
        borderBottomWidth: 1.5,
        borderBottomColor: "#fdfdfd",
        backgroundColor: 'rgba(255, 255, 255, 0)',
        margin: 10,
        color: "#b9b6b6"
    },
    loginText: {
        color: '#e2e2e2',
        fontSize: 16,
        fontWeight: '800',
    },
    loginButtonText: {
        color: '#2e22ce',
        fontSize: 16,
        fontWeight: '800',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginVertical: 10,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.28)',
    },
    dividerText: {
        color: 'rgba(255, 255, 255, 0.72)',
        fontSize: 13,
        fontWeight: '600',
    },
    welcomeText: {
        color: 'rgba(255, 255, 255, 0.72)',
        fontSize: 13,
        fontWeight: '600',
        marginTop: 5,
    },
    comeBackText: {
        color: 'rgb(255, 255, 255)',
        fontSize: 13,
        fontWeight: '600',
        margin: 5,
        alignSelf: "flex-start"
    },
    register: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 40,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    registerText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    pressed: {
        opacity: 0.78,
        transform: [{ scale: 0.98 }],
    },
});