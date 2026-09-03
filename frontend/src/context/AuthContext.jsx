import { useCallback, useEffect, useState } from "react";
import api from "../api/api";
import AuthContext from "./authContext";

function getStoredUser() {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
        return null;
    }

    try {
        return JSON.parse(storedUser);
    } catch {
        localStorage.removeItem("user");
        return null;
    }
}

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => {
        return localStorage.getItem("token");
    });

    const [user, setUser] = useState(getStoredUser);

    const updateUser = useCallback((updatedUser) => {
        setUser(updatedUser);

        if (updatedUser) {
            localStorage.setItem(
                "user",
                JSON.stringify(updatedUser)
            );
        } else {
            localStorage.removeItem("user");
        }
    }, []);

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await api.get("/users/me");
                updateUser(response.data.user);
            } catch {
                updateUser(null);
            }
        }

        if (token) {
            fetchUser();
        }
    }, [token, updateUser]);

    function login(newToken, newUser) {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        updateUser(newUser);
    }

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    }

    const isAuthenticated = token !== null;
    const defaultCurrency = user?.default_currency || "USD";

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                defaultCurrency,
                login,
                logout,
                updateUser,
                isAuthenticated,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
