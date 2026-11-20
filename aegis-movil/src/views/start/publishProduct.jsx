import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { createProduct } from "../../models/api/apiClient";
import { useAuth } from "../../viewmodels/auth/AuthContext";
import { useCategoriesViewModel } from "../../viewmodels/catalog/useCatalogViewModel";

const productStates = ["nuevo", "usado", "reacondicionado"];
const maxImages = 5;

function getErrorMessage(error) {
    const validationErrors = error.response?.data?.errors;
    const firstValidationError = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null;

    return (
        firstValidationError ||
        error.response?.data?.message ||
        error.message ||
        "No se pudo publicar el producto."
    );
}

function getImageFileName(asset, index) {
    if (asset.fileName) {
        return asset.fileName;
    }

    const extension = asset.uri.split(".").pop()?.split("?")[0] || "jpg";
    return `producto-${index + 1}.${extension}`;
}

export default function PublishProduct() {
    const router = useRouter();
    const { user, token } = useAuth();
    const { categories, errorMessage: categoriesError } =
        useCategoriesViewModel();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [categoryId, setCategoryId] = useState(null);
    const [productState, setProductState] = useState("usado");
    const [images, setImages] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [isPicking, setIsPicking] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const chooseImages = async () => {
        setErrorMessage("");
        setIsPicking(true);

        try {
            const permission =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                setErrorMessage(
                    "Permite el acceso a tus fotos para adjuntar imágenes."
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsMultipleSelection: true,
                selectionLimit: maxImages,
                quality: 0.85,
            });

            if (!result.canceled) {
                const selectedImages = result.assets || [];
                setImages((currentImages) => {
                    const uniqueImages = new Map(
                        [...currentImages, ...selectedImages].map((image) => [
                            image.uri,
                            image,
                        ])
                    );
                    return Array.from(uniqueImages.values()).slice(0, maxImages);
                });
            }
        } catch (error) {
            setErrorMessage(getErrorMessage(error));
        } finally {
            setIsPicking(false);
        }
    };

    const removeImage = (uri) => {
        setImages((currentImages) =>
            currentImages.filter((image) => image.uri !== uri)
        );
    };

    const publishProduct = async () => {
        setErrorMessage("");

        if (!user?.id || !token) {
            setErrorMessage("Inicia sesión para publicar un producto.");
            return;
        }

        if (!title.trim() || title.trim().length > 150) {
            setErrorMessage("Escribe un título de máximo 150 caracteres.");
            return;
        }

        if (!description.trim()) {
            setErrorMessage("Escribe la descripción del producto.");
            return;
        }

        const numericPrice = Number(price.replace(",", "."));
        if (
            !price.trim() ||
            !Number.isFinite(numericPrice) ||
            numericPrice < 0 ||
            numericPrice > 9999999999.99
        ) {
            setErrorMessage("Escribe un precio válido en pesos colombianos.");
            return;
        }

        if (!categoryId) {
            setErrorMessage("Selecciona una categoría.");
            return;
        }

        if (!productStates.includes(productState)) {
            setErrorMessage("Selecciona el estado del producto.");
            return;
        }

        if (images.length < 1 || images.length > maxImages) {
            setErrorMessage("Adjunta entre 1 y 5 imágenes del producto.");
            return;
        }

        const formData = new FormData();
        formData.append("categoria_id", String(categoryId));
        formData.append("titulo", title.trim());
        formData.append("descripcion", description.trim());
        formData.append("precio", String(numericPrice));
        formData.append("estado_producto", productState);
        images.forEach((image, index) => {
            formData.append("imagenes[]", {
                uri: image.uri,
                name: getImageFileName(image, index),
                type: image.mimeType || "image/jpeg",
            });
        });

        setIsSubmitting(true);
        try {
            const response = await createProduct(formData, token);
            const product = response.data?.data;

            Alert.alert(
                "Producto publicado",
                "Tu producto ya está disponible en AEGIS.",
                [
                    {
                        text: "Ver producto",
                        onPress: () => {
                            if (product?.id) {
                                router.replace({
                                    pathname: "/product/[id]",
                                    params: { id: String(product.id) },
                                });
                            } else {
                                router.replace("/(tabs)/index");
                            }
                        },
                    },
                ]
            );
        } catch (error) {
            setErrorMessage(getErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.eyebrow}>TU TIENDA</Text>
                    <Text style={styles.title}>Publicar producto</Text>
                    <Text style={styles.subtitle}>
                        Completa los detalles y agrega al menos una foto.
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.field}>
                        <Text style={styles.label}>Título del producto *</Text>
                        <TextInput
                            accessibilityLabel="Título del producto"
                            value={title}
                            onChangeText={setTitle}
                            maxLength={150}
                            placeholder="Ej. Audífonos inalámbricos"
                            placeholderTextColor="#9AA1B2"
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Descripción *</Text>
                        <TextInput
                            accessibilityLabel="Descripción del producto"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            placeholder="Describe el estado y los detalles del producto"
                            placeholderTextColor="#9AA1B2"
                            style={[styles.input, styles.descriptionInput]}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Precio (COP) *</Text>
                        <View style={styles.priceInput}>
                            <Text style={styles.currency}>$</Text>
                            <TextInput
                                accessibilityLabel="Precio en pesos colombianos"
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="decimal-pad"
                                placeholder="0"
                                placeholderTextColor="#9AA1B2"
                                style={styles.priceTextInput}
                            />
                            <Text style={styles.currencyCode}>COP</Text>
                        </View>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Categoría *</Text>
                        {categoriesError ? (
                            <Text style={styles.inlineError}>
                                {categoriesError}
                            </Text>
                        ) : null}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.optionList}
                        >
                            {categories.map((category) => {
                                const isSelected = categoryId === category.id;
                                return (
                                    <Pressable
                                        key={category.id}
                                        accessibilityRole="button"
                                        accessibilityState={{
                                            selected: isSelected,
                                        }}
                                        onPress={() => setCategoryId(category.id)}
                                        style={[
                                            styles.option,
                                            isSelected && styles.selectedOption,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                isSelected &&
                                                    styles.selectedOptionText,
                                            ]}
                                        >
                                            {category.nombre}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Estado del producto *</Text>
                        <View style={styles.optionList}>
                            {productStates.map((state) => {
                                const isSelected = productState === state;
                                return (
                                    <Pressable
                                        key={state}
                                        accessibilityRole="button"
                                        accessibilityState={{
                                            selected: isSelected,
                                        }}
                                        onPress={() => setProductState(state)}
                                        style={[
                                            styles.option,
                                            isSelected && styles.selectedOption,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                isSelected &&
                                                    styles.selectedOptionText,
                                            ]}
                                        >
                                            {state}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    <View style={styles.photoSection}>
                        <View style={styles.photoHeading}>
                            <View>
                                <Text style={styles.label}>
                                    Fotos del producto *
                                </Text>
                                <Text style={styles.photoHint}>
                                    De 1 a 5 imágenes. La primera será la portada.
                                </Text>
                            </View>
                            <Text style={styles.photoCount}>
                                {images.length}/{maxImages}
                            </Text>
                        </View>

                        <View style={styles.photoGrid}>
                            {images.map((image, index) => (
                                <View key={image.uri} style={styles.photo}>
                                    <Image
                                        source={{ uri: image.uri }}
                                        style={styles.photoImage}
                                    />
                                    {index === 0 ? (
                                        <View style={styles.coverBadge}>
                                            <Text style={styles.coverText}>
                                                Portada
                                            </Text>
                                        </View>
                                    ) : null}
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel={`Quitar imagen ${index + 1}`}
                                        onPress={() => removeImage(image.uri)}
                                        style={styles.removePhoto}
                                    >
                                        <Ionicons
                                            name="close"
                                            size={15}
                                            color="#FFFFFF"
                                        />
                                    </Pressable>
                                </View>
                            ))}

                            {images.length < maxImages ? (
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel="Agregar fotos del producto"
                                    onPress={chooseImages}
                                    disabled={isPicking}
                                    style={styles.addPhoto}
                                >
                                    {isPicking ? (
                                        <ActivityIndicator color="#6547E8" />
                                    ) : (
                                        <>
                                            <Ionicons
                                                name="images-outline"
                                                size={25}
                                                color="#6547E8"
                                            />
                                            <Text style={styles.addPhotoText}>
                                                Agregar fotos
                                            </Text>
                                        </>
                                    )}
                                </Pressable>
                            ) : null}
                        </View>
                    </View>

                    {errorMessage ? (
                        <Text accessibilityRole="alert" style={styles.error}>
                            {errorMessage}
                        </Text>
                    ) : null}

                    <Pressable
                        accessibilityRole="button"
                        onPress={publishProduct}
                        disabled={isSubmitting || isPicking}
                        style={({ pressed }) => [
                            styles.submitButton,
                            pressed && styles.submitButtonPressed,
                            (isSubmitting || isPicking) &&
                                styles.submitButtonDisabled,
                        ]}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons
                                    name="arrow-up-circle-outline"
                                    size={20}
                                    color="#FFFFFF"
                                />
                                <Text style={styles.submitButtonText}>
                                    Publicar producto
                                </Text>
                            </>
                        )}
                    </Pressable>
                </View>
            </ScrollView>
        </View>
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
    optionList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    option: {
        paddingHorizontal: 13,
        paddingVertical: 9,
        borderWidth: 1,
        borderColor: "#E3E6EF",
        borderRadius: 18,
        backgroundColor: "#FFFFFF",
    },
    selectedOption: {
        borderColor: "#6547E8",
        backgroundColor: "#F0EDFF",
    },
    optionText: {
        color: "#697286",
        fontSize: 12,
        fontWeight: "600",
        textTransform: "capitalize",
    },
    selectedOptionText: {
        color: "#5338CB",
    },
    photoSection: {
        gap: 14,
    },
    photoHeading: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    photoHint: {
        maxWidth: 280,
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
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    photo: {
        width: "31%",
        aspectRatio: 1,
        overflow: "hidden",
        borderRadius: 12,
        backgroundColor: "#EDEFF4",
    },
    photoImage: {
        width: "100%",
        height: "100%",
    },
    coverBadge: {
        position: "absolute",
        left: 5,
        bottom: 5,
        paddingHorizontal: 7,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: "#6547E8",
    },
    coverText: {
        color: "#FFFFFF",
        fontSize: 9,
        fontWeight: "700",
    },
    removePhoto: {
        position: "absolute",
        top: 5,
        right: 5,
        width: 25,
        height: 25,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 13,
        backgroundColor: "#20283BCC",
    },
    addPhoto: {
        width: "31%",
        aspectRatio: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        padding: 8,
        borderWidth: 1.5,
        borderStyle: "dashed",
        borderColor: "#BFB4F7",
        borderRadius: 12,
        backgroundColor: "#F0EDFF",
    },
    addPhotoText: {
        color: "#5338CB",
        fontSize: 11,
        fontWeight: "700",
        textAlign: "center",
    },
    inlineError: {
        color: "#B42332",
        fontSize: 12,
    },
    error: {
        color: "#B42332",
        fontSize: 13,
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
    submitButtonPressed: {
        opacity: 0.85,
    },
    submitButtonDisabled: {
        opacity: 0.65,
    },
    submitButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },
});
