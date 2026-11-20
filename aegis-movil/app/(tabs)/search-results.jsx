import { useLocalSearchParams } from "expo-router";
import SearchCatalog from "../../src/views/start/SearchCatalog";

export default function SearchResultsTab() {
    const { q } = useLocalSearchParams();
    const query = Array.isArray(q) ? q[0] : q || "";

    return <SearchCatalog initialQuery={query} showBackButton />;
}
