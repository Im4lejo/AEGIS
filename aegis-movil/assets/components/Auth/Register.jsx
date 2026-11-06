import { Image, Pressable, ScrollView, StyleSheet, Text, View, TextInput } from "react-native";
import aegisLogo from "../../../assets/icon.png";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { registerUser } from "../../../services/api";
import { useFormik } from 'formik';
import * as Yup from 'yup';
export default function Authenticator() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const validationSchema =
    Yup.object().shape({
        nombre: Yup.string()
            .required('El nombre es obligatorio'),
        apellido: Yup.string()
            .required('El apellido es obligatorio'),
        username: Yup.string()
            .required('El nombre de usuario es obligatorio')
            .matches(
                /^[a-zA-Z0-9_]+$/,
                "Solo se permiten letras, números y guion bajo"
        ),
        email: Yup.string()
            .email('Email inválido')
            .required('El correo es obligatorio'),
        password: Yup.string()
            .min(8, 'La contraseña debe tener al menos 8 caracteres')
            .max(20, 'la contraseña no puede ser mayor a 20 caracteres'),
        passwordConfirmation: Yup.string()
            .oneOf(
                [Yup.ref("password")],
                "Las contraseñas no coinciden"
            )
            .required("Confirma tu contraseña")
    })
    const formik = useFormik({
        initialValues: {
            nombre: '',
            apellido: '',
            username: '',
            email: '',
            password: '',
            passwordConfirmation: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            const { passwordConfirmation, ...userData } = values;
            setLoading(true);

            try {
                const response = await registerUser({
                    ...userData,
                    password_confirmation: passwordConfirmation,
                });
                Alert.alert('¡Registro exitoso!, Vuelve al inicio para iniciar sesión', response.data.message);
            } catch (error) {
                const validationErrors = error.response?.data?.errors;
                const firstError = validationErrors
                    ? Object.values(validationErrors)[0]?.[0]
                    : error.response?.data?.message;

                Alert.alert(
                    error.response?.status === 422 ? 'Revisa tus datos' : 'Error de conexión',
                    firstError || error.message || 'No fue posible conectar con el servidor.'
                );
            } finally {
                setLoading(false);
            }
        },
    });

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
                                    onBlur={formik.handleBlur('nombre')}
                                    value={formik.values.nombre}
                                    onChangeText={formik.handleChange('nombre')}
                                />
                                <Text style={styles.loginText}>Apellido</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Tu apellido"
                                    placeholderTextColor="#dfdfdf"
                                    autoCapitalize="words"
                                    onBlur={formik.handleBlur('apellido')}
                                    value={formik.values.apellido}
                                    onChangeText={formik.handleChange('apellido')}
                                />
                                <Text style={styles.loginText}>Nombre de usuario</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Elige un nombre de usuario"
                                    placeholderTextColor="#dfdfdf"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    onBlur={formik.handleBlur('username')}
                                    value={formik.values.username}
                                    onChangeText={formik.handleChange('username')}
                                />
                                <Text style={styles.loginText}>Correo</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="tucorreo@ejemplo.com"
                                    placeholderTextColor="#dfdfdf"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    onBlur={formik.handleBlur('email')}
                                    value={formik.values.email}
                                    onChangeText={formik.handleChange('email')}
                                />
                                <Text style={styles.loginText}>Contraseña</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Crea una contraseña"
                                    placeholderTextColor="#dfdfdf"
                                    secureTextEntry
                                    onBlur={formik.handleBlur('password')}
                                    value={formik.values.password}
                                    onChangeText={formik.handleChange('password')}
                                />
                                <Text style={styles.loginText}>Confirmar contraseña</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Vuelve a escribir tu contraseña"
                                    placeholderTextColor="#dfdfdf"
                                    secureTextEntry
                                    onBlur={formik.handleBlur('passwordConfirmation')}
                                    value={formik.values.passwordConfirmation}
                                    onChangeText={formik.handleChange('passwordConfirmation')}
                                />
                                <Pressable
                                    title="Registrarse"
                                    onPress={formik.handleSubmit}
                                    disabled={formik.isSubmitting}
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