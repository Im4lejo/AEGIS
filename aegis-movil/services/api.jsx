
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

    return `La API respondió con el error HTTP ${error.response.status}.`;
}

// Consultas existentes
export const getCategories = () => API.get("/categorias");

export const getProducts = (params) => API.get("/productos", { params });

export const getUniqueProduct = (id) => {
    return API.get(`/productos/${id}`);
};

export const getForum = () => API.get("/foro");

export const getUserProfile = (usuario) => {
    return API.get(`/perfil/${usuario}`);
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
