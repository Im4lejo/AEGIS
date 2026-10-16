import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import {
    SettingCard,
    SettingLinkRow,
    SettingsScreen,
} from "./SettingsUI";

export default function Index() {
    const router = useRouter();
    const { logout } = useAuth();
    const openSettings = (path) => router.push(path);

    const handleLogout = async () => {
        try {
            await logout();
            router.replace("/auth");
        } catch (error) {
            console.error("Error cerrando la sesión:", error);
            Alert.alert(
                "No se pudo cerrar la sesión",
                "Inténtalo de nuevo."
            );
        }
    };

    return (
        <SettingsScreen title="Ajustes">
            <SettingCard>
                <SettingLinkRow
                    label="Opciones del usuario"
                    description="Notificaciones y preferencias"
                    onPress={() => openSettings("/(tabs)/settings/user-options")}
                />
                <SettingLinkRow
                    label="Privacidad"
                    description="Controla quién puede ver tu información"
                    onPress={() => openSettings("/(tabs)/settings/privacy")}
                />
                <SettingLinkRow
                    label="Información básica"
                    description="Administra tus datos de contacto"
                    onPress={() => openSettings("/(tabs)/settings/basic-info")}
                />
                <SettingLinkRow
                    label="Opciones de negocio"
                    description="Preferencias de tu perfil comercial"
                    onPress={() => openSettings("/(tabs)/settings/business-options")}
                />
                <SettingLinkRow
                    label="Estadísticas"
                    description="Consulta la actividad de tu cuenta"
                    onPress={() => openSettings("/(tabs)/settings/stats")}
                />
                <SettingLinkRow
                    label="Mis compras"
                    description="Revisa tu historial de compras"
                    onPress={() => openSettings("/(tabs)/settings/my-purchases")}
                />
                <SettingLinkRow
                    label="Cerrar sesión"
                    description="Salir de tu cuenta"
                    onPress={handleLogout}
                />
            </SettingCard>
        </SettingsScreen>
    );
}