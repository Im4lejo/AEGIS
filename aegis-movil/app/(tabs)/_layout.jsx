import { Tabs, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "../../assets/context/AuthContext";

export default function TabLayout() {
    const router = useRouter();
    const { isLogged } = useAuth();

    const redirectUnauthenticated = (event) => {
        if (!isLogged) {
            event.preventDefault();
            router.replace("/auth");
        }
    };

    return (
        <Tabs
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === "index") iconName = focused ? "home" : "home-outline";
                    else if (route.name === "settings") iconName = focused ? "settings" : "settings-outline";
                    else if (route.name === "profile") iconName = focused ? "person" : "person-outline";
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: "#317df8",
                tabBarInactiveTintColor: "#94a3b8",
                headerShown: false,
            })}
        >
            <Tabs.Screen name="index" options={{ title: "Inicio" }} />
            <Tabs.Screen
                name="settings"
                options={{ title: "Ajustes" }}
                listeners={{ tabPress: redirectUnauthenticated }}
            />
            <Tabs.Screen
                name="profile"
                options={{ title: "Perfil" }}
                listeners={{ tabPress: redirectUnauthenticated }}
            />
        </Tabs>
    );
}
