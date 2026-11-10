import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

const extraPhotos = [1, 2, 3, 4];

export default function PublishProduct() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.eyebrow}>TU TIENDA</Text>
                    <Text style={styles.title}>Publicar producto</Text>
                    <Text style={styles.subtitle}>
                        Agrega los detalles y las fotos de tu producto.
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.field}>
                        <Text style={styles.label}>Título del producto</Text>
                        <TextInput
                            accessibilityLabel="Título del producto"
                            placeholder="Ej. Audífonos inalámbricos"
                            placeholderTextColor="#9AA1B2"
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Descripción</Text>
                        <TextInput
                            accessibilityLabel="Descripción del producto"
                            multiline
                            numberOfLines={4}
                            placeholder="Describe el estado y los detalles del producto"
                            placeholderTextColor="#9AA1B2"
                            style={[styles.input, styles.descriptionInput]}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Precio</Text>
                        <View style={styles.priceInput}>
                            <Text style={styles.currency}>$</Text>
                            <TextInput
                                accessibilityLabel="Precio"
                                keyboardType="decimal-pad"
                                placeholder="0.00"
                                placeholderTextColor="#9AA1B2"
                                style={styles.priceTextInput}
                            />
                            <Text style={styles.currencyCode}>COP</Text>
                        </View>
                    </View>

                    <View style={styles.photoSection}>
                        <View style={styles.photoHeading}>
                            <View>
                                <Text style={styles.label}>Fotos del producto</Text>
                                <Text style={styles.photoHint}>
                                    La primera foto será la portada
                                </Text>
                            </View>
                            <Text style={styles.photoCount}>0/5</Text>
                        </View>

                        <View style={styles.photoGrid}>
                            <View
                                accessibilityLabel="Espacio para la foto principal del producto"
                                style={styles.mainPhoto}
                            >
                                <View style={styles.uploadIcon}>
                                    <Ionicons name="cloud-upload-outline" size={30} color="#6547E8" />
                                </View>
                                <Text style={styles.mainPhotoTitle}>Agrega la foto principal</Text>
                                <Text style={styles.mainPhotoHint}>Toca para seleccionar una imagen</Text>
                            </View>

                            <View style={styles.extraPhotos}>
                                {extraPhotos.map((photo) => (
                                    <View
                                        key={photo}
                                        accessibilityLabel={`Espacio para foto adicional ${photo}`}
                                        style={styles.extraPhoto}
                                    >
                                        <Ionicons name="add" size={23} color="#6547E8" />
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>

                    <View style={styles.submitButton}>
                        <Ionicons name="arrow-up-circle-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.submitButtonText}>Publicar producto</Text>
                    </View>
                    <Text style={styles.submitHint}>
                        La publicación estará lista cuando agregues tus datos y fotos.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F5F6FA",
    },
    content: {
        width: "100%",
        maxWidth: 640,
        alignSelf: "center",
        paddingHorizontal: 18,
        paddingTop: 22,
        paddingBottom: 36,
    },
    header: {
        marginBottom: 24,
    },
    eyebrow: {
        marginBottom: 6,
        color: "#6547E8",
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 1.3,
    },
    title: {
        color: "#18233A",
        fontSize: 26,
        fontWeight: "800",
    },
    subtitle: {
        marginTop: 6,
        color: "#798196",
        fontSize: 14,
    },
    form: {
        gap: 20,
    },
    field: {
        gap: 9,
    },
    label: {
        color: "#27314A",
        fontSize: 14,
        fontWeight: "700",
    },
    input: {
        minHeight: 52,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: "#E3E6EF",
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        color: "#263149",
        fontSize: 14,
    },
    descriptionInput: {
        minHeight: 112,
        paddingTop: 14,
        paddingBottom: 14,
    },
    priceInput: {
        minHeight: 52,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: "#E3E6EF",
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
    },
    currency: {
        color: "#737C91",
        fontSize: 16,
        fontWeight: "700",
    },
    priceTextInput: {
        flex: 1,
        height: "100%",
        paddingHorizontal: 10,
        color: "#263149",
        fontSize: 14,
    },
    currencyCode: {
        color: "#9299A8",
        fontSize: 12,
        fontWeight: "700",
    },
    photoSection: {
        alignItems: "center",
        gap: 14,
    },
    photoHeading: {
        width: "100%",
        maxWidth: 400,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    photoHint: {
        marginTop: 4,
        color: "#858DA0",
        fontSize: 12,
    },
    photoCount: {
        color: "#6547E8",
        fontSize: 13,
        fontWeight: "700",
    },
    photoGrid: {
        width: "100%",
        maxWidth: 400,
        gap: 10,
    },
    mainPhoto: {
        width: "100%",
        aspectRatio: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        borderWidth: 1.5,
        borderStyle: "dashed",
        borderColor: "#BFB4F7",
        borderRadius: 18,
        backgroundColor: "#F0EDFF",
    },
    uploadIcon: {
        width: 58,
        height: 58,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 14,
        borderRadius: 18,
        backgroundColor: "#FFFFFF",
    },
    mainPhotoTitle: {
        color: "#35276F",
        fontSize: 15,
        fontWeight: "700",
        textAlign: "center",
    },
    mainPhotoHint: {
        marginTop: 6,
        color: "#8179A4",
        fontSize: 12,
        textAlign: "center",
    },
    extraPhotos: {
        flexDirection: "row",
        gap: 10,
    },
    extraPhoto: {
        flex: 1,
        aspectRatio: 1,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderStyle: "dashed",
        borderColor: "#D5D8E2",
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
    },
    submitButton: {
        minHeight: 54,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        marginTop: 4,
        borderRadius: 14,
        backgroundColor: "#6547E8",
    },
    submitButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },
    submitHint: {
        marginTop: -12,
        color: "#9299A8",
        fontSize: 11,
        textAlign: "center",
    },
});