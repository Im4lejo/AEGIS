
import axios from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://aegis/api";

const API = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

export function getApiErrorMessage(error) {
    if (!error?.response) {
        return "No se pudo conectar con la API. Verifica que el servidor esté iniciado y que la URL configurada sea accesible desde el teléfono.";
    }

    const validationMessage = Object.values(error.response.data?.errors || {})
        .flat()
        .find((message) => typeof message === "string");
    if (validationMessage) {
        return validationMessage;
    }

    if (typeof error.response.data?.message === "string") {
        return error.response.data.message;
    }

    return `La API respondió con el error HTTP ${error.response.status}.`;
}

// Consultas existentes
export const getCategories = () => API.get("/categorias");

export const getProducts = (params) => API.get("/productos", { params });

export const getUniqueProduct = (id) => {
    return API.get(`/productos/${id}`);
};

export const createProduct = (productData, token) => {
    const headers = {
        "Content-Type": "multipart/form-data",
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return API.post("/productos", productData, { headers });
};

export const getForum = (params, token) => API.get("/foro", {
    params,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
});

export const createForumPost = (post, token) =>
    API.post("/foro", post, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
        },
    });

export const createForumComment = (postId, comment, token) =>
    API.post(`/foro/${postId}/comentarios`, comment, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

export const getUserProfile = (usuario, token) =>
    API.get(`/perfil/${usuario}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

export const updateOwnProfile = (profile, token) =>
    API.patch("/perfil/me", profile, {
        headers: { Authorization: `Bearer ${token}` },
    });

export const replaceProfileImage = (image, type, token) => {
    const formData = new FormData();
    formData.append("imagen", {
        uri: image.uri,
        name: image.fileName || `${type === "avatar" ? "profile" : "background"}.jpg`,
        type: image.mimeType || "image/jpeg",
    });

    return API.post(
        `/perfil/media/${type === "avatar" ? "avatar" : "portada"}`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        }
    );
};

// Autenticación
export const registerUser = (userData) => {
    return API.post("/register", userData);
};

export const loginUser = (credentials) => {
    return API.post("/login", credentials);
};

export const logoutUser = (token) => {
    return API.post(
        "/logout",
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
};

export default API;
