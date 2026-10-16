import { Redirect } from "expo-router";
import { useAuth } from "../assets/context/AuthContext";

export default function IndexRoute() {
    const { isLogged, isLoading } = useAuth();

    if (isLoading) {
        return null;
    }

    return <Redirect href={isLogged ? "/(tabs)" : "/auth"} />;
}
