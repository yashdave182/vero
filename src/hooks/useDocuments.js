/**
 * useDocuments Hook
 *
 * Custom React hook for fetching and managing documents from Firestore
 * Supports real-time updates, filtering by user, and document type
 *
 * Usage:
 *   const { documents, loading, error, refetch } = useDocuments(userId);
 *   const { documents, loading, error } = useDocuments(userId, { type: 'resume', limit: 10 });
 */

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export function useDocuments(userId, options = {}) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    type = null, // Filter by document type (resume, proposal, contract, etc.)
    status = null, // Filter by status (draft, published, archived)
    limitCount = 50, // Limit number of results
    realtime = true, // Enable real-time updates
    orderByField = "updatedAt", // Field to order by
    orderDirection = "desc", // Order direction
  } = options;

  const fetchDocuments = useCallback(async () => {
    if (!userId) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const documentsRef = collection(db, "documents");

      // Build query constraints
      const constraints = [where("userId", "==", userId)];

      if (type) {
        constraints.push(where("type", "==", type));
      }

      if (status) {
        constraints.push(where("status", "==", status));
      }

      constraints.push(orderBy(orderByField, orderDirection));
      constraints.push(limit(limitCount));

      const q = query(documentsRef, ...constraints);

      if (realtime) {
        // Set up real-time listener
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const docs = [];
            snapshot.forEach((doc) => {
              docs.push({ id: doc.id, ...doc.data() });
            });
            setDocuments(docs);
            setLoading(false);
          },
          (err) => {
            console.error("Error fetching documents:", err);
            setError(err.message);
            setLoading(false);
          }
        );

        return unsubscribe;
      } else {
        // One-time fetch
        const snapshot = await getDocs(q);
        const docs = [];
        snapshot.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() });
        });
        setDocuments(docs);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError(err.message);
      setLoading(false);
    }
  }, [userId, type, status, limitCount, realtime, orderByField, orderDirection]);

  useEffect(() => {
    const unsubscribe = fetchDocuments();

    // Cleanup function
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [fetchDocuments]);

  // Refetch function for manual refresh
  const refetch = useCallback(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return { documents, loading, error, refetch };
}

/**
 * useRecentDocuments Hook
 *
 * Get the most recent documents for a user
 *
 * Usage:
 *   const { documents, loading } = useRecentDocuments(userId, 5);
 */
export function useRecentDocuments(userId, count = 10) {
  return useDocuments(userId, {
    limitCount: count,
    orderByField: "updatedAt",
    orderDirection: "desc",
  });
}

/**
 * useDocumentsByType Hook
 *
 * Get documents filtered by type
 *
 * Usage:
 *   const { documents, loading } = useDocumentsByType(userId, 'resume');
 */
export function useDocumentsByType(userId, type) {
  return useDocuments(userId, { type });
}

/**
 * useDocumentStats Hook
 *
 * Get document statistics for a user
 *
 * Usage:
 *   const { stats, loading } = useDocumentStats(userId);
 *   // stats = { total: 12, resume: 3, proposal: 5, contract: 4 }
 */
export function useDocumentStats(userId) {
  const { documents, loading, error } = useDocuments(userId, {
    realtime: false,
  });

  const [stats, setStats] = useState({
    total: 0,
    resume: 0,
    proposal: 0,
    contract: 0,
    other: 0,
  });

  useEffect(() => {
    if (!loading && documents) {
      const newStats = {
        total: documents.length,
        resume: 0,
        proposal: 0,
        contract: 0,
        other: 0,
      };

      documents.forEach((doc) => {
        const type = doc.type?.toLowerCase();
        if (type === "resume") {
          newStats.resume++;
        } else if (type === "proposal") {
          newStats.proposal++;
        } else if (type === "contract") {
          newStats.contract++;
        } else {
          newStats.other++;
        }
      });

      setStats(newStats);
    }
  }, [documents, loading]);

  return { stats, loading, error };
}
