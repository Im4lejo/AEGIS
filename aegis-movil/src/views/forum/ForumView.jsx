import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    BackHandler,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import useForumViewModel from "../../viewmodels/forum/useForumViewModel";
import { useAuth } from "../../viewmodels/auth/AuthContext";
import ForumPostCard, { ForumAvatar } from "./ForumPostCard";

const maxForumImages = 5;
const maxForumImageSize = 5 * 1024 * 1024;
const supportedImageTypes = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
};

function getImageMimeType(asset) {
    const mimeType = asset.mimeType || asset.file?.type;
    if (mimeType) {
        return mimeType.toLowerCase();
    }

    const source = asset.fileName || asset.uri;
    const extension = source.split(".").pop()?.split("?")[0]?.toLowerCase();
    return supportedImageTypes[extension] || "application/octet-stream";
}

function getImageFileName(asset, index) {
    if (asset.fileName) {
        return asset.fileName;
    }

    const extension = asset.uri.split(".").pop()?.split("?")[0] || "jpg";
    return `foro-${index + 1}.${extension}`;
}

export default function ForumView() {
    const { user } = useAuth();
    const {
        addComment,
        draft,
        errorMessage,
        isLoading,
        isPublishing,
        likedPosts,
        publishPost,
        search,
        setDraft,
        setSearch,
        setShowSortOptions,
        setSortBy,
        showSortOptions,
        sortBy,
        sortOptions,
        toggleLike,
        visiblePosts,
    } = useForumViewModel();
    const [isReelViewerVisible, setIsReelViewerVisible] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const [attachmentError, setAttachmentError] = useState("");
    const [isPickingAttachments, setIsPickingAttachments] = useState(false);

    useEffect(() => {
        if (!isReelViewerVisible) {
            return undefined;
        }

        const subscription = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                setIsReelViewerVisible(false);
                return true;
            }
        );

        return () => subscription.remove();
    }, [isReelViewerVisible]);

    const chooseAttachments = async () => {
        if (attachments.length >= maxForumImages) {
            setAttachmentError("Puedes adjuntar hasta 5 imágenes.");
            return;
        }

        setAttachmentError("");
        setIsPickingAttachments(true);
        try {
            const permission =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                setAttachmentError(
                    "Permite el acceso a tus fotos para adjuntar imágenes."
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsMultipleSelection: true,
                selectionLimit: maxForumImages - attachments.length,
                quality: 0.85,
            });

            if (result.canceled) {
                return;
            }

            const selectedImages = result.assets || [];
            const unsupportedType = selectedImages.some((image) =>
                !Object.values(supportedImageTypes).includes(getImageMimeType(image))
            );
            const oversizedImage = selectedImages.some(
                (image) => (image.fileSize ?? image.file?.size ?? 0) > maxForumImageSize
            );
            const validImages = selectedImages.filter((image) =>
                Object.values(supportedImageTypes).includes(getImageMimeType(image))
                && !((image.fileSize ?? image.file?.size ?? 0) > maxForumImageSize)
            );

            if (unsupportedType) {
                setAttachmentError("Solo se aceptan imágenes JPG, PNG o WEBP.");
            } else if (oversizedImage) {
                setAttachmentError("Cada imagen debe pesar máximo 5 MB.");
            }

            setAttachments((currentImages) => {
                const uniqueImages = new Map(
                    [...currentImages, ...validImages].map((image) => [
                        image.uri,
                        image,
                    ])
                );
                return Array.from(uniqueImages.values()).slice(0, maxForumImages);
            });
        } catch (error) {
            setAttachmentError(
                error?.message || "No se pudieron cargar las imágenes seleccionadas."
            );
        } finally {
            setIsPickingAttachments(false);
        }
    };

    const removeAttachment = (uri) => {
        setAttachments((currentImages) =>
            currentImages.filter((image) => image.uri !== uri)
        );
    };

    const submitPost = async () => {
        const published = await publishPost(attachments);
        if (published) {
            setAttachments([]);
            setAttachmentError("");
        }
    };

    return (
        <View style={styles.screen}>
            <View style={styles.topBar}>
                <View style={styles.brand}>
                    <MaterialCommunityIcons
                        name="shield"
                        size={27}
                        color="#1877f2"
                    />
                    <Text style={styles.brandName}>AEGIS</Text>
                </View>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={17} color="#596579" />
                    <TextInput
                        accessibilityLabel="Buscar en el foro"
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Buscar"
                        placeholderTextColor="#788397"
                        style={styles.searchInput}
                    />
                </View>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Notificaciones"
                    style={styles.headerButton}
                >
                    <Ionicons name="notifications-outline" size={21} color="#26344a" />
                </Pressable>
            </View>

            <ScrollView
                style={styles.feed}
                contentContainerStyle={styles.feedContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.reelSection}>
                    <View style={styles.sectionHeading}>
                        <Text style={styles.sectionTitle}>Reels</Text>
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => setIsReelViewerVisible(true)}
                        >
                            <Text style={styles.sectionLink}>Ver todo</Text>
                        </Pressable>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.reelList}
                    >
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Abrir reels de promociones de hardware"
                            onPress={() => setIsReelViewerVisible(true)}
                            style={styles.reelCard}
                        >
                            <View style={styles.reelCover}>
                                <MaterialCommunityIcons
                                    name="memory"
                                    size={43}
                                    color="#1877f2"
                                />
                                <View style={styles.reelPlayIcon}>
                                    <Ionicons name="play" size={14} color="#ffffff" />
                                </View>
                            </View>
                            <Text style={styles.reelTitle}>Promos de hardware</Text>
                            <Text style={styles.reelSubtitle}>Reels con IA</Text>
                        </Pressable>
                        <View style={styles.reelNotice}>
                            <Ionicons
                                name="images-outline"
                                size={23}
                                color="#75839a"
                            />
                            <Text style={styles.reelNoticeText}>
                                Las imágenes promocionales aparecerán aquí.
                            </Text>
                        </View>
                    </ScrollView>
                </View>

                <View style={styles.composer}>
                    <View style={styles.composerTopRow}>
                        <ForumAvatar uri={user?.foto_perfil_url} size={42} />
                        <TextInput
                            accessibilityLabel="Escribe una publicación"
                            value={draft}
                            onChangeText={setDraft}
                            placeholder="¿Qué tienes en mente?"
                            placeholderTextColor="#788397"
                            style={styles.composerInput}
                            onSubmitEditing={submitPost}
                            returnKeyType="send"
                            multiline
                            maxLength={5000}
                        />
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Publicar"
                            disabled={!draft.trim() || isPublishing}
                            onPress={submitPost}
                            style={styles.publishButton}
                        >
                            {isPublishing ? (
                                <ActivityIndicator size="small" color="#1877f2" />
                            ) : (
                                <Ionicons name="send" size={19} color="#1877f2" />
                            )}
                        </Pressable>
                    </View>
                    <View style={styles.attachmentToolbar}>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Adjuntar imágenes"
                            disabled={isPickingAttachments}
                            onPress={chooseAttachments}
                            style={styles.attachButton}
                        >
                            {isPickingAttachments ? (
                                <ActivityIndicator size="small" color="#27834a" />
                            ) : (
                                <Ionicons
                                    name="image-outline"
                                    size={19}
                                    color="#27834a"
                                />
                            )}
                            <Text style={styles.attachButtonText}>Foto</Text>
                        </Pressable>
                        <Text style={styles.attachmentCount}>
                            {attachments.length}/{maxForumImages}
                        </Text>
                    </View>
                    {attachments.length ? (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.attachmentList}
                        >
                            {attachments.map((image) => (
                                <View key={image.uri} style={styles.attachmentPreview}>
                                    <Image
                                        source={{ uri: image.uri }}
                                        style={styles.attachmentImage}
                                    />
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel="Quitar imagen adjunta"
                                        onPress={() => removeAttachment(image.uri)}
                                        style={styles.removeAttachmentButton}
                                    >
                                        <Ionicons
                                            name="close"
                                            size={15}
                                            color="#ffffff"
                                        />
                                    </Pressable>
                                </View>
                            ))}
                        </ScrollView>
                    ) : null}
                    {attachmentError ? (
                        <Text style={styles.attachmentError}>{attachmentError}</Text>
                    ) : null}
                </View>

                {errorMessage ? (
                    <View style={styles.errorBanner}>
                        <Ionicons name="alert-circle-outline" size={18} color="#b42318" />
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                ) : null}

                <View style={styles.sortRow}>
                    <Text style={styles.feedHeading}>Publicaciones</Text>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Ordenar: ${sortBy}`}
                        onPress={() => setShowSortOptions((visible) => !visible)}
                        style={styles.sortButton}
                    >
                        <Ionicons name="options-outline" size={15} color="#344159" />
                        <Text style={styles.sortValue}>{sortBy}</Text>
                        <Ionicons
                            name={showSortOptions ? "chevron-up" : "chevron-down"}
                            size={13}
                            color="#35425a"
                        />
                    </Pressable>
                </View>

                {showSortOptions ? (
                    <View style={styles.sortMenu}>
                        {sortOptions.map((option) => (
                            <Pressable
                                key={option}
                                accessibilityRole="button"
                                onPress={() => {
                                    setSortBy(option);
                                    setShowSortOptions(false);
                                }}
                                style={styles.sortOption}
                            >
                                <Text
                                    style={[
                                        styles.sortOptionText,
                                        option === sortBy && styles.selectedSortOption,
                                    ]}
                                >
                                    {option}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                ) : null}

                {isLoading ? (
                    <View style={styles.emptyState}>
                        <ActivityIndicator size="large" color="#1877f2" />
                        <Text style={styles.emptyStateText}>
                            Cargando publicaciones...
                        </Text>
                    </View>
                ) : visiblePosts.length ? (
                    visiblePosts.map((post) => (
                        <ForumPostCard
                            key={post.id}
                            post={post}
                            liked={!!likedPosts[post.id]}
                            onToggleLike={toggleLike}
                            onCreateComment={addComment}
                        />
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons
                            name="chatbubbles-outline"
                            size={31}
                            color="#8993a4"
                        />
                        <Text style={styles.emptyStateText}>
                            {search.trim()
                                ? "No hay publicaciones que coincidan con tu búsqueda."
                                : "Aún no hay publicaciones. ¡Comparte la primera!"}
                        </Text>
                    </View>
                )}
            </ScrollView>

            {isReelViewerVisible ? (
                <View
                    accessibilityViewIsModal
                    style={styles.reelOverlay}
                >
                    <View style={styles.reelOverlayHeader}>
                        <View>
                            <Text style={styles.reelOverlayTitle}>Reels</Text>
                            <Text style={styles.reelOverlaySubtitle}>
                                Promociones de hardware
                            </Text>
                        </View>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Cerrar reels"
                            onPress={() => setIsReelViewerVisible(false)}
                            style={styles.closeReelsButton}
                        >
                            <Ionicons name="close" size={24} color="#ffffff" />
                        </Pressable>
                    </View>
                    <View style={styles.reelEmptyState}>
                        <View style={styles.reelEmptyIcon}>
                            <MaterialCommunityIcons
                                name="memory"
                                size={48}
                                color="#8bbcff"
                            />
                        </View>
                        <Text style={styles.reelEmptyTitle}>
                            Próximamente
                        </Text>
                        <Text style={styles.reelEmptyText}>
                            Este espacio mostrará promociones de hardware con imágenes
                            generadas por IA cuando estén disponibles.
                        </Text>
                    </View>
                    <View style={styles.reelProgressTrack}>
                        <View style={styles.reelProgressEmpty} />
                    </View>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        position: "relative",
        backgroundColor: "#f0f2f5",
    },
    topBar: {
        minHeight: 58,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 14,
        backgroundColor: "#ffffff",
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#d8dce2",
    },
    brand: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    brandName: {
        color: "#1877f2",
        fontSize: 16,
        fontWeight: "900",
        letterSpacing: 0.2,
    },
    searchBox: {
        flex: 1,
        height: 37,
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        paddingHorizontal: 11,
        borderRadius: 20,
        backgroundColor: "#f0f2f5",
    },
    searchInput: {
        flex: 1,
        color: "#26344a",
        fontSize: 13,
        paddingVertical: 0,
    },
    headerButton: {
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 18,
        backgroundColor: "#f0f2f5",
    },
    feed: {
        flex: 1,
    },
    feedContent: {
        width: "100%",
        maxWidth: 760,
        alignSelf: "center",
        paddingBottom: 20,
    },
    reelSection: {
        marginBottom: 9,
        paddingTop: 12,
        paddingBottom: 12,
        backgroundColor: "#ffffff",
    },
    sectionHeading: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        paddingBottom: 9,
    },
    sectionTitle: {
        color: "#17243a",
        fontSize: 17,
        fontWeight: "800",
    },
    sectionLink: {
        color: "#1877f2",
        fontSize: 12,
        fontWeight: "700",
    },
    reelList: {
        gap: 9,
        paddingHorizontal: 14,
    },
    reelCard: {
        width: 124,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#e1e5eb",
        borderRadius: 12,
        backgroundColor: "#ffffff",
    },
    reelCover: {
        height: 105,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#eaf2ff",
    },
    reelPlayIcon: {
        position: "absolute",
        right: 8,
        bottom: 8,
        width: 25,
        height: 25,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 13,
        backgroundColor: "#1877f2",
    },
    reelTitle: {
        marginTop: 8,
        paddingHorizontal: 8,
        color: "#1d2939",
        fontSize: 11,
        fontWeight: "800",
    },
    reelSubtitle: {
        marginTop: 2,
        marginBottom: 8,
        paddingHorizontal: 8,
        color: "#7a8698",
        fontSize: 10,
    },
    reelNotice: {
        width: 150,
        minHeight: 157,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "#d4dbe6",
        borderRadius: 12,
        backgroundColor: "#f8fafc",
    },
    reelNoticeText: {
        color: "#748197",
        fontSize: 11,
        lineHeight: 15,
        textAlign: "center",
    },
    composer: {
        minHeight: 100,
        marginBottom: 9,
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 8,
        backgroundColor: "#ffffff",
    },
    composerTopRow: {
        minHeight: 48,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    composerInput: {
        flex: 1,
        maxHeight: 100,
        minHeight: 40,
        paddingHorizontal: 13,
        paddingVertical: 9,
        borderRadius: 21,
        backgroundColor: "#f0f2f5",
        color: "#25334b",
        fontSize: 13,
    },
    attachmentToolbar: {
        minHeight: 39,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 8,
        paddingTop: 7,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "#d8dce2",
    },
    attachButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 5,
        paddingRight: 10,
    },
    attachButtonText: {
        color: "#445168",
        fontSize: 12,
        fontWeight: "700",
    },
    attachmentCount: {
        color: "#7a8698",
        fontSize: 11,
    },
    attachmentList: {
        gap: 8,
        paddingVertical: 7,
    },
    attachmentPreview: {
        position: "relative",
        width: 76,
        height: 76,
    },
    attachmentImage: {
        width: "100%",
        height: "100%",
        borderRadius: 8,
        backgroundColor: "#e5eaf1",
    },
    removeAttachmentButton: {
        position: "absolute",
        top: 4,
        right: 4,
        width: 22,
        height: 22,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 11,
        backgroundColor: "rgba(16, 24, 39, 0.78)",
    },
    attachmentError: {
        marginTop: 5,
        color: "#b42318",
        fontSize: 11,
    },
    publishButton: {
        width: 37,
        height: 37,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 19,
        backgroundColor: "#e8f1ff",
    },
    errorBanner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginHorizontal: 12,
        marginBottom: 8,
        padding: 10,
        borderRadius: 8,
        backgroundColor: "#fff1f0",
    },
    errorText: {
        flex: 1,
        color: "#912018",
        fontSize: 12,
    },
    sortRow: {
        minHeight: 44,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        backgroundColor: "#ffffff",
    },
    feedHeading: {
        color: "#17243a",
        fontSize: 15,
        fontWeight: "800",
    },
    sortButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingVertical: 8,
        paddingHorizontal: 9,
        borderRadius: 7,
        backgroundColor: "#f0f2f5",
    },
    sortValue: {
        color: "#344159",
        fontSize: 11,
    },
    sortMenu: {
        alignSelf: "flex-end",
        zIndex: 1,
        minWidth: 150,
        marginRight: 12,
        marginBottom: 7,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: "#ffffff",
        elevation: 3,
        shadowColor: "#15223b",
        shadowOpacity: 0.12,
        shadowRadius: 8,
    },
    sortOption: {
        paddingHorizontal: 12,
        paddingVertical: 9,
    },
    sortOptionText: {
        color: "#48546a",
        fontSize: 12,
    },
    selectedSortOption: {
        color: "#1877f2",
        fontWeight: "700",
    },
    emptyState: {
        minHeight: 145,
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        paddingHorizontal: 22,
        paddingVertical: 28,
        backgroundColor: "#ffffff",
    },
    emptyStateText: {
        color: "#7a8493",
        fontSize: 13,
        textAlign: "center",
    },
    reelOverlay: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 20,
        elevation: 20,
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 24,
        backgroundColor: "#101827",
    },
    reelOverlayHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    reelOverlayTitle: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "800",
    },
    reelOverlaySubtitle: {
        marginTop: 3,
        color: "#a9b5c8",
        fontSize: 12,
    },
    closeReelsButton: {
        width: 39,
        height: 39,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20,
        backgroundColor: "#28364a",
    },
    reelEmptyState: {
        alignItems: "center",
        paddingHorizontal: 20,
    },
    reelEmptyIcon: {
        width: 88,
        height: 88,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 18,
        borderRadius: 44,
        backgroundColor: "#1e314d",
    },
    reelEmptyTitle: {
        marginBottom: 8,
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "800",
    },
    reelEmptyText: {
        maxWidth: 300,
        color: "#bac5d5",
        fontSize: 13,
        lineHeight: 19,
        textAlign: "center",
    },
    reelProgressTrack: {
        height: 3,
        overflow: "hidden",
        borderRadius: 2,
        backgroundColor: "#334155",
    },
    reelProgressEmpty: {
        width: 0,
        height: "100%",
        backgroundColor: "#8bbcff",
    },
});
