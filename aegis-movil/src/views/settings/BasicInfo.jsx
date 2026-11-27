import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../viewmodels/auth/AuthContext";
import { getApiErrorMessage, getUserProfile, updateOwnProfile } from "../../models/api/apiClient";
import { SettingCard, SettingsScreen } from "./SettingsUI";

const editableFields = [
    { key: "nombre", label: "Nombre", maxLength: 100 },
    { key: "apellido", label: "Apellido", maxLength: 100 },
    { key: "username", label: "Nombre de usuario", maxLength: 50 },
    { key: "url_publica", label: "URL pública del perfil", maxLength: 100 },
    { key: "ciudad_aprox", label: "Lugar de residencia", maxLength: 100 },
    { key: "descripcion", label: "Descripción", maxLength: 1000, multiline: true },
];

function getProfileFields(profile = {}) {
    return editableFields.reduce((fields, field) => ({
        ...fields,
        [field.key]: profile[field.key] || "",
    }), {});
}

export default function BasicInfo() {
    const router = useRouter();
    const { token, user, updateUser } = useAuth();
    const [fields, setFields] = useState(() => getProfileFields(user));
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [notice, setNotice] = useState("");

    useEffect(() => {
        let isActive = true;

        const loadProfile = async () => {
            try {
                const response = await getUserProfile(user?.id, token);
                const profile = response.data?.data?.perfil;
                if (!profile) {
                    throw new Error("La API no devolvió los datos del perfil.");
                }
                if (isActive) {
                    setFields(getProfileFields(profile));
                }
            } catch (error) {
                if (isActive) {
                    setErrorMessage(error?.response
                        ? getApiErrorMessage(error)
                        : error?.message || "No se pudo cargar tu perfil.");
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        if (user?.id && token) {
            loadProfile();
        } else {
            setErrorMessage("Inicia sesión para editar tu perfil.");
            setIsLoading(false);
        }

        return () => {
            isActive = false;
        };
    }, [token, user?.id]);

    const updateField = (key, value) => {
        setFields((currentFields) => ({ ...currentFields, [key]: value }));
        setNotice("");
    };

    const saveProfile = async () => {
        if (isSaving || !token) {
            return;
        }

        setErrorMessage("");
        setNotice("");
        setIsSaving(true);
        const payload = {
            nombre: fields.nombre.trim(),
            apellido: fields.apellido.trim(),
            username: fields.username.trim() || null,
            url_publica: fields.url_publica.trim() || null,
            ciudad_aprox: fields.ciudad_aprox.trim() || null,
            descripcion: fields.descripcion.trim() || null,
        };

        try {
            const response = await updateOwnProfile(payload, token);
            const profile = response.data?.data?.perfil;
            if (!profile) {
                throw new Error("La API no devolvió el perfil actualizado.");
            }
            await updateUser(profile);
            setFields(getProfileFields(profile));
            setNotice("Los datos del perfil se actualizaron.");
        } catch (error) {
            setErrorMessage(error?.response
                ? getApiErrorMessage(error)
                : error?.message || "No se pudo guardar tu perfil.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SettingsScreen
            title="Información básica"
            onBack={() => router.replace("/(tabs)/settings")}
        >
            <SettingCard>
                {isLoading ? (
                    <View style={styles.state}>
                        <ActivityIndicator color="#625cff" />
                        <Text style={styles.helper}>Cargando tus datos...</Text>
                    </View>
                ) : (
                    editableFields.map((field) => (
                        <View key={field.key} style={styles.field}>
                            <Text style={styles.label}>{field.label}</Text>
                            <TextInput
                                accessibilityLabel={field.label}
                                value={fields[field.key]}
                                onChangeText={(value) => updateField(field.key, value)}
                                placeholder={field.label}
                                placeholderTextColor="#9299a8"
                                maxLength={field.maxLength}
                                multiline={field.multiline}
                                textAlignVertical={field.multiline ? "top" : "center"}
                                autoCapitalize={field.key === "username" || field.key === "url_publica"
                                    ? "none"
                                    : "sentences"}
                                style={[styles.input, field.multiline && styles.multilineInput]}
                            />
                        </View>
                    ))
                )}
            </SettingCard>
            {errorMessage ? (
                <Text accessibilityRole="alert" style={styles.error}>
                    {errorMessage}
                </Text>
            ) : null}
            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
            <Pressable
                accessibilityRole="button"
                disabled={isLoading || isSaving}
                onPress={saveProfile}
                style={({ pressed }) => [
                    styles.saveButton,
                    (isLoading || isSaving) && styles.disabledButton,
                    pressed && styles.pressedButton,
                ]}
            >
                {isSaving ? (
                    <ActivityIndicator color="#ffffff" />
                ) : (
                    <Text style={styles.saveButtonText}>Guardar cambios</Text>
                )}
            </Pressable>
            <Text style={styles.helper}>
                Solo se muestran datos que actualmente admite el perfil de AEGIS.
            </Text>
        </SettingsScreen>
    );
}

const styles = StyleSheet.create({
    field: {
        paddingVertical: 12,
        gap: 7,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#e5e9f0",
    },
    label: {
        color: "#30394f",
        fontSize: 13,
        fontWeight: "600",
    },
    input: {
        minHeight: 42,
        paddingHorizontal: 11,
        borderRadius: 8,
        backgroundColor: "#f7f8fb",
        color: "#18233a",
        fontSize: 14,
    },
    multilineInput: {
        minHeight: 100,
        paddingTop: 10,
    },
    state: {
        minHeight: 100,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    saveButton: {
        minHeight: 46,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 16,
        borderRadius: 9,
        backgroundColor: "#625cff",
    },
    saveButtonText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "700",
    },
    disabledButton: {
        opacity: 0.6,
    },
    pressedButton: {
        opacity: 0.8,
    },
    error: {
        paddingTop: 10,
        color: "#b42318",
        fontSize: 13,
    },
    notice: {
        paddingTop: 10,
        color: "#26734d",
        fontSize: 13,
    },
    helper: {
        paddingTop: 12,
        color: "#8991a2",
        fontSize: 12,
        textAlign: "center",
    },
});
