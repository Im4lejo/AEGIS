import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import App from "../App";
import { AuthProvider } from "../assets/context/AuthContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    useEffect(() => {
        const hideSplash = async () => {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            await SplashScreen.hideAsync();
        };

        hideSplash();
    }, []);

    return (
        <AuthProvider>
            <App>
                <Stack
                    initialRouteName="index"
                    screenOptions={{ headerShown: false }}
                >
                    <Stack.Screen name="index" />
                    <Stack.Screen name="auth" />
                    <Stack.Screen name="settings" />
                    <Stack.Screen name="(tabs)" />
                </Stack>
            </App>
        </AuthProvider>
    );
}
