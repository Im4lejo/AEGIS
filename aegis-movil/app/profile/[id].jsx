import { useLocalSearchParams } from "expo-router";
import Profile from "../../src/views/start/Profile";

export default function UserProfileRoute() {
    const { id } = useLocalSearchParams();
    const profileId = Array.isArray(id) ? id[0] : id;

    return <Profile profileId={profileId} />;
}
