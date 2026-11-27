import { useEffect, useMemo, useState } from "react";
import {
    createForumComment,
    createForumPost,
    getApiErrorMessage,
    getForum,
} from "../../models/api/apiClient";
import {
    mapForumComment,
    mapForumPost,
} from "../../models/forum/forumPostMapper";
import { useAuth } from "../auth/AuthContext";

const sortOptions = ["Más recientes", "Más populares"];

function getAttachmentFileName(asset, index) {
    if (asset.fileName || asset.file?.name) {
        return asset.fileName || asset.file.name;
    }

    const extension = asset.uri.split(".").pop()?.split("?")[0] || "jpg";
    return `foro-${index + 1}.${extension}`;
}

function getAttachmentMimeType(asset) {
    if (asset.mimeType || asset.file?.type) {
        return asset.mimeType || asset.file.type;
    }

    const extension = getAttachmentFileName(asset, 0).split(".").pop().toLowerCase();
    return {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
    }[extension] || "image/jpeg";
}

export default function useForumViewModel() {
    const { token } = useAuth();
    const [posts, setPosts] = useState([]);
    const [likedPosts, setLikedPosts] = useState({});
    const [search, setSearch] = useState("");
    const [draft, setDraft] = useState("");
    const [sortBy, setSortBy] = useState(sortOptions[0]);
    const [showSortOptions, setShowSortOptions] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isPublishing, setIsPublishing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let isCurrent = true;

        const loadForum = async () => {
            try {
                const response = await getForum({ per_page: 50 }, token);
                if (isCurrent) {
                    setPosts((response.data?.data || []).map(mapForumPost));
                }
            } catch (error) {
                if (isCurrent) {
                    setErrorMessage(getApiErrorMessage(error));
                }
            } finally {
                if (isCurrent) {
                    setIsLoading(false);
                }
            }
        };

        loadForum();

        return () => {
            isCurrent = false;
        };
    }, [token]);

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

    const publishPost = async (attachments = []) => {
        const content = draft.trim();
        if (!content || isPublishing) {
            return false;
        }
        if (!token) {
            setErrorMessage("Inicia sesión para publicar en el foro.");
            return false;
        }

        setErrorMessage("");
        setIsPublishing(true);
        try {
            const formData = new FormData();
            formData.append("contenido", content);
            attachments.forEach((image, index) => {
                const file = image.file || {
                    uri: image.uri,
                    name: getAttachmentFileName(image, index),
                    type: getAttachmentMimeType(image),
                };
                formData.append("imagenes[]", file);
            });

            const response = await createForumPost(formData, token);
            setPosts((currentPosts) => [
                mapForumPost(response.data.data),
                ...currentPosts,
            ]);
            setDraft("");
            return true;
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error));
            return false;
        } finally {
            setIsPublishing(false);
        }
    };

    const addComment = async (postId, content) => {
        if (!token) {
            setErrorMessage("Inicia sesión para comentar.");
            return false;
        }

        setErrorMessage("");
        try {
            const response = await createForumComment(
                postId,
                { comentario: content },
                token
            );
            const comment = mapForumComment(response.data.data);

            setPosts((currentPosts) => currentPosts.map((post) =>
                post.id === postId
                    ? {
                        ...post,
                        comments: post.comments + 1,
                        commentItems: [...post.commentItems, comment],
                    }
                    : post
            ));

            return true;
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error));
            return false;
        }
    };

    const toggleLike = (postId) => {
        setLikedPosts((currentLikes) => ({
            ...currentLikes,
            [postId]: !currentLikes[postId],
        }));
    };

    return {
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
    };
}
