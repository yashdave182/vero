/**
 * useActivities Hook
 *
 * Custom React hook for fetching and managing user activities from Firestore
 * Tracks various user actions like document creation, project completion, AI usage, etc.
 *
 * Usage:
 *   const { activities, loading, error } = useActivities(userId, { limit: 10 });
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
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export function useActivities(userId, options = {}) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    limitCount = 10,
    realtime = true,
    activityType = null, // Filter by type: 'document', 'project', 'ai', 'profile'
  } = options;

  useEffect(() => {
    if (!userId) {
      return;
    }

    let isMounted = true;

    const setupListener = () => {
      try {
        const activitiesRef = collection(db, "activities");

        // Build query constraints
        const constraints = [where("userId", "==", userId)];

        if (activityType) {
          constraints.push(where("type", "==", activityType));
        }

        constraints.push(orderBy("createdAt", "desc"));
        constraints.push(limit(limitCount));

        const q = query(activitiesRef, ...constraints);

        if (realtime) {
          // Set up real-time listener
          const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
              if (!isMounted) return;

              const acts = [];
              snapshot.forEach((doc) => {
                acts.push({ id: doc.id, ...doc.data() });
              });
              setActivities(acts);
              setLoading(false);
            },
            (err) => {
              if (!isMounted) return;

              console.error("Error fetching activities:", err);
              setError(err.message);
              setLoading(false);
            },
          );

          return unsubscribe;
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error setting up activities listener:", err);
          setError(err.message);
          setLoading(false);
        }
      }
    };

    const unsubscribe = setupListener();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [userId, limitCount, realtime, activityType]);

  return { activities, loading, error };
}

/**
 * useRecentActivities Hook
 *
 * Get the most recent activities for a user
 *
 * Usage:
 *   const { activities, loading } = useRecentActivities(userId, 5);
 */
export function useRecentActivities(userId, count = 10) {
  return useActivities(userId, { limitCount: count });
}

/**
 * Log Activity Helper Function
 *
 * Add a new activity to Firestore
 *
 * @param {string} userId - User ID
 * @param {Object} activityData - Activity data
 * @returns {Promise<Object>} - { success: boolean, id?: string, error?: string }
 */
export const logActivity = async (userId, activityData) => {
  try {
    const activitiesRef = collection(db, "activities");

    const activity = {
      userId,
      type: activityData.type, // 'document', 'project', 'ai', 'profile'
      action: activityData.action, // 'created', 'updated', 'completed', 'deleted'
      title: activityData.title || "",
      description: activityData.description || "",
      metadata: activityData.metadata || {},
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(activitiesRef, activity);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error logging activity:", error);
    return { success: false, error: error.message };
  }
};

/**
 * useProjectActivities Hook
 *
 * Get project-related activities
 *
 * Usage:
 *   const { activities, loading } = useProjectActivities(userId);
 */
export function useProjectActivities(userId, count = 5) {
  return useActivities(userId, {
    limitCount: count,
    activityType: "project",
  });
}

/**
 * useDocumentActivities Hook
 *
 * Get document-related activities
 *
 * Usage:
 *   const { activities, loading } = useDocumentActivities(userId);
 */
export function useDocumentActivities(userId, count = 5) {
  return useActivities(userId, {
    limitCount: count,
    activityType: "document",
  });
}
