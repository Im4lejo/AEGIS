
import {
    createContext,
    useContext,
    useEffect,
    useCallback,
    useRef,
    useState,
} from "react";

import {
    deleteAuthToken,
    deleteAuthUser,
    getAuthUser,
    getAuthToken,
    setAuthUser,
    setAuthToken,
} from "../../models/auth/authTokenStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isLogged, setLog] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const userRef = useRef(null);

    useEffect(() => {
        const restoreSession = async () => {
            try {
                const [storedToken, storedUser] = await Promise.all([
                    getAuthToken(),
                    getAuthUser(),
                ]);

                setToken(storedToken);
                setUser(storedToken ? storedUser : null);
                userRef.current = storedToken ? storedUser : null;
                setLog(!!storedToken);
            } catch (error) {
                console.error("Error recuperando la sesión:", error);
                setToken(null);
                setUser(null);
                userRef.current = null;
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
        userRef.current = authenticatedUser;
        setLog(true);
    };

    const logout = async () => {
        try {
            await Promise.all([deleteAuthToken(), deleteAuthUser()]);
        } finally {
            setToken(null);
            setUser(null);
            userRef.current = null;
            setLog(false);
        }
    };

    const updateUser = useCallback(async (userChanges) => {
        const updatedUser = { ...userRef.current, ...userChanges };
        await setAuthUser(updatedUser);
        userRef.current = updatedUser;
        setUser(updatedUser);
    }, []);

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
                updateUser,
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
