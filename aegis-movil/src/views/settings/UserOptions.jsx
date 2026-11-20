import { useRouter } from "expo-router";
import { useState } from "react";
import {
    SettingCard,
    SettingSwitchRow,
    SettingsScreen,
} from "./SettingsUI";

export default function UserOptions() {
    const router = useRouter();
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [messageNotifications, setMessageNotifications] = useState(true);

    return (
        <SettingsScreen
            title="Opciones del usuario"
            onBack={() => router.replace("/(tabs)/settings")}
        >
            <SettingCard>
                <SettingSwitchRow
                    label="Recibir notificaciones por correo"
                    value={emailNotifications}
                    onValueChange={setEmailNotifications}
                />
                <SettingSwitchRow
                    label="Avisarme cuando alguien me escriba"
                    value={messageNotifications}
                    onValueChange={setMessageNotifications}
                />
                <SettingSwitchRow
                    label="Mostrar mi actividad públicamente"
                    value={messageNotifications}
                    onValueChange={setMessageNotifications}
                />
            </SettingCard>
        </SettingsScreen>
    );
}