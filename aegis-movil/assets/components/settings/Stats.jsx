import { useRouter } from "expo-router";
import {
    SettingCard,
    SettingsScreen,
    SettingsNotice,
} from "./SettingsUI";

export default function Stats() {
    const router = useRouter();

    return (
        <SettingsScreen
            title="Estadísticas"
            onBack={() => router.replace("/(tabs)/settings")}
        >
            <SettingCard>
                <SettingsNotice>
                    Tus estadísticas aparecerán aquí cuando haya actividad en tu cuenta.
                </SettingsNotice>
            </SettingCard>
        </SettingsScreen>
    );
}