import { useRouter } from "expo-router";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SettingCard, SettingsScreen } from "./SettingsUI";

const details = [
    {
        label: "Nombre Completo",
        value: "Luis Alejandro Montenegro Ojeda",
        description: "los usuarios verán tu nombre en AEGIS de esta forma",
    },
    {
        label: "Número de contacto",
        value: "+57 322022020",
        description: "los usuarios te contactarán por este medio",
    },
    {
        label: "Número de Documento",
        value: "N° 10617272181",
        description: "los usuarios tendrán más confianza a la hora de realizar transacciones",
    },
    {
        label: "Nacimiento",
        value: "03/05/2008",
        description: "los usuarios conocerán más acerca de tí",
    },
    {
        label: "Lugar de Residencia",
        value: "Popayán - Cauca",
        description: "los usuarios te podrán localizar si están cerca de tí",
    },
];

export default function BasicInfo() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isPhone = width < 600;

    return (
        <SettingsScreen
            title="Información básica"
            onBack={() => router.replace("/(tabs)/settings")}
            contentMaxWidth={1200}
            contentPaddingHorizontal={8}
        >
            <SettingCard>
                {details.map((detail, index) => (
                    <View
                        key={detail.label}
                        style={[
                            styles.row,
                            isPhone && styles.phoneRow,
                            index < details.length - 1 && styles.divider,
                        ]}
                    >
                        <Text style={[styles.label, isPhone && styles.phoneLabel]}>
                            {detail.label}
                        </Text>
                        <Text style={[styles.value, isPhone && styles.phoneValue]}>
                            {detail.value}
                        </Text>
                        <Text
                            style={[
                                styles.description,
                                isPhone && styles.phoneDescription,
                            ]}
                        >
                            {detail.description}
                        </Text>
                        <View style={[styles.edit, isPhone && styles.phoneEdit]}>
                            <Text style={[styles.editText, isPhone && styles.phoneEditText]}>
                                Editar
                            </Text>
                            <Text style={styles.chevron}>›</Text>
                        </View>
                    </View>
                ))}
            </SettingCard>
        </SettingsScreen>
    );
}

const styles = StyleSheet.create({
    row: {
        minHeight: 72,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        gap: 16,
    },
    phoneRow: {
        minHeight: 0,
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingVertical: 12,
        gap: 4,
    },
    divider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#e5e9f0",
    },
    label: {
        marginTop:10,
        flex: 1.1,
        color: "#30394f",
        fontSize: 15,
    },
    phoneLabel: {
        flex: 0,
        fontSize: 12,
    },
    value: {
        flex: 0.75,
        color: "#18233a",
        fontSize: 15,
        fontWeight: "600",
    },
    phoneValue: {
        flex: 0,
        fontSize: 12,
    },
    description: {
        flex: 1.35,
        color: "#8991a2",
        fontSize: 12,
        lineHeight: 18,
    },
    phoneDescription: {
        flex: 0,
        fontSize: 11,
        lineHeight: 16,
    },
    edit: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    phoneEdit: {
        marginTop: 1,
    },
    editText: {
        
        color: "#c339e8",
        fontSize: 14,
    },
    phoneEditText: {
        fontSize: 11,
    },
    chevron: {
        color: "#c339e8",
        fontSize: 22,
        lineHeight: 24,
    },
});