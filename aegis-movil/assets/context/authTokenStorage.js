import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "authToken";

function getWebStorage() {
    if (typeof window === "undefined" || !window.localStorage) {
        throw new Error("El almacenamiento local no está disponible en este navegador.");
    }

    return window.localStorage;
}

export async function getAuthToken() {
    if (Platform.OS === "web") {
        return getWebStorage().getItem(TOKEN_KEY);
    }

    return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setAuthToken(token) {
    if (Platform.OS === "web") {
        getWebStorage().setItem(TOKEN_KEY, token);
        return;
    }

    await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function deleteAuthToken() {
    if (Platform.OS === "web") {
        getWebStorage().removeItem(TOKEN_KEY);
        return;
    }

    await SecureStore.deleteItemAsync(TOKEN_KEY);
}
