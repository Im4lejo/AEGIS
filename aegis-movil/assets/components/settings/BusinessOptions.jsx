import { useRouter } from "expo-router";
import { useState } from "react";
import {
    SettingCard,
    SettingSwitchRow,
    SettingsScreen,
} from "./SettingsUI";

export default function BusinessOptions() {
    const router = useRouter();
    const [businessProfile, setBusinessProfile] = useState(true);
    const [customerMessages, setCustomerMessages] = useState(true);

    return (
        <SettingsScreen
            title="Opciones de negocio"
            onBack={() => router.replace("/(tabs)/settings")}
        >
            <SettingCard>
                <SettingSwitchRow
                    label="Mostrar mi perfil comercial"
                    value={businessProfile}
                    onValueChange={setBusinessProfile}
                />
                <SettingSwitchRow
                    label="Permitir mensajes de clientes"
                    value={customerMessages}
                    onValueChange={setCustomerMessages}
                />
            </SettingCard>
        </SettingsScreen>
    );
}