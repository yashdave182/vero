/**
 * Firestore Database Utilities
 *
 * Helper functions for common Firestore operations:
 * - Collection references
 * - CRUD operations
 * - Query helpers
 * - Timestamp utilities
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ============================================
// Collection References
// ============================================

/**
 * Get reference to users collection
 */
export const usersCollection = () => collection(db, "users");

/**
 * Get reference to a specific user document
 */
export const userDoc = (userId) => doc(db, "users", userId);

/**
 * Get reference to portfolios collection
 */
export const portfoliosCollection = () => collection(db, "portfolios");

/**
 * Get reference to a specific portfolio document
 */
export const portfolioDoc = (portfolioId) =>
  doc(db, "portfolios", portfolioId);

/**
 * Get reference to documents collection (resumes, proposals, etc.)
 */
export const documentsCollection = () => collection(db, "documents");

/**
 * Get reference to a specific document
 */
export const documentDoc = (documentId) => doc(db, "documents", documentId);

/**
 * Get reference to projects collection
 */
export const projectsCollection = () => collection(db, "projects");

/**
 * Get reference to a specific project document
 */
export const projectDoc = (projectId) => doc(db, "projects", projectId);

/**
 * Get reference to templates collection
 */
export const templatesCollection = () => collection(db, "templates");

/**
 * Get reference to a specific template document
 */
export const templateDoc = (templateId) => doc(db, "templates", templateId);

/**
 * Get reference to AI enhancements collection
 */
export const aiEnhancementsCollection = () =>
  collection(db, "aiEnhancements");

// ============================================
// CRUD Helper Functions
// ============================================

/**
 * Create or update a document
 * @param {DocumentReference} docRef - Firestore document reference
 * @param {Object} data - Data to save
 * @param {boolean} merge - Whether to merge with existing data
 */
export const saveDocument = async (docRef, data, merge = true) => {
  try {
    await setDoc(
      docRef,
      {
        ...data,
        updatedAt: serverTimestamp(),
      },
      { merge }
    );
    return { success: true };
  } catch (error) {
    console.error("Error saving document:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Read a document
 * @param {DocumentReference} docRef - Firestore document reference
 */
export const readDocument = async (docRef) => {
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: "Document not found" };
    }
  } catch (error) {
    console.error("Error reading document:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update specific fields in a document
 * @param {DocumentReference} docRef - Firestore document reference
 * @param {Object} updates - Fields to update
 */
export const updateDocument = async (docRef, updates) => {
  try {
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating document:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a document
 * @param {DocumentReference} docRef - Firestore document reference
 */
export const deleteDocument = async (docRef) => {
  try {
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting document:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Query documents from a collection
 * @param {CollectionReference} collectionRef - Firestore collection reference
 * @param {Array} queryConstraints - Array of query constraints (where, orderBy, limit, etc.)
 */
export const queryDocuments = async (collectionRef, queryConstraints = []) => {
  try {
    const q = queryConstraints.length > 0
      ? query(collectionRef, ...queryConstraints)
      : collectionRef;

    const querySnapshot = await getDocs(q);
    const documents = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: documents };
  } catch (error) {
    console.error("Error querying documents:", error);
    return { success: false, error: error.message };
  }
};

// ============================================
// Timestamp Utilities
// ============================================

/**
 * Get server timestamp for Firestore
 */
export const getServerTimestamp = () => serverTimestamp();

/**
 * Convert Firestore Timestamp to JavaScript Date
 * @param {Timestamp} timestamp - Firestore timestamp
 */
export const timestampToDate = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp.toDate) {
    return timestamp.toDate();
  }
  return timestamp;
};

/**
 * Format Firestore timestamp to readable string
 * @param {Timestamp} timestamp - Firestore timestamp
 */
export const formatTimestamp = (timestamp) => {
  const date = timestampToDate(timestamp);
  if (!date) return "";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// ============================================
// Query Constraint Helpers
// ============================================

/**
 * Re-export Firestore query functions for convenience
 */
export { where, orderBy, limit };

/**
 * Common query patterns
 */
export const queryByUserId = (userId) => where("userId", "==", userId);
export const queryByStatus = (status) => where("status", "==", status);
export const orderByCreatedAt = (direction = "desc") =>
  orderBy("createdAt", direction);
export const orderByUpdatedAt = (direction = "desc") =>
  orderBy("updatedAt", direction);
export const limitResults = (count) => limit(count);

// ============================================
// Batch Operations
// ============================================

/**
 * Create multiple documents at once
 * @param {Array} items - Array of {docRef, data} objects
 */
export const batchCreate = async (items) => {
  try {
    const promises = items.map(({ docRef, data }) =>
      setDoc(docRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
    await Promise.all(promises);
    return { success: true };
  } catch (error) {
    console.error("Error in batch create:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete multiple documents at once
 * @param {Array} docRefs - Array of document references
 */
export const batchDelete = async (docRefs) => {
  try {
    const promises = docRefs.map((docRef) => deleteDoc(docRef));
    await Promise.all(promises);
    return { success: true };
  } catch (error) {
    console.error("Error in batch delete:", error);
    return { success: false, error: error.message };
  }
};
