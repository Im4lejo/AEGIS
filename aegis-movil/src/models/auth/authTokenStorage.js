import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";

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

export async function getAuthUser() {
    const storedUser = Platform.OS === "web"
        ? getWebStorage().getItem(USER_KEY)
        : await SecureStore.getItemAsync(USER_KEY);

    return storedUser ? JSON.parse(storedUser) : null;
}

export async function setAuthUser(user) {
    const serializedUser = JSON.stringify(user);

    if (Platform.OS === "web") {
        getWebStorage().setItem(USER_KEY, serializedUser);
        return;
    }

    await SecureStore.setItemAsync(USER_KEY, serializedUser);
}

export async function deleteAuthToken() {
    if (Platform.OS === "web") {
        getWebStorage().removeItem(TOKEN_KEY);
        return;
    }

    await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function deleteAuthUser() {
    if (Platform.OS === "web") {
        getWebStorage().removeItem(USER_KEY);
        return;
    }

    await SecureStore.deleteItemAsync(USER_KEY);
}
