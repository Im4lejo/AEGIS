import axios from "axios";

const API = axios.create({
    baseURL: "http://aegis/api"
});
export const getCategories = () => {
    return API.get("/categorias");
};