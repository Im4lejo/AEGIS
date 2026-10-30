import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App({ children }) {
    return (
        <SafeAreaProvider>
            {children}
        </SafeAreaProvider>
    );
}
