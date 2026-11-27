import {
    ActivityIndicator,
    Image,
    Platform,
    RefreshControl,
    StyleSheet,
    View,
    ScrollView,
    Text,
    Pressable,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Redirect } from "expo-router";
import ProfileProducts from "./ProfileProducts";
import ForumPostCard from "../forum/ForumPostCard";
import { useAuth } from "../../viewmodels/auth/AuthContext";
import useProfileViewModel from "../../viewmodels/profile/useProfileViewModel";

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;
const PROFILE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function Profile({ profileId }) {
    const { user } = useAuth();
    const isOwnProfile = !profileId || Number(profileId) === Number(user?.id);
    const viewedUserId = profileId || user?.id;
    const [selectedSection, setSelectedSection] = useState("publicaciones");
    const [failedBackgroundUrl, setFailedBackgroundUrl] = useState(null);
    const [showBackgroundMenu, setShowBackgroundMenu] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [imageError, setImageError] = useState("");
    const {
        errorMessage: profileError,
        isLoading: isProfileLoading,
        isRefreshing,
        actionError,
        addComment,
        likedPosts,
        profile,
        products,
        publications,
        refresh,
        toggleLike,
        uploadProfileImage,
    } = useProfileViewModel(viewedUserId, isOwnProfile);
    const displayedProfile = profile || (isOwnProfile ? user : null);

    if (isOwnProfile && !user) {
        return <Redirect href="/auth" />;
    }

    const backgroundImageCandidate = isOwnProfile
        ? profile?.img_background_url || user?.img_background_url
        : displayedProfile?.img_background_url;
    const backgroundImageUrl =
        typeof backgroundImageCandidate === "string" &&
        backgroundImageCandidate.trim()
            ? backgroundImageCandidate.trim()
            : null;
    const chooseProfileImage = async (type) => {
        setImageError("");
        setIsUploadingImage(true);
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                setImageError("Permite el acceso a tus fotos para cambiar la imagen.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: type === "avatar" ? [1, 1] : [13, 6],
                quality: 0.8,
            });
            if (result.canceled || !result.assets?.[0]) {
                return;
            }

            const image = result.assets[0];
            const mimeType = image.mimeType || "image/jpeg";
            if (!PROFILE_IMAGE_TYPES.includes(mimeType)) {
                setImageError("El formato debe ser JPG, PNG o WEBP.");
                return;
            }
            if ((image.fileSize || 0) > MAX_PROFILE_IMAGE_SIZE) {
                setImageError("La imagen debe pesar máximo 5 MB.");
                return;
            }

            const saved = await uploadProfileImage(
                { ...image, mimeType },
                type
            );
            if (saved && type === "cover") {
                setFailedBackgroundUrl(null);
                setShowBackgroundMenu(false);
            }
        } catch (error) {
            setImageError(
                error?.message || "No se pudo seleccionar la imagen."
            );
        } finally {
            setIsUploadingImage(false);
        }
    };

    if (!profile && !isOwnProfile && isProfileLoading) {
        return (
            <View style={styles.profileLoading}>
                <ActivityIndicator color="#317df8" />
                <Text style={styles.sectionPlaceholder}>Cargando perfil...</Text>
            </View>
        );
    }

    if (!profile && !isOwnProfile) {
        return (
            <View style={styles.profileLoading}>
                <Text accessibilityRole="alert" style={styles.sectionPlaceholder}>
                    {profileError || "No se pudo cargar este perfil."}
                </Text>
                <Pressable onPress={() => refresh()} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Reintentar</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.profileScreen}>
            <View style={styles.profileContent}>
                <ScrollView
                    style={styles.scrollView}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={() => refresh(true)}
                            tintColor="#317df8"
                            colors={["#317df8"]}
                        />
                    }
                >
                    <View style={styles.container}>
                        <View style={styles.primaryBackground}>
                            <View style={styles.profileImgContainer}>
                                {backgroundImageUrl &&
                                failedBackgroundUrl !== backgroundImageUrl ? (
                                    <Image
                                        key={backgroundImageUrl}
                                        source={{
                                            uri: backgroundImageUrl,
                                            ...(Platform.OS === "web"
                                                ? {}
                                                : { headers: { Accept: "image/jpeg" } }),
                                        }}
                                        style={styles.backgroundImage}
                                        resizeMode="cover"
                                        onError={() =>
                                            setFailedBackgroundUrl(backgroundImageUrl)
                                        }
                                    />
                                ) : (
                                    <LinearGradient
                                        colors={["#FFFFFF", "#b3b3b3", "#797878"]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.backgroundImage}
                                    />
                                )}
                                {isOwnProfile ? (
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel="Editar fondo del perfil"
                                        onPress={() => setShowBackgroundMenu(true)}
                                        style={styles.coverEditButton}
                                    >
                                        <Ionicons
                                            name="pencil"
                                            size={20}
                                            color="#2c2c2c"
                                        />
                                        <Text style={styles.cardTitle}>Editar Fondo</Text>
                                    </Pressable>
                                ) : null}
                            </View>
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={
                                        displayedProfile?.foto_perfil_url
                                            ? { uri: displayedProfile.foto_perfil_url }
                                            : require("../../../assets/default-profile.png")
                                    }
                                    style={styles.logo}
                                />
                                {isOwnProfile ? (
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel="Cambiar foto de perfil"
                                        onPress={() => chooseProfileImage("avatar")}
                                        style={styles.avatarEditButton}
                                    >
                                        {isUploadingImage ? (
                                            <ActivityIndicator size="small" color="#ffffff" />
                                        ) : (
                                            <Ionicons name="pencil" size={18} color="#f1f1f1" />
                                        )}
                                    </Pressable>
                                ) : null}
                            </View>
                            <Text style={styles.primaryName}>
                                {displayedProfile?.nombre} {displayedProfile?.apellido}
                            </Text>
                            <Text style={styles.username}>@{displayedProfile?.username}</Text>
                            <View style={styles.cardContainer}>
                                <View style={styles.card_1}>
                                    <Ionicons
                                        name="trophy-sharp"
                                        size={24}
                                        color="#ffffff"
                                    />
                                    <Text style={styles.userValues}>5</Text>
                                    <Text style={styles.cardDescription}>
                                        Top vendedores semanales
                                    </Text>
                                </View>
                                <View style={styles.card_2}>
                                    <Ionicons
                                        name="star"
                                        size={24}
                                        color="#ffffff"
                                    />
                                    <Text style={styles.userValues}>
                                        {displayedProfile?.reputacion ?? "—"}
                                    </Text>
                                    <Text style={styles.cardDescription}>
                                        Reseñas
                                    </Text>
                                </View>
                                <View style={styles.card_3}>
                                    <Ionicons
                                        name="ribbon"
                                        size={24}
                                        color="#ffffff"
                                    />
                                    <Text style={styles.userValues}>Confiable</Text>
                                    <Text style={styles.cardDescription}>
                                        Medalla de honor
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.personalData}>
                            <Text style={styles.description}>Descripción</Text>
                            <Text style={styles.usernameDATA}>
                                {displayedProfile?.descripcion || "Sin descripción"}
                            </Text>
                            <Text>Lugar de residencia</Text>
                            <Text style={styles.usernameDATA}>
                                {displayedProfile?.ciudad_aprox || "No especificado"}
                            </Text>
                            {displayedProfile?.fecha_registro ? (
                                <>
                                    <Text>Fecha de registro de cuenta</Text>
                                    <Text style={styles.usernameDATA}>
                                        {displayedProfile.fecha_registro}
                                    </Text>
                                </>
                            ) : null}
                        </View>
                        <View style={styles.sectionTabs}>
                            <Pressable
                                accessibilityRole="tab"
                                accessibilityState={{
                                    selected: selectedSection === "publicaciones",
                                }}
                                onPress={() =>
                                    setSelectedSection("publicaciones")
                                }
                                style={[
                                    styles.sectionTab,
                                    selectedSection === "publicaciones" &&
                                    styles.selectedSectionTab,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.sectionTabText,
                                        selectedSection === "publicaciones" &&
                                        styles.selectedSectionTabText,
                                    ]}
                                >
                                    Publicaciones
                                </Text>
                            </Pressable>
                            <Pressable
                                accessibilityRole="tab"
                                accessibilityState={{
                                    selected: selectedSection === "productos",
                                }}
                                onPress={() => setSelectedSection("productos")}
                                style={[
                                    styles.sectionTab,
                                    selectedSection === "productos" &&
                                    styles.selectedSectionTab,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.sectionTabText,
                                        selectedSection === "productos" &&
                                        styles.selectedSectionTabText,
                                    ]}
                                >
                                    Productos
                                </Text>
                            </Pressable>
                        </View>
                        {selectedSection === "publicaciones" ? (
                            <Publicaciones
                                publications={publications}
                                isLoading={isProfileLoading}
                                errorMessage={profileError}
                                likedPosts={likedPosts}
                                onToggleLike={toggleLike}
                                onCreateComment={addComment}
                            />
                        ) : (
                            <ProfileProducts
                                products={products}
                                isLoading={isProfileLoading}
                                errorMessage={profileError}
                            />
                        )}
                        {isOwnProfile && actionError ? (
                            <Text accessibilityRole="alert" style={styles.sectionPlaceholder}>
                                {actionError}
                            </Text>
                        ) : null}


                    </View>
                </ScrollView>
            </View>
            {showBackgroundMenu ? (
                <View style={styles.backgroundMenu}>
                    <View style={styles.backgroundMenuHeader}>
                        <View style={styles.backgroundMenuHeading}>
                            <Text style={styles.backgroundMenuEyebrow}>
                                PERSONALIZACIÓN
                            </Text>
                            <Text style={styles.backgroundMenuTitle}>
                                Cambiar foto de fondo
                            </Text>
                            <Text style={styles.backgroundMenuSubtitle}>
                                Dale un nuevo estilo a tu perfil.
                            </Text>
                        </View>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Volver al perfil"
                            onPress={() => setShowBackgroundMenu(false)}
                            style={styles.closeBackgroundMenu}
                        >
                            <Ionicons name="close" size={23} color="#ffffff" />
                        </Pressable>
                    </View>
                    <LinearGradient
                        colors={["#FFFFFF", "#d1d1d1", "#a09f9f"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.backgroundPreview}
                    >
                        {backgroundImageUrl &&
                            failedBackgroundUrl !== backgroundImageUrl ? (
                            <Image
                                key={backgroundImageUrl}
                                source={{
                                    uri: backgroundImageUrl,
                                    ...(Platform.OS === "web"
                                        ? {}
                                        : { headers: { Accept: "image/jpeg" } }),
                                }}
                                style={styles.backgroundPreviewImage}
                                resizeMode="cover"
                                onError={() =>
                                    setFailedBackgroundUrl(backgroundImageUrl)
                                }
                            />
                        ) : null}
                        <View style={styles.backgroundPreviewCaption}>
                            <Text style={styles.backgroundPreviewText}>
                                Así se verá en tu perfil
                            </Text>
                        </View>
                    </LinearGradient>
                    <View style={styles.imagePickerCard}>
                        <View style={styles.imagePickerIcon}>
                            <Ionicons
                                name="cloud-upload-outline"
                                size={25}
                                color="#5e57bd"
                            />
                        </View>
                        <Text style={styles.imagePickerTitle}>
                            Elige una imagen para tu perfil
                        </Text>
                        <Text style={styles.imagePickerDescription}>
                            Usa una imagen horizontal JPG, PNG o WEBP (máximo 5 MB).
                        </Text>
                        {imageError || actionError ? (
                            <Text accessibilityRole="alert" style={styles.imageError}>
                                {imageError || actionError}
                            </Text>
                        ) : null}
                        <Pressable
                            accessibilityRole="button"
                            disabled={isUploadingImage}
                            onPress={() => chooseProfileImage("cover")}
                            style={styles.imagePickerButton}
                        >
                            {isUploadingImage ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Text style={styles.imagePickerButtonText}>
                                    Seleccionar imagen
                                </Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            ) : null}
        </View>
    );
}

function Publicaciones({
    publications,
    isLoading,
    errorMessage,
    likedPosts,
    onToggleLike,
    onCreateComment,
}) {
    if (isLoading) {
        return (
            <View style={styles.publicationState}>
                <ActivityIndicator color="#317df8" />
                <Text style={styles.sectionPlaceholder}>
                    Cargando tus publicaciones...
                </Text>
            </View>
        );
    }

    if (errorMessage) {
        return (
            <Text accessibilityRole="alert" style={styles.sectionPlaceholder}>
                {errorMessage}
            </Text>
        );
    }

    if (!publications.length) {
        return (
            <Text style={styles.sectionPlaceholder}>
                Aún no has publicado en el foro.
            </Text>
        );
    }

    return (
        <View style={styles.publicationList}>
            {publications.map((publication) => (
                <ForumPostCard
                    key={publication.id}
                    post={publication}
                    liked={!!likedPosts[publication.id]}
                    onToggleLike={onToggleLike}
                    onCreateComment={onCreateComment}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    profileScreen: {
        flex: 1,
        position: "relative",
    },
    profileLoading: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#e0e0e0",
    },
    retryButton: {
        marginTop: 10,
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 8,
        backgroundColor: "#317df8",
    },
    retryButtonText: {
        color: "#ffffff",
        fontWeight: "700",
    },
    profileContent: {
        flex: 1,
    },
    container: {
        position: 'relative',

    },
    scrollView: {
        position: 'relative',
        backgroundColor: "#e0e0e0",
        flex: 1,
    },
    backgroundMenu: {
        position: "absolute",
        top: "10%",
        left: "5%",
        width: "90%",
        height: "80%",
        padding: 20,
        gap: 16,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: "rgb(150, 150, 150)",
        backgroundColor: "rgba(94, 94, 94, 0.98)",
        zIndex: 10,
        elevation: 12,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.24,
        shadowRadius: 18,
    },
    backgroundMenuHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
    },
    backgroundMenuHeading: {
        flex: 1,
    },
    backgroundMenuEyebrow: {
        marginBottom: 4,
        color: "#D6D1FF",
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 1,
    },
    backgroundMenuTitle: {
        color: "#FFFFFF",
        fontSize: 19,
        fontWeight: "700",
    },
    backgroundMenuSubtitle: {
        marginTop: 4,
        color: "rgba(255, 255, 255, 0.78)",
        fontSize: 12,
    },
    closeBackgroundMenu: {
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 18,
        backgroundColor: "rgba(255, 255, 255, 0.18)",
    },
    backgroundPreview: {
        width: "100%",
        height: 160,
        justifyContent: "flex-end",
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.38)",
        borderRadius: 14,
    },
    backgroundPreviewImage: {
        ...StyleSheet.absoluteFillObject,
    },
    backgroundPreviewCaption: {
        alignSelf: "flex-start",
        margin: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: "rgba(30, 33, 40, 0.58)",
    },
    backgroundPreviewText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
    },
    imagePickerCard: {
        flex: 1,
        minHeight: 150,
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "rgba(255, 255, 255, 0.48)",
        borderRadius: 16,
        backgroundColor: "rgba(255, 255, 255, 0.12)",
    },
    imagePickerIcon: {
        width: 48,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
        borderRadius: 16,
        backgroundColor: "rgba(255, 255, 255, 0.16)",
    },
    imagePickerTitle: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
        textAlign: "center",
    },
    imagePickerDescription: {
        marginTop: 5,
        color: "rgba(255, 255, 255, 0.78)",
        fontSize: 11,
        textAlign: "center",
    },
    imagePickerButton: {
        minHeight: 40,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 14,
        paddingHorizontal: 18,
        borderRadius: 10,
        backgroundColor: "#655BD0",
    },
    imagePickerButtonText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "700",
    },
    imageError: {
        marginTop: 8,
        color: "#ffe0e0",
        fontSize: 12,
        textAlign: "center",
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
    },
    logo: {
        width: 130,
        height: 130,
        borderRadius: 65,
        resizeMode: 'cover',
        borderWidth: 3,
        borderStyle: "solid",
        borderColor: "#f0f0f0"
    },
    avatarContainer: {
        position: "absolute",
        top: 165,
        left: 25,
        width: 130,
        height: 130,
    },
    coverEditButton: {
        position: "absolute",
        display: "flex",
        flexDirection: "row",
        top: 12,
        left: 12,
        width: "fit-content",
        height: 40,
        borderWidth: 1.5,
        borderColor: "#303030",
        borderRadius: 8,
        backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
        padding: 5
    },
    avatarEditButton: {
        position: "absolute",
        top: 80,
        right: -9,
        width: 38,
        height: 38,
        borderRadius: 19,
        borderWidth: 2,
        borderColor: "#ffffff",
        backgroundColor: "#5220c7",
        alignItems: "center",
        justifyContent: "center",
        elevation: 3,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
    },
    profileImgContainer: {
        height: 225,
        margin: 5,
        borderWidth: 0,
        borderRadius: 15,
        overflow: 'hidden',
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: "#e6e6e6",
    },
    personalData: {
        alignSelf: "center",
        backgroundColor: "#f3f3f3",
        width: "95%",

        marginTop: 15,
        borderRadius: 7,
        gap: 15,
        padding: 15
    },
    primaryName: {
        marginLeft: "40%",
        fontSize: 20,
        fontWeight: "semibold",
        marginBottom: 15,

    },
    username: {
        marginLeft: "40%",
        fontSize: 16,
        fontWeight: "semibold",
        marginBottom: 15,
        color: "#595959"
    },
    usernameDATA: {
        fontSize: 16,
        fontWeight: "semibold",
        marginBottom: 15,
        color: "#595959"
    },
    primaryBackground: {
        backgroundColor: "#f5f5f5"
    },
    card_1: {
        marginVertical: 8,
        padding: 8,
        flex: 1,
        minWidth: 0,
        height: 100,
        backgroundColor: "#101edb",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    card_2: {
        marginVertical: 8,
        padding: 8,
        flex: 1,
        minWidth: 0,
        height: 100,
        backgroundColor: "#5925d3",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center"
    },
    card_3: {
        marginVertical: 8,
        padding: 8,
        flex: 1,
        minWidth: 0,
        height: 100,
        backgroundColor: "#9325d3",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center"
    },
    cardContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        gap: 10,
        paddingHorizontal: 8,
        justifyContent: "center"
    },
    cardTitle: {
        color: "#252525",
        fontSize: 14,
        margin: 5
    },
    userValues: {
        color: "#f5f5f5",
        fontSize: 14,

    },
    cardDescription: {
        color: "#c4c4c4",
        fontSize: 10,
        lineHeight: 13,
        textAlign: "center",
    },
    sectionTabs: {
        flexDirection: "row",
        marginTop: 18,
        borderBottomWidth: 1,
        borderBottomColor: "#c9c9c9",
        backgroundColor: "#f3f3f3",
    },
    sectionTab: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: 3,
        borderBottomColor: "transparent",
    },
    selectedSectionTab: {
        borderBottomColor: "#317df8",
    },
    sectionTabText: {
        color: "#666666",
        fontWeight: "600",
    },
    selectedSectionTabText: {
        color: "#317df8",
    },
    sectionPlaceholder: {
        padding: 16,
        color: "#666666",
    },
    publicationState: {
        minHeight: 120,
        alignItems: "center",
        justifyContent: "center",
    },
    publicationList: {
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 18,
    },
})