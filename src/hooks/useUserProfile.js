/**
 * useUserProfile Hook
 *
 * Custom React hook for fetching and subscribing to user profile data from Firestore
 * Provides real-time updates when the user profile changes
 *
 * Usage:
 *   const { profile, loading, error } = useUserProfile(userId);
 */

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export function useUserProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!userId) {
      return;
    }

    let isMounted = true;

    // Initialize loading state in effect for real-time subscription
    if (isMounted) {
      setLoading(true);
      setError(null);
    }

    // Set up real-time listener
    const userRef = doc(db, "users", userId);

    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (!isMounted) return;

        if (docSnap.exists()) {
          setProfile({ id: docSnap.id, ...docSnap.data() });
        } else {
          setProfile(null);
          setError("User profile not found");
        }
        setLoading(false);
      },
      (err) => {
        if (!isMounted) return;

        console.error("Error fetching user profile:", err);
        setError(err.message);
        setLoading(false);
      },
    );

    // Cleanup subscription on unmount
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [userId]);

  return { profile, loading, error };
}

/**
 * useCurrentUserProfile Hook
 *
 * Convenience hook that gets the current authenticated user's profile
 * Automatically uses the user from auth context
 *
 * Usage:
 *   const { profile, loading, error } = useCurrentUserProfile();
 */
export function useCurrentUserProfile() {
  const { user } = useUser();
  return useUserProfile(user?.uid);
}

// Note: Import useUser from authContext if needed
import { useUser } from "../lib/authContext";
