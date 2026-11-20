import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    Share,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export function ForumAvatar({ uri, size = 40 }) {
    if (uri) {
        return (
            <Image
                source={{ uri }}
                style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
            />
        );
    }

    return (
        <View
            style={[
                styles.avatar,
                styles.avatarFallback,
                { width: size, height: size, borderRadius: size / 2 },
            ]}
        >
            <Ionicons name="person" size={size * 0.52} color="#64748b" />
        </View>
    );
}

export default function ForumPostCard({
    post,
    liked,
    onToggleLike,
    onCreateComment,
}) {
    const [showComments, setShowComments] = useState(false);
    const [commentDraft, setCommentDraft] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    const submitComment = async () => {
        const content = commentDraft.trim();
        if (!content || isSubmittingComment) {
            return;
        }

        setIsSubmittingComment(true);
        const created = await onCreateComment(post.id, content);
        if (created) {
            setCommentDraft("");
        }
        setIsSubmittingComment(false);
    };

    const sharePost = () => Share.share({
        message: [post.title, post.body].filter(Boolean).join("\n\n"),
    });

    return (
        <View style={styles.postCard}>
            <View style={styles.postHeader}>
                <ForumAvatar uri={post.avatar} size={42} />
                <View style={styles.authorInfo}>
                    <Text style={styles.authorName}>{post.author}</Text>
                    <Text style={styles.postAge}>{post.age}</Text>
                </View>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Más opciones de la publicación"
                    hitSlop={8}
                    style={styles.moreButton}
                >
                    <Ionicons name="ellipsis-horizontal" size={21} color="#65738a" />
                </Pressable>
            </View>

            {post.title ? <Text style={styles.postTitle}>{post.title}</Text> : null}
            {post.body ? <Text style={styles.postBody}>{post.body}</Text> : null}
            {post.images.length ? (
                <View style={styles.postImageGrid}>
                    {post.images.map((image, index) => (
                        <Image
                            key={`${post.id}-${index}`}
                            source={{ uri: image }}
                            style={[
                                styles.postImage,
                                post.images.length === 1 && styles.singlePostImage,
                            ]}
                        />
                    ))}
                </View>
            ) : null}

            <View style={styles.postSummary}>
                <Text style={styles.summaryText}>
                    {post.likes + (liked ? 1 : 0)} Me gusta
                </Text>
                <Pressable
                    accessibilityRole="button"
                    onPress={() => setShowComments((visible) => !visible)}
                >
                    <Text style={styles.summaryText}>
                        {post.comments} comentarios
                    </Text>
                </Pressable>
            </View>

            <View style={styles.postActions}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={liked ? "Quitar Me gusta" : "Dar Me gusta"}
                    onPress={() => onToggleLike(post.id)}
                    style={styles.postAction}
                >
                    <Ionicons
                        name={liked ? "thumbs-up" : "thumbs-up-outline"}
                        size={19}
                        color={liked ? "#1877f2" : "#596579"}
                    />
                    <Text style={[styles.postActionText, liked && styles.likedText]}>
                        Me gusta
                    </Text>
                </Pressable>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Ver comentarios"
                    onPress={() => setShowComments((visible) => !visible)}
                    style={styles.postAction}
                >
                    <Ionicons name="chatbubble-outline" size={18} color="#596579" />
                    <Text style={styles.postActionText}>Comentar</Text>
                </Pressable>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Compartir publicación"
                    onPress={sharePost}
                    style={styles.postAction}
                >
                    <Ionicons name="arrow-redo-outline" size={19} color="#596579" />
                    <Text style={styles.postActionText}>Compartir</Text>
                </Pressable>
            </View>

            {showComments ? (
                <View style={styles.commentsSection}>
                    {post.commentItems.map((comment) => (
                        <View key={comment.id} style={styles.commentRow}>
                            <ForumAvatar uri={comment.avatar} size={30} />
                            <View style={styles.commentBubble}>
                                <Text style={styles.commentAuthor}>{comment.author}</Text>
                                <Text style={styles.commentText}>{comment.body}</Text>
                            </View>
                        </View>
                    ))}
                    <View style={styles.commentComposer}>
                        <TextInput
                            accessibilityLabel="Escribe un comentario"
                            value={commentDraft}
                            onChangeText={setCommentDraft}
                            placeholder="Escribe un comentario..."
                            placeholderTextColor="#8b95a5"
                            style={styles.commentInput}
                            maxLength={2000}
                            returnKeyType="send"
                            onSubmitEditing={submitComment}
                        />
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Enviar comentario"
                            disabled={!commentDraft.trim() || isSubmittingComment}
                            onPress={submitComment}
                            style={styles.commentSendButton}
                        >
                            {isSubmittingComment ? (
                                <ActivityIndicator size="small" color="#1877f2" />
                            ) : (
                                <Ionicons name="send" size={18} color="#1877f2" />
                            )}
                        </Pressable>
                    </View>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    avatar: {
        backgroundColor: "#e5eaf1",
    },
    avatarFallback: {
        alignItems: "center",
        justifyContent: "center",
    },
    postCard: {
        marginTop: 8,
        paddingHorizontal: 14,
        paddingTop: 13,
        paddingBottom: 7,
        backgroundColor: "#ffffff",
    },
    postHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    authorInfo: {
        flex: 1,
        marginLeft: 9,
    },
    authorName: {
        color: "#1c2a3e",
        fontSize: 13,
        fontWeight: "800",
    },
    postAge: {
        marginTop: 2,
        color: "#7b8797",
        fontSize: 10,
    },
    moreButton: {
        padding: 5,
    },
    postTitle: {
        marginBottom: 5,
        color: "#1d2939",
        fontSize: 15,
        fontWeight: "800",
        lineHeight: 21,
    },
    postBody: {
        color: "#28364a",
        fontSize: 14,
        lineHeight: 20,
    },
    postImageGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 5,
        marginTop: 9,
    },
    postImage: {
        width: "48%",
        height: 145,
        borderRadius: 5,
        backgroundColor: "#e5eaf1",
    },
    singlePostImage: {
        width: "100%",
        height: 230,
    },
    postSummary: {
        minHeight: 34,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 7,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#d8dce2",
    },
    summaryText: {
        color: "#687386",
        fontSize: 11,
    },
    postActions: {
        minHeight: 42,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#d8dce2",
    },
    postAction: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 9,
    },
    postActionText: {
        color: "#596579",
        fontSize: 11,
        fontWeight: "600",
    },
    likedText: {
        color: "#1877f2",
    },
    commentsSection: {
        paddingTop: 8,
        paddingBottom: 4,
    },
    commentRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 7,
        marginBottom: 8,
    },
    commentBubble: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 12,
        backgroundColor: "#f0f2f5",
    },
    commentAuthor: {
        marginBottom: 2,
        color: "#25334b",
        fontSize: 11,
        fontWeight: "800",
    },
    commentText: {
        color: "#354258",
        fontSize: 12,
        lineHeight: 17,
    },
    commentComposer: {
        minHeight: 39,
        flexDirection: "row",
        alignItems: "center",
        marginTop: 3,
        paddingLeft: 12,
        paddingRight: 5,
        borderRadius: 20,
        backgroundColor: "#f0f2f5",
    },
    commentInput: {
        flex: 1,
        paddingVertical: 8,
        color: "#25334b",
        fontSize: 12,
    },
    commentSendButton: {
        width: 31,
        height: 31,
        alignItems: "center",
        justifyContent: "center",
    },
});
