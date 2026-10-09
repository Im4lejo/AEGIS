import { Tabs, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Text } from "react-native";
import { useAuth } from "../../assets/context/AuthContext";

export default function TabLayout() {
    const router = useRouter();
    const { isLogged } = useAuth();
    const tabLabels = {
        index: "Inicio",
        settings: "Ajustes",
        profile: "Perfil",
        search: "Buscar",
        forum: "Foro",
    };

    const redirectUnauthenticated = (event) => {
        if (!isLogged) {
            event.preventDefault();
            router.replace("/auth");
        }
    };

    return (
        <Tabs
            screenOptions={({ route }) => ({
                tabBarLabel: ({ focused, color }) =>
                    focused ? (
                        <Text style={{ color, fontSize: 12 }}>
                            {tabLabels[route.name]}
                        </Text>
                    ) : null,
                tabBarIcon: ({ focused, color, size }) => {
                    if (route.name === "forum") {
                        return (
                            <MaterialCommunityIcons
                                name={focused ? "forum" : "forum-outline"}
                                size={size}
                                color={color}
                            />
                        );
                    }

                    let iconName;
                    if (route.name === "index") iconName = focused ? "home" : "home-outline";
                    else if (route.name === "settings") iconName = focused ? "settings" : "settings-outline";
                    else if (route.name === "profile") iconName = focused ? "person" : "person-outline";
                    else if (route.name === "search") iconName = focused ? "search" : "search-outline";
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
            <Tabs.Screen
                name="search"
                options={{ title: "Buscar" }}
                listeners={{ tabPress: redirectUnauthenticated }}
            />
            <Tabs.Screen
                name="forum"
                options={{ title: "Foro" }}
                listeners={{ tabPress: redirectUnauthenticated }}
            />
        </Tabs>
    );
}
