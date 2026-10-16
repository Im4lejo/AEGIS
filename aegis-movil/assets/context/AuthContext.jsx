
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    deleteAuthToken,
    getAuthToken,
} from "./authTokenStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isLogged, setLog] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const restoreSession = async () => {
            try {
                const token = await getAuthToken();

                setLog(!!token);
            } catch (error) {
                console.error("Error recuperando la sesión:", error);
                setLog(false);
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
    }, []);

    const logout = async () => {
        try {
            await deleteAuthToken();
        } finally {
            setLog(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isLogged,
                setLog,
                isLoading,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (context === null) {
        throw new Error(
            "useAuth must be used within an AuthProvider"
        );
    }

    return context;
}
