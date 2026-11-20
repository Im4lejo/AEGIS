import { useRouter } from "expo-router";
import {
    SettingCard,
    SettingsScreen,
    SettingsNotice,
} from "./SettingsUI";

export default function MyPurchases() {
    const router = useRouter();

    return (
        <SettingsScreen
            title="Mis compras"
            onBack={() => router.replace("/(tabs)/settings")}
        >
            <SettingCard>
                <SettingsNotice>
                    Aún no tienes compras para mostrar.
                </SettingsNotice>
            </SettingCard>
        </SettingsScreen>
    );
}