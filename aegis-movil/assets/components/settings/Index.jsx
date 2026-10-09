import { useRouter } from "expo-router";
import {
    SettingCard,
    SettingLinkRow,
    SettingsScreen,
} from "./SettingsUI";

export default function Index() {
    const router = useRouter();
    const openSettings = (path) => router.push(path);

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
            </SettingCard>
        </SettingsScreen>
    );
}