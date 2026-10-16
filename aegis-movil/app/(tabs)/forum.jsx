import { useMemo, useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const initialPosts = [
    {
        id: "post-1",
        author: "TheDarkMoon7456",
        age: "Hace 2 h",
        title: "¿Alguien sabe si mi GTX 1050 puede correr Cyberpunk 2077 al ultra?",
        body: "He visto varios videos y quiero asegurarme antes de comprarlo. Tengo un i5 y 16GB de RAM.",
        question: "¿Alguna sugerencia sobre rendimiento?",
        likes: 892,
        comments: 2,
    },
    {
        id: "post-2",
        author: "TheDarkMoon7456",
        age: "Hace 5 h",
        title: "¿Alguien sabe cómo arreglar mi PC? Se queda en pantalla azul (BSOD) constantemente y no arranca.",
        body: "Your PC ran into a problem and needs to restart. We're just collecting some error info, and then we'll restart for you.",
        likes: 341,
        comments: 1,
        hasImage: true,
    },
    {
        id: "post-3",
        author: "NovaKatana",
        age: "Hace 1 d",
        title: "¿Qué periféricos recomiendan para empezar a hacer streaming?",
        body: "Busco opciones buenas y económicas para mejorar mi setup.",
        likes: 126,
        comments: 8,
    },
];

const sortOptions = ["Más recientes", "Más populares"];

function ForumPost({ post, liked, onToggleLike }) {
    return (
        <View style={styles.postCard}>
            <View style={styles.postHeader}>
                <View style={styles.authorAvatar}>
                    <Ionicons name="person" size={19} color="#535b66" />
                </View>
                <View style={styles.authorInfo}>
                    <Text style={styles.authorName}>{post.author}</Text>
                    <Text style={styles.postAge}>{post.age}</Text>
                </View>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Guardar publicación"
                    hitSlop={8}
                    style={styles.postFlag}
                >
                    <Ionicons name="bookmark-outline" size={17} color="#9aa3b2" />
                </Pressable>
            </View>

            <Text style={styles.postTitle}>{post.title}</Text>
            {post.body ? <Text style={styles.postBody}>{post.body}</Text> : null}

            {post.hasImage ? (
                <View style={styles.previewImage}>
                    <Text style={styles.previewFace}>:(</Text>
                    <Text style={styles.previewHeading}>
                        Your PC ran into a problem and needs to restart.
                    </Text>
                    <Text style={styles.previewCaption}>
                        For more information about this issue and possible fixes, visit
                        {"\n"}https://www.windows.com/stopcode
                    </Text>
                    <Text style={styles.previewProgress}>15% complete</Text>
                </View>
            ) : null}

            {post.question ? <Text style={styles.postQuestion}>{post.question}</Text> : null}

            <View style={styles.postActions}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={liked ? "Quitar Me gusta" : "Dar Me gusta"}
                    onPress={() => onToggleLike(post.id)}
                    style={styles.postAction}
                >
                    <Ionicons
                        name={liked ? "heart" : "heart-outline"}
                        size={17}
                        color={liked ? "#2879dd" : "#687386"}
                    />
                    <Text style={[styles.postActionText, liked && styles.likedText]}>
                        {post.likes + (liked ? 1 : 0)} Likes
                    </Text>
                </Pressable>
                <Pressable
                    accessibilityRole="button"
                    style={styles.postAction}
                >
                    <Ionicons name="chatbubble-outline" size={16} color="#687386" />
                    <Text style={styles.postActionText}>
                        {post.comments} Comentarios
                    </Text>
                </Pressable>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Compartir publicación"
                    style={styles.shareAction}
                >
                    <Ionicons name="share-social-outline" size={16} color="#687386" />
                </Pressable>
            </View>
        </View>
    );
}

export default function ForumTab() {
    const [posts, setPosts] = useState(initialPosts);
    const [likedPosts, setLikedPosts] = useState({});
    const [search, setSearch] = useState("");
    const [draft, setDraft] = useState("");
    const [sortBy, setSortBy] = useState(sortOptions[0]);
    const [showSortOptions, setShowSortOptions] = useState(false);

    const visiblePosts = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();
        const filteredPosts = posts.filter((post) =>
            `${post.author} ${post.title} ${post.body}`
                .toLowerCase()
                .includes(normalizedSearch)
        );

        if (sortBy === "Más populares") {
            return [...filteredPosts].sort((a, b) => b.likes - a.likes);
        }

        return filteredPosts;
    }, [posts, search, sortBy]);

    const publishPost = () => {
        const title = draft.trim();
        if (!title) {
            return;
        }

        setPosts((currentPosts) => [
            {
                id: `post-${Date.now()}`,
                author: "Luis Alejandro",
                age: "Ahora",
                title,
                body: "",
                likes: 0,
                comments: 0,
            },
            ...currentPosts,
        ]);
        setDraft("");
    };

    const toggleLike = (postId) => {
        setLikedPosts((currentLikes) => ({
            ...currentLikes,
            [postId]: !currentLikes[postId],
        }));
    };

    return (
        <View style={styles.screen}>
            <View style={styles.topBar}>
                <View style={styles.brand}>
                    <MaterialCommunityIcons
                        name="shield"
                        size={22}
                        color="#ffffff"
                    />
                    <Text style={styles.brandName}>AEGIS</Text>
                </View>
                <View style={styles.searchBox}>
                    <TextInput
                        accessibilityLabel="Buscar en el foro"
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Buscar en el foro..."
                        placeholderTextColor="#8a95a4"
                        style={styles.searchInput}
                    />
                    <Ionicons name="search" size={16} color="#778396" />
                </View>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Abrir menú"
                    style={styles.menuButton}
                >
                    <Ionicons name="menu" size={22} color="#ffffff" />
                </Pressable>
            </View>

            <ScrollView
                style={styles.feed}
                contentContainerStyle={styles.feedContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.composer}>
                    <View style={styles.composerIcon}>
                        <Ionicons name="person" size={18} color="#ffffff" />
                    </View>
                    <TextInput
                        accessibilityLabel="Escribe una publicación"
                        value={draft}
                        onChangeText={setDraft}
                        placeholder="Publica aquí..."
                        placeholderTextColor="#8b91a0"
                        style={styles.composerInput}
                        onSubmitEditing={publishPost}
                        returnKeyType="send"
                    />
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Publicar"
                        onPress={publishPost}
                        style={styles.publishButton}
                    >
                        <Ionicons name="add" size={23} color="#8c35e8" />
                    </Pressable>
                </View>

                <View style={styles.sortRow}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Ordenar: ${sortBy}`}
                        onPress={() => setShowSortOptions((visible) => !visible)}
                        style={styles.sortButton}
                    >
                        <Text style={styles.sortLabel}>Ordenar por</Text>
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

                {visiblePosts.length ? (
                    visiblePosts.map((post) => (
                        <ForumPost
                            key={post.id}
                            post={post}
                            liked={!!likedPosts[post.id]}
                            onToggleLike={toggleLike}
                        />
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="search-outline" size={28} color="#8993a4" />
                        <Text style={styles.emptyStateText}>
                            No hay publicaciones que coincidan con tu búsqueda.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#f3f5f8",
    },
    topBar: {
        minHeight: 54,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 14,
        backgroundColor: "#102b4f",
    },
    brand: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    brandName: {
        color: "#ffffff",
        fontSize: 13,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
    searchBox: {
        flex: 1,
        height: 34,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        borderRadius: 18,
        backgroundColor: "#ffffff",
    },
    searchInput: {
        flex: 1,
        color: "#29364b",
        fontSize: 12,
        paddingVertical: 0,
    },
    menuButton: {
        width: 32,
        height: 34,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.45)",
        borderRadius: 5,
    },
    feed: {
        flex: 1,
    },
    feedContent: {
        width: "100%",
        maxWidth: 760,
        alignSelf: "center",
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 24,
    },
    composer: {
        minHeight: 48,
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
        paddingHorizontal: 9,
        borderWidth: 1,
        borderColor: "#d4d9e2",
        borderRadius: 12,
        backgroundColor: "#ffffff",
        elevation: 1,
    },
    composerIcon: {
        width: 25,
        height: 25,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 13,
        backgroundColor: "#e8ebf0",
    },
    composerInput: {
        flex: 1,
        minHeight: 40,
        color: "#29364b",
        fontSize: 13,
    },
    publishButton: {
        width: 30,
        height: 30,
        alignItems: "center",
        justifyContent: "center",
        borderLeftWidth: 1,
        borderLeftColor: "#ececf1",
    },
    sortRow: {
        minHeight: 42,
        alignItems: "flex-end",
        justifyContent: "center",
        paddingRight: 4,
    },
    sortButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    sortLabel: {
        color: "#344159",
        fontSize: 10,
        fontWeight: "700",
        textTransform: "uppercase",
    },
    sortValue: {
        color: "#344159",
        fontSize: 10,
    },
    sortMenu: {
        alignSelf: "flex-end",
        zIndex: 1,
        minWidth: 130,
        marginBottom: 8,
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
        color: "#2879dd",
        fontWeight: "700",
    },
    postCard: {
        marginBottom: 10,
        paddingHorizontal: 12,
        paddingTop: 11,
        paddingBottom: 9,
        borderWidth: 1,
        borderColor: "#e6e9ee",
        borderRadius: 11,
        backgroundColor: "#ffffff",
        elevation: 1,
        shadowColor: "#25334b",
        shadowOpacity: 0.04,
        shadowRadius: 4,
    },
    postHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    authorAvatar: {
        width: 29,
        height: 29,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
        borderRadius: 15,
        backgroundColor: "#d9dce1",
    },
    authorInfo: {
        flex: 1,
    },
    authorName: {
        color: "#101c31",
        fontSize: 11,
        fontWeight: "800",
    },
    postAge: {
        marginTop: 1,
        color: "#8a93a1",
        fontSize: 9,
    },
    postFlag: {
        padding: 4,
    },
    postTitle: {
        marginBottom: 4,
        color: "#111a2b",
        fontSize: 14,
        fontWeight: "800",
        lineHeight: 18,
    },
    postBody: {
        color: "#687386",
        fontSize: 11,
        lineHeight: 16,
    },
    postQuestion: {
        marginTop: 10,
        color: "#687386",
        fontSize: 11,
    },
    previewImage: {
        minHeight: 180,
        justifyContent: "center",
        marginTop: 8,
        padding: 17,
        borderRadius: 6,
        backgroundColor: "#0878d1",
    },
    previewFace: {
        marginBottom: 4,
        color: "#ffffff",
        fontSize: 37,
        fontWeight: "300",
    },
    previewHeading: {
        maxWidth: 280,
        color: "#ffffff",
        fontSize: 9,
        fontWeight: "600",
        lineHeight: 13,
    },
    previewCaption: {
        marginTop: 9,
        color: "#e5f3ff",
        fontSize: 7,
        lineHeight: 11,
    },
    previewProgress: {
        marginTop: 8,
        color: "#ffffff",
        fontSize: 8,
    },
    postActions: {
        minHeight: 29,
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 18,
        marginTop: 7,
    },
    postAction: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    postActionText: {
        color: "#596578",
        fontSize: 10,
    },
    likedText: {
        color: "#2879dd",
    },
    shareAction: {
        marginLeft: "auto",
        paddingHorizontal: 4,
    },
    emptyState: {
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 38,
    },
    emptyStateText: {
        color: "#7a8493",
        fontSize: 13,
        textAlign: "center",
    },
});
