import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../src/viewmodels/auth/AuthContext";

export default function AuthLayout() {
    const { isLogged, isLoading } = useAuth();

    if (isLoading) {
        return null;
    }

    if (isLogged) {
        return <Redirect href="/(tabs)" />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}
