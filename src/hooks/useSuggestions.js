/**
 * useSuggestions Hook
 *
 * Custom React hook for fetching AI-powered suggestions from Firestore
 * Provides personalized recommendations for portfolio improvements
 *
 * Usage:
 *   const { suggestions, loading, error } = useSuggestions(userId);
 */

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export function useSuggestions(userId, options = {}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    limitCount = 5,
    realtime = true,
    status = "active", // 'active', 'dismissed', 'completed'
  } = options;

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

    try {
      const suggestionsRef = collection(db, "suggestions");

      // Build query constraints
      const constraints = [
        where("userId", "==", userId),
        where("status", "==", status),
      ];

      constraints.push(orderBy("priority", "desc"));
      constraints.push(orderBy("createdAt", "desc"));
      constraints.push(limit(limitCount));

      const q = query(suggestionsRef, ...constraints);

      if (realtime) {
        // Set up real-time listener
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            if (!isMounted) return;

            const sugs = [];
            snapshot.forEach((doc) => {
              sugs.push({ id: doc.id, ...doc.data() });
            });
            setSuggestions(sugs);
            setLoading(false);
          },
          (err) => {
            if (!isMounted) return;

            console.error("Error fetching suggestions:", err);
            setError(err.message);
            setLoading(false);
          },
        );

        return () => {
          isMounted = false;
          unsubscribe();
        };
      }
    } catch (err) {
      if (isMounted) {
        console.error("Error setting up suggestions listener:", err);
        setError(err.message);
        setLoading(false);
      }
    }
  }, [userId, limitCount, realtime, status]);

  return { suggestions, loading, error };
}

/**
 * useActiveSuggestions Hook
 *
 * Get active suggestions for a user
 *
 * Usage:
 *   const { suggestions, loading } = useActiveSuggestions(userId);
 */
export function useActiveSuggestions(userId, count = 3) {
  return useSuggestions(userId, {
    limitCount: count,
    status: "active",
  });
}

/**
 * Create Suggestion Helper Function
 *
 * Add a new AI suggestion to Firestore
 *
 * @param {string} userId - User ID
 * @param {Object} suggestionData - Suggestion data
 * @returns {Promise<Object>} - { success: boolean, id?: string, error?: string }
 */
export const createSuggestion = async (userId, suggestionData) => {
  try {
    const suggestionsRef = collection(db, "suggestions");

    const suggestion = {
      userId,
      type: suggestionData.type, // 'profile', 'portfolio', 'document', 'project'
      title: suggestionData.title || "",
      description: suggestionData.description || "",
      action: suggestionData.action || "", // 'update_profile', 'add_project', etc.
      actionUrl: suggestionData.actionUrl || "",
      priority: suggestionData.priority || 1, // 1-5, higher is more important
      status: "active", // 'active', 'dismissed', 'completed'
      metadata: suggestionData.metadata || {},
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(suggestionsRef, suggestion);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating suggestion:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update Suggestion Status Helper Function
 *
 * Update the status of a suggestion
 *
 * @param {string} suggestionId - Suggestion document ID
 * @param {string} status - New status ('active', 'dismissed', 'completed')
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export const updateSuggestionStatus = async (suggestionId, status) => {
  try {
    const suggestionRef = doc(db, "suggestions", suggestionId);

    await updateDoc(suggestionRef, {
      status,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating suggestion:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Dismiss Suggestion Helper Function
 *
 * Dismiss a suggestion
 *
 * @param {string} suggestionId - Suggestion document ID
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export const dismissSuggestion = async (suggestionId) => {
  return updateSuggestionStatus(suggestionId, "dismissed");
};

/**
 * Complete Suggestion Helper Function
 *
 * Mark a suggestion as completed
 *
 * @param {string} suggestionId - Suggestion document ID
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export const completeSuggestion = async (suggestionId) => {
  return updateSuggestionStatus(suggestionId, "completed");
};
