import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../assets/context/AuthContext";

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
