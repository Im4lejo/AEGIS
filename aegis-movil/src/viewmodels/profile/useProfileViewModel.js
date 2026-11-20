import { useEffect, useMemo, useState } from "react";
import {
    createForumComment,
    getApiErrorMessage,
    getUserProfile,
} from "../../models/api/apiClient";
import { mapForumPost } from "../../models/forum/forumPostMapper";
import { useAuth } from "../auth/AuthContext";

export default function useProfileViewModel(userId) {
    const { token } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(Boolean(userId));
    const [errorMessage, setErrorMessage] = useState("");
    const [actionError, setActionError] = useState("");
    const [likedPosts, setLikedPosts] = useState({});

    useEffect(() => {
        let isActive = true;

        if (!userId) {
            setProfileData(null);
            setIsLoading(false);
            return () => {
                isActive = false;
            };
        }

        const loadProfile = async () => {
            setIsLoading(true);
            setErrorMessage("");

            try {
                const response = await getUserProfile(userId);
                const data = response.data?.data;
                if (!data) {
                    throw new Error("La API no devolvió los datos del perfil.");
                }

                if (isActive) {
                    setProfileData(data);
                }
            } catch (error) {
                if (isActive) {
                    setErrorMessage(getApiErrorMessage(error));
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        loadProfile();

        return () => {
            isActive = false;
        };
    }, [userId]);

    const publications = useMemo(
        () => (profileData?.publicaciones || []).map((post) =>
            mapForumPost(post, profileData?.perfil)
        ),
        [profileData]
    );

    const addComment = async (postId, content) => {
        if (!token) {
            setActionError("Inicia sesión para comentar.");
            return false;
        }

        setActionError("");
        try {
            const response = await createForumComment(
                postId,
                { comentario: content },
                token
            );
            setProfileData((currentData) => {
                if (!currentData) {
                    return currentData;
                }

                return {
                    ...currentData,
                    publicaciones: currentData.publicaciones.map((post) =>
                        post.id === postId
                            ? {
                                ...post,
                                comentarios_count: Number(post.comentarios_count || 0) + 1,
                                comentarios: [...(post.comentarios || []), response.data.data],
                            }
                            : post
                    ),
                };
            });

            return true;
        } catch (error) {
            setActionError(getApiErrorMessage(error));
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
        actionError,
        addComment,
        errorMessage,
        isLoading,
        likedPosts,
        products: profileData?.productos || [],
        publications,
        toggleLike,
    };
}
