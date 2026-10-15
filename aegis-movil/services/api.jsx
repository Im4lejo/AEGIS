import axios from "axios";

const API = axios.create({
    baseURL: "http://aegis/api"
});
export const getCategories = () => {
    return API.get("/categorias");
};
export const getProducts = () => {
    return API.get("/productos");
};
export const getUniqueProduct = (params) => {
    return API.get(`/productos/${ params }`, {
        params: params
    });
};
export const getForum = () => {
    return API.get("/categorias");
};
export const getUserProfile = () => {
    return API.get("/categorias");
};