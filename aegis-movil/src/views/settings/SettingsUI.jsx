import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";

export function SettingsScreen({ title, children, onBack }) {
    return (
        <View style={styles.screen}>
            <ScrollView contentContainerStyle={styles.content}>
                {onBack ? (
                    <Pressable
                        accessibilityRole="button"
                        onPress={onBack}
                        style={styles.backButton}
                    >
                        <Text style={styles.backText}>‹ Volver atrás</Text>
                    </Pressable>
                ) : null}
                <Text style={styles.title}>{title}</Text>
                {children}
            </ScrollView>
        </View>
    );
}

export function SettingCard({ children }) {
    return <View style={styles.card}>{children}</View>;
}

export function SettingSwitchRow({ label, value, onValueChange }) {
    return (
        <View style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: "#b2b3b4", true: "#9229e7" }}
                thumbColor="#333edb"
                activeThumbColor="#dfdfdf"
                ios_backgroundColor="#d4d4d4"
                style={styles.switch}
            />
        </View>
    );
}

export function SettingLinkRow({ label, description, onPress }) {
    return (
        <Pressable
            accessibilityRole="button"
            onPress={onPress}
            style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
        >
            <View style={styles.linkText}>
                <Text style={styles.label}>{label}</Text>
                {description ? <Text style={styles.description}>{description}</Text> : null}
            </View>
            <Text style={styles.chevron}>›</Text>
        </Pressable>
    );
}

export function SettingField({ label, placeholder, keyboardType }) {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                accessibilityLabel={label}
                autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
                keyboardType={keyboardType || "default"}
                placeholder={placeholder}
                placeholderTextColor="#9299a8"
                style={styles.input}
            />
        </View>
    );
}

export function SettingsNotice({ children }) {
    return <Text style={styles.notice}>{children}</Text>;
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#eeeeee",
    },
    content: {
        width: "100%",
        maxWidth: 600,
        alignSelf: "center",
        paddingHorizontal: 18,
        paddingTop: 22,
        paddingBottom: 32,
    },
    backButton: {
        alignSelf: "flex-start",
        marginBottom: 14,
        paddingVertical: 3,
    },
    backText: {
        color: "#625cff",
        fontSize: 14,
        fontWeight: "600",
    },
    title: {
        color: "#18233a",
        fontSize: 15,
        fontWeight: "700",
        marginBottom: 12,
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        overflow: "hidden",
        paddingHorizontal: 14,
    },
    row: {
        minHeight: 52,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#edf0f5",
    },
    label: {
        color: "#48516a",
        fontSize: 13,
        flexShrink: 1,
    },
    linkRow: {
        minHeight: 70,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        paddingVertical: 4,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#edf0f5",
    },
    linkText: {
        flex: 1,
        gap: 4,
    },
    description: {
        color: "#8991a2",
        fontSize: 12,
    },
    chevron: {
        color: "#9299a8",
        fontSize: 21,
    },
    pressed: {
        opacity: 0.65,
    },
    switch: {
        transform: [{ scale: 1.08 }],
    },
    field: {
        paddingVertical: 14,
        gap: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#edf0f5",
    },
    input: {
        minHeight: 44,
        backgroundColor: "#f7f8fb",
        borderRadius: 8,
        color: "#30394f",
        fontSize: 14,
        paddingHorizontal: 12,
    },
    notice: {
        color: "#8991a2",
        fontSize: 13,
        lineHeight: 20,
        paddingVertical: 16,
        textAlign: "center",
    },
});
