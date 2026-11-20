import {
    ActivityIndicator,
    Image,
    StyleSheet,
    View,
    ScrollView,
    Text,
    Pressable,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Redirect } from "expo-router";
import ProfileProducts from "./ProfileProducts";
import ForumPostCard from "../forum/ForumPostCard";
import { useAuth } from "../../viewmodels/auth/AuthContext";
import useProfileViewModel from "../../viewmodels/profile/useProfileViewModel";

export default function Profile() {
    const { user } = useAuth();
    const [selectedSection, setSelectedSection] = useState("publicaciones");
    const [failedBackgroundUrl, setFailedBackgroundUrl] = useState(null);
    const [showBackgroundMenu, setShowBackgroundMenu] = useState(false);
    const {
        errorMessage: profileError,
        isLoading: isProfileLoading,
        actionError,
        addComment,
        likedPosts,
        products,
        publications,
        toggleLike,
    } = useProfileViewModel(user?.id);

    if (!user) {
        return <Redirect href="/auth" />;
    }

    const backgroundImageUrl =
        typeof user.img_background_url === "string" && user.img_background_url.trim()
            ? user.img_background_url.trim()
            : null;

    return (
        <View style={styles.profileScreen}>
            <View style={styles.profileContent}>
                <ScrollView style={styles.scrollView}>
                    <View style={styles.container}>
                        <View style={styles.primaryBackground}>
                            <LinearGradient
                                colors={["#FFFFFF", "#d1d1d1", "#a09f9f"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.profileImgContainer}
                            >
                                {backgroundImageUrl &&
                                    failedBackgroundUrl !== backgroundImageUrl ? (
                                    <Image
                                        source={{ uri: backgroundImageUrl }}
                                        style={styles.backgroundImage}
                                        resizeMode="cover"
                                        onError={() =>
                                            setFailedBackgroundUrl(backgroundImageUrl)
                                        }
                                    />
                                ) : null}
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
                            </LinearGradient>
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={
                                        user?.foto_perfil_url
                                            ? { uri: user.foto_perfil_url }
                                            : require("../../../assets/default-profile.png")
                                    }
                                    style={styles.logo}
                                />
                                <View style={styles.avatarEditButton}>
                                    <Ionicons
                                        name="pencil"
                                        size={18}
                                        color="#f1f1f1"
                                    />
                                </View>
                            </View>
                            <Text style={styles.primaryName}>
                                {user.nombre} {user.apellido}
                            </Text>
                            <Text style={styles.username}>@{user.username}</Text>
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
                                        {user.reputacion}
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
                                {user.descripcion}
                            </Text>
                            <Text>Lugar de residencia</Text>
                            <Text style={styles.usernameDATA}>{user.ciudad}</Text>
                            <Text>Fecha de Nacimiento</Text>
                            <Text style={styles.usernameDATA}>
                                29 de marzo del 2006
                            </Text>
                            <Text>Fecha de registro de cuenta</Text>
                            <Text style={styles.usernameDATA}>
                                {user.fecha_registro}
                            </Text>
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
                                actionError={actionError}
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
                                source={{ uri: backgroundImageUrl }}
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
                            Usa una imagen horizontal en formato JPG o PNG.
                        </Text>
                        <View style={styles.imagePickerButton}>
                            <Text style={styles.imagePickerButtonText}>
                                Seleccionar imagen
                            </Text>
                        </View>
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
    actionError,
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
            {actionError ? (
                <Text accessibilityRole="alert" style={styles.sectionPlaceholder}>
                    {actionError}
                </Text>
            ) : null}
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