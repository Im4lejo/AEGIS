import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

export default function App({ children }) {
    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1 }}>
                {children}
            </SafeAreaView>
        </SafeAreaProvider>
    );
}
