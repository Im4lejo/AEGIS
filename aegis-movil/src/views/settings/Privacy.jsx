import { useRouter } from "expo-router";
import { useState } from "react";
import {
    SettingCard,
    SettingSwitchRow,
    SettingsScreen,
} from "./SettingsUI";

export default function Privacy() {
    const router = useRouter();
    const [publicProfile, setPublicProfile] = useState(true);
    const [showContactNumber, setShowContactNumber] = useState(false);
    const [allowMessages, setAllowMessages] = useState(true);

    return (
        <SettingsScreen
            title="Privacidad"
            onBack={() => router.replace("/(tabs)/settings")}
        >
            <SettingCard>
                <SettingSwitchRow
                    label="Perfil público"
                    value={publicProfile}
                    onValueChange={setPublicProfile}
                />
                <SettingSwitchRow
                    label="Mostrar mi número de contacto"
                    value={showContactNumber}
                    onValueChange={setShowContactNumber}
                />
                <SettingSwitchRow
                    label="Permitir que cualquier usuario me escriba"
                    value={allowMessages}
                    onValueChange={setAllowMessages}
                />
            </SettingCard>
        </SettingsScreen>
    );
}