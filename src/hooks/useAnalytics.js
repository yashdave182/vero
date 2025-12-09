/**
 * useAnalytics Hook
 *
 * Custom React hook for fetching analytics and trend data from Firestore
 * Tracks historical data for portfolio views, documents, projects, and AI usage
 *
 * Usage:
 *   const { analytics, trends, loading, error } = useAnalytics(userId);
 */

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export function useAnalytics(userId, options = {}) {
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState({
    portfolioViews: { value: 0, isPositive: true },
    documents: { value: 0, isPositive: true },
    projects: { value: 0, isPositive: true },
    aiEnhancements: { value: 0, isPositive: true },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { period = 7 } = options; // Days to compare (default: 7 days)

  useEffect(() => {
    if (!userId) {
      return;
    }

    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      setAnalytics(null);

      try {
        // Fetch current user stats
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          setError("User not found");
          setLoading(false);
          return;
        }

        const userData = userSnap.data();
        const currentStats = {
          portfolioViews: userData.portfolioViews || 0,
          documents: userData.documentsCount || 0,
          projects: userData.projectsCount || 0,
          aiEnhancements: userData.aiEnhancementsCount || 0,
        };

        // Fetch analytics snapshots for trend calculation
        const analyticsRef = collection(db, "analytics");
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - period);

        const q = query(
          analyticsRef,
          where("userId", "==", userId),
          where("createdAt", ">=", cutoffDate),
          orderBy("createdAt", "desc"),
          limit(10),
        );

        const snapshot = await getDocs(q);
        const analyticsData = [];
        snapshot.forEach((doc) => {
          analyticsData.push({ id: doc.id, ...doc.data() });
        });

        // Calculate trends
        const calculatedTrends = {
          portfolioViews: { value: 0, isPositive: true },
          documents: { value: 0, isPositive: true },
          projects: { value: 0, isPositive: true },
          aiEnhancements: { value: 0, isPositive: true },
        };

        if (analyticsData.length > 0) {
          // Get the oldest snapshot for comparison
          const oldestSnapshot = analyticsData[analyticsData.length - 1];

          // Calculate percentage change for portfolio views
          const oldViews = oldestSnapshot.portfolioViews || 0;
          if (oldViews > 0) {
            const viewsChange =
              ((currentStats.portfolioViews - oldViews) / oldViews) * 100;
            calculatedTrends.portfolioViews = {
              value: Math.abs(Math.round(viewsChange)),
              isPositive: viewsChange >= 0,
            };
          } else if (currentStats.portfolioViews > 0) {
            calculatedTrends.portfolioViews = {
              value: currentStats.portfolioViews,
              isPositive: true,
            };
          }

          // Calculate change for documents (absolute number)
          const oldDocs = oldestSnapshot.documents || 0;
          const docsChange = currentStats.documents - oldDocs;
          calculatedTrends.documents = {
            value: Math.abs(docsChange),
            isPositive: docsChange >= 0,
          };

          // Calculate change for projects (absolute number)
          const oldProjects = oldestSnapshot.projects || 0;
          const projectsChange = currentStats.projects - oldProjects;
          calculatedTrends.projects = {
            value: Math.abs(projectsChange),
            isPositive: projectsChange >= 0,
          };

          // Calculate percentage change for AI enhancements
          const oldAI = oldestSnapshot.aiEnhancements || 0;
          if (oldAI > 0) {
            const aiChange =
              ((currentStats.aiEnhancements - oldAI) / oldAI) * 100;
            calculatedTrends.aiEnhancements = {
              value: Math.abs(Math.round(aiChange)),
              isPositive: aiChange >= 0,
            };
          } else if (currentStats.aiEnhancements > 0) {
            calculatedTrends.aiEnhancements = {
              value: currentStats.aiEnhancements,
              isPositive: true,
            };
          }
        }

        setAnalytics(currentStats);
        setTrends(calculatedTrends);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [userId, period]);

  return { analytics, trends, loading, error };
}

/**
 * Save Analytics Snapshot Helper Function
 *
 * Save current user stats as an analytics snapshot for trend tracking
 * This should be called periodically (e.g., daily) to build historical data
 *
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - { success: boolean, id?: string, error?: string }
 */
export const saveAnalyticsSnapshot = async (userId) => {
  try {
    // Fetch current user stats
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false, error: "User not found" };
    }

    const userData = userSnap.data();

    // Create analytics snapshot
    const analyticsRef = collection(db, "analytics");
    const snapshot = {
      userId,
      portfolioViews: userData.portfolioViews || 0,
      documents: userData.documentsCount || 0,
      projects: userData.projectsCount || 0,
      aiEnhancements: userData.aiEnhancementsCount || 0,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(analyticsRef, snapshot);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving analytics snapshot:", error);
    return { success: false, error: error.message };
  }
};

/**
 * useWeeklyTrends Hook
 *
 * Get trends for the last 7 days
 *
 * Usage:
 *   const { trends, loading } = useWeeklyTrends(userId);
 */
export function useWeeklyTrends(userId) {
  const { trends, loading, error } = useAnalytics(userId, { period: 7 });
  return { trends, loading, error };
}

/**
 * useMonthlyTrends Hook
 *
 * Get trends for the last 30 days
 *
 * Usage:
 *   const { trends, loading } = useMonthlyTrends(userId);
 */
export function useMonthlyTrends(userId) {
  const { trends, loading, error } = useAnalytics(userId, { period: 30 });
  return { trends, loading, error };
}
