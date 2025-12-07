import React, { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

/**
 * User/Auth Context
 * - Provides { user, loading } across the app
 * - Use <UserProvider> high in your component tree (e.g., around <Routes>)
 * - Access with useUser()
 */

export const UserContext = createContext({ user: null, loading: true });

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

/**
 * Route Guard
 * - Wrap protected routes/components with <RequireAuth>
 * - Redirects unauthenticated users to /auth/signin
 */
export function RequireAuth({ children }) {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container" style={{ padding: "2rem" }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  return children;
}
