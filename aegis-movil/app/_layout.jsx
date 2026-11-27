import { useEffect } from "react";
import { Stack } from "expo-router";
import Constants from "expo-constants";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaView } from "react-native-safe-area-context";
import App from "../App";
import { AuthProvider } from "../src/viewmodels/auth/AuthContext";

SplashScreen.preventAutoHideAsync();

if (Constants.appOwnership !== "expo") {
    SplashScreen.setOptions({
        duration: 1000,
        fade: true,
    });
}

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
                <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
                    <Stack
                        initialRouteName="index"
                        screenOptions={{ headerShown: false }}
                    >
                        <Stack.Screen name="index" />
                        <Stack.Screen name="auth" />
                        <Stack.Screen name="settings" />
                        <Stack.Screen name="product/[id]" />
                        <Stack.Screen name="profile/[id]" />
                        <Stack.Screen name="(tabs)" />
                    </Stack>
                </SafeAreaView>
            </App>
        </AuthProvider>
    );
}
