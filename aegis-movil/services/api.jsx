
import axios from "axios";

const API = axios.create({
    baseURL: "http://aegis/api",
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

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
