import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import aegisLogo from "../icon.png";
import { LinearGradient } from 'expo-linear-gradient';

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
                <View style={styles.content}>
                    <View style={styles.logoFrame}>
                        <Image source={aegisLogo} style={styles.logo} />
                    </View>

                    <Text style={styles.eyebrow}>TU ESPACIO, MÁS CERCA</Text>
                    <Text style={styles.textPrimary}>Bienvenid@ a AEGIS</Text>
                    <Text style={styles.textSecondary}>
                        Inicia sesión o regístrate para disfrutar al máximo nuestra app.
                    </Text>

                    <View style={styles.actions}>
                        <Pressable
                            onPress={() => { }}
                            style={({ pressed }) => [styles.login, pressed && styles.pressed]}
                        >
                            <Text style={styles.loginText}>Iniciar sesión</Text>
                        </Pressable>

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>o</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <Pressable
                            onPress={() => { }}
                            style={({ pressed }) => [styles.register, pressed && styles.pressed]}
                        >
                            <Text style={styles.registerText}>Regístrate</Text>
                        </Pressable>

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>Seguir navegando como invitado</Text>
                            <View style={styles.dividerLine} />
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
        marginTop: 30,
    },
    login: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 40,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        shadowColor: '#080D5C',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    loginText: {
        color: '#1825A8',
        fontSize: 16,
        fontWeight: '800',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginVertical: 18,
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