import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    createForumComment,
    getApiErrorMessage,
    getUserProfile,
    replaceProfileImage,
} from "../../models/api/apiClient";
import { mapForumPost } from "../../models/forum/forumPostMapper";
import { useAuth } from "../auth/AuthContext";

export default function useProfileViewModel(userId, isOwnProfile) {
    const { token, updateUser } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(Boolean(userId));
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [actionError, setActionError] = useState("");
    const [likedPosts, setLikedPosts] = useState({});
    const requestId = useRef(0);

    const refresh = useCallback(async (pullToRefresh = false) => {
        if (!userId) {
            setProfileData(null);
            setIsLoading(false);
            setIsRefreshing(false);
            return false;
        }

        const currentRequestId = ++requestId.current;
        if (pullToRefresh) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }
        setErrorMessage("");

        try {
            const profileResponse = await getUserProfile(userId, token);
            const data = profileResponse.data?.data;
            if (!data?.perfil) {
                throw new Error("La API no devolvió los datos del perfil.");
            }

            if (requestId.current === currentRequestId) {
                setProfileData(data);
                if (isOwnProfile) {
                    await updateUser(data.perfil);
                }
            }
            return true;
        } catch (error) {
            if (requestId.current === currentRequestId) {
                setErrorMessage(error?.response
                    ? getApiErrorMessage(error)
                    : error?.message || getApiErrorMessage(error));
            }
            return false;
        } finally {
            if (requestId.current === currentRequestId) {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        }
    }, [isOwnProfile, token, updateUser, userId]);

    useEffect(() => {
        refresh();
        return () => {
            requestId.current += 1;
        };
    }, [refresh]);

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

    const uploadProfileImage = async (image, type) => {
        if (!token) {
            setActionError("Inicia sesión para cambiar la imagen del perfil.");
            return false;
        }

        setActionError("");
        try {
            const response = await replaceProfileImage(image, type, token);
            const url = response.data?.data?.url;
            if (!url) {
                throw new Error("La API no devolvió la URL de la imagen.");
            }

            const field = type === "avatar" ? "foto_perfil_url" : "img_background_url";
            setProfileData((currentData) => currentData
                ? {
                    ...currentData,
                    perfil: { ...currentData.perfil, [field]: url },
                }
                : currentData);
            await updateUser({ [field]: url });
            await refresh(true);
            return true;
        } catch (error) {
            setActionError(error?.response
                ? getApiErrorMessage(error)
                : error?.message || getApiErrorMessage(error));
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
        isRefreshing,
        likedPosts,
        profile: profileData?.perfil || null,
        products: profileData?.productos || [],
        publications,
        refresh,
        toggleLike,
        uploadProfileImage,
    };
}
