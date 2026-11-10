
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    deleteAuthToken,
    deleteAuthUser,
    getAuthUser,
    getAuthToken,
    setAuthUser,
    setAuthToken,
} from "./authTokenStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isLogged, setLog] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const restoreSession = async () => {
            try {
                const [storedToken, storedUser] = await Promise.all([
                    getAuthToken(),
                    getAuthUser(),
                ]);

                setToken(storedToken);
                setUser(storedToken ? storedUser : null);
                setLog(!!storedToken);
            } catch (error) {
                console.error("Error recuperando la sesión:", error);
                setToken(null);
                setUser(null);
                setLog(false);
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
    }, []);

    const login = async (authToken, authenticatedUser) => {
        await setAuthUser(authenticatedUser);
        await setAuthToken(authToken);
        setToken(authToken);
        setUser(authenticatedUser);
        setLog(true);
    };

    const logout = async () => {
        try {
            await Promise.all([deleteAuthToken(), deleteAuthUser()]);
        } finally {
            setToken(null);
            setUser(null);
            setLog(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isLogged,
                setLog,
                isLoading,
                token,
                user,
                login,
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
