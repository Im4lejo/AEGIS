import { useLocalSearchParams } from "expo-router";
import SearchCatalog from "../../assets/components/Start/SearchCatalog";

export default function SearchResultsTab() {
    const { q } = useLocalSearchParams();
    const query = Array.isArray(q) ? q[0] : q || "";

    return <SearchCatalog initialQuery={query} showBackButton />;
}
