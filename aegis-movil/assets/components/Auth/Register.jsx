import { Image, Pressable, ScrollView, StyleSheet, Text, View, TextInput } from "react-native";
import aegisLogo from "../../../assets/icon.png";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { registerUser } from "../../../services/api";
export default function Authenticator() {
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async () => {
        if (
            !nombre.trim() ||
            !apellido.trim() ||
            !email.trim() ||
            !password ||
            !passwordConfirmation
        ) {
            Alert.alert("Campos incompletos", "Completa los campos obligatorios.");
            return;
        }

        if (password !== passwordConfirmation) {
            Alert.alert("Error", "Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);

        try {
            const response = await registerUser({
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                username: username.trim() || null,
                email: email.trim(),
                password: password,
                password_confirmation: passwordConfirmation,
            });

            Alert.alert(
                "¡Bienvenido a AEGIS!",
                response.data.message
            );

            console.log("Usuario creado:", response.data.usuario);

        } catch (error) {
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;

                const firstError = errors
                    ? Object.values(errors)[0]?.[0]
                    : error.response.data.message;

                Alert.alert("Revisa tus datos", firstError || "Datos inválidos.");
            } else {
                Alert.alert(
                    "Error de conexión",
                    error.response?.data?.message ||
                    error.message ||
                    "No fue posible conectar con el servidor."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>

            <LinearGradient
                colors={['#196EDE', '#131EBB', '#371174']}
                locations={[0, 0.52, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.background}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Pressable
                        onPress={() => { router.replace("/auth") }}
                        style={styles.indexButton}
                    >
                        <Text style={styles.comeBackText}><Ionicons name="arrow-back" size={13} color="white" /> Regresar al inicio</Text>
                    </Pressable>
                    <View style={styles.content}>
                        <View style={styles.logoFrame}>
                            <Image source={aegisLogo} style={styles.logo} />
                        </View>
                        <Text style={styles.textPrimary}>Crea tu cuenta</Text>
                        <Text style={styles.welcomeText}>Completa tus datos para registrarte</Text>
                        <View style={styles.subContent}>
                            <View style={styles.actions}>
                                <Text style={styles.loginText}>Nombre</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Tu nombre"
                                    placeholderTextColor="#dfdfdf"
                                    autoCapitalize="words"
                                    value={nombre}
                                    onChangeText={setNombre}
                                />
                                <Text style={styles.loginText}>Apellido</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Tu apellido"
                                    placeholderTextColor="#dfdfdf"
                                    autoCapitalize="words"
                                    value={apellido}
                                    onChangeText={setApellido}
                                />
                                <Text style={styles.loginText}>Nombre de usuario</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Elige un nombre de usuario"
                                    placeholderTextColor="#dfdfdf"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    value={username}
                                    onChangeText={setUsername}
                                />
                                <Text style={styles.loginText}>Correo</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="tucorreo@ejemplo.com"
                                    placeholderTextColor="#dfdfdf"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    value={email}
                                    onChangeText={setEmail}
                                />
                                <Text style={styles.loginText}>Contraseña</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Crea una contraseña"
                                    placeholderTextColor="#dfdfdf"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <Text style={styles.loginText}>Confirmar contraseña</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Vuelve a escribir tu contraseña"
                                    placeholderTextColor="#dfdfdf"
                                    secureTextEntry
                                    value={passwordConfirmation}
                                    onChangeText={setPasswordConfirmation}
                                />
                                <Pressable
                                    onPress={handleRegister}
                                    disabled={loading}
                                    style={({ pressed }) => [
                                        styles.register,
                                        pressed && styles.pressed,
                                        loading && { opacity: 0.6 },
                                    ]}
                                >
                                    <Text style={styles.registerText}>
                                        {loading ? "Registrando..." : "Registrarse"}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        width: '100%',
    },
    background: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 24,
        paddingVertical: 24,
    },
    content: {
        width: '100%',
        maxWidth: 420,
        alignItems: 'center',
        padding: 22,
        borderRadius: 26,
        backgroundColor: 'rgba(8, 16, 91, 0.25)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.22)',
    },
    subContent: {
        width: '100%',
        marginTop: 18,
        maxWidth: 420,
        alignItems: 'center',
        padding: 18,
        borderRadius: 22,
        backgroundColor: 'rgba(8, 16, 91, 0.22)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.23)',
    },
    logoFrame: {
        width: 82,
        height: 82,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderRadius: 41,
        backgroundColor: 'rgba(255, 255, 255, 0.14)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.35)',
    },
    logo: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
    },
    textPrimary: {
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: 0,
        textAlign: 'center',
    },
    actions: {
        width: '100%',
        marginTop: 2,
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
        paddingHorizontal: 10,
        justifyContent: 'center',
        minHeight: 42,
        borderRadius: 0,
        borderBottomWidth: 1.5,
        borderBottomColor: "#fdfdfd",
        backgroundColor: 'rgba(255, 255, 255, 0)',
        marginTop: 2,
        marginBottom: 12,
        color: "#FFFFFF",
    },
    loginText: {
        color: '#F1F1FF',
        fontSize: 14,
        fontWeight: '700',
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
        minHeight: 48,
        marginTop: 10,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        shadowColor: '#080D5C',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
        marginBottom:10,
    },
    registerText: {
        color: '#2e22ce',
        fontSize: 16,
        fontWeight: '800',
    },
    pressed: {
        opacity: 0.78,
        transform: [{ scale: 0.98 }],
    },
});