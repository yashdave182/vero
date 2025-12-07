/**
 * Document Service
 *
 * Handles all document-related Firestore operations:
 * - Create, read, update, delete documents
 * - Manage document metadata
 * - Track document versions
 * - Handle document sharing and permissions
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
} from "firebase/firestore";
import { db } from "./firebase";

// ============================================
// Document Types
// ============================================

export const DOCUMENT_TYPES = {
  RESUME: "resume",
  PROPOSAL: "proposal",
  CONTRACT: "contract",
  COVER_LETTER: "coverLetter",
  PORTFOLIO: "portfolio",
  OTHER: "other",
};

export const DOCUMENT_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
};

// ============================================
// Document CRUD Operations
// ============================================

/**
 * Create a new document
 *
 * @param {string} userId - User ID (document owner)
 * @param {Object} documentData - Document data
 * @returns {Promise<Object>} - { success: boolean, documentId?: string, error?: string }
 */
export const createDocument = async (userId, documentData) => {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" };
    }

    // Generate a new document ID
    const docRef = doc(collection(db, "documents"));

    const newDocument = {
      userId,
      title: documentData.title || "Untitled Document",
      type: documentData.type || DOCUMENT_TYPES.OTHER,
      status: documentData.status || DOCUMENT_STATUS.DRAFT,
      content: documentData.content || "",
      metadata: {
        wordCount: calculateWordCount(documentData.content || ""),
        tags: documentData.tags || [],
        templateId: documentData.templateId || null,
        aiEnhanced: documentData.aiEnhanced || false,
      },
      sharing: {
        isPublic: false,
        shareLink: null,
        allowedUsers: [],
      },
      stats: {
        views: 0,
        downloads: 0,
        shares: 0,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(docRef, newDocument);

    // Increment user's document count
    await incrementUserDocumentCount(userId);

    return { success: true, documentId: docRef.id };
  } catch (error) {
    console.error("Error creating document:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get a document by ID
 *
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} - { success: boolean, data?: Object, error?: string }
 */
export const getDocument = async (documentId) => {
  try {
    const docRef = doc(db, "documents", documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: { id: docSnap.id, ...docSnap.data() },
      };
    } else {
      return { success: false, error: "Document not found" };
    }
  } catch (error) {
    console.error("Error getting document:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update a document
 *
 * @param {string} documentId - Document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export const updateDocument = async (documentId, updates) => {
  try {
    const docRef = doc(db, "documents", documentId);

    // Calculate word count if content is being updated
    if (updates.content) {
      updates.metadata = {
        ...(updates.metadata || {}),
        wordCount: calculateWordCount(updates.content),
      };
    }

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
 *
 * @param {string} documentId - Document ID
 * @param {string} userId - User ID (for verification)
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export const deleteDocument = async (documentId, userId) => {
  try {
    const docRef = doc(db, "documents", documentId);

    // Verify ownership before deleting
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return { success: false, error: "Document not found" };
    }

    if (docSnap.data().userId !== userId) {
      return { success: false, error: "Unauthorized to delete this document" };
    }

    await deleteDoc(docRef);

    // Decrement user's document count
    await decrementUserDocumentCount(userId);

    return { success: true };
  } catch (error) {
    console.error("Error deleting document:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all documents for a user
 *
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - { success: boolean, data?: Array, error?: string }
 */
export const getUserDocuments = async (userId, options = {}) => {
  try {
    const {
      type = null,
      status = null,
      limitCount = 50,
      orderByField = "updatedAt",
      orderDirection = "desc",
    } = options;

    const documentsRef = collection(db, "documents");
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
    const querySnapshot = await getDocs(q);

    const documents = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: documents };
  } catch (error) {
    console.error("Error getting user documents:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Duplicate a document
 *
 * @param {string} documentId - Document ID to duplicate
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - { success: boolean, documentId?: string, error?: string }
 */
export const duplicateDocument = async (documentId, userId) => {
  try {
    const result = await getDocument(documentId);
    if (!result.success) {
      return result;
    }

    const originalDoc = result.data;

    // Verify ownership
    if (originalDoc.userId !== userId) {
      return { success: false, error: "Unauthorized to duplicate this document" };
    }

    // Create new document with copied data
    const newDocData = {
      ...originalDoc,
      title: `${originalDoc.title} (Copy)`,
      status: DOCUMENT_STATUS.DRAFT,
      stats: {
        views: 0,
        downloads: 0,
        shares: 0,
      },
      sharing: {
        isPublic: false,
        shareLink: null,
        allowedUsers: [],
      },
    };

    delete newDocData.id;
    delete newDocData.createdAt;
    delete newDocData.updatedAt;

    return await createDocument(userId, newDocData);
  } catch (error) {
    console.error("Error duplicating document:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update document status
 *
 * @param {string} documentId - Document ID
 * @param {string} status - New status
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export const updateDocumentStatus = async (documentId, status) => {
  if (!Object.values(DOCUMENT_STATUS).includes(status)) {
    return { success: false, error: "Invalid status" };
  }

  return await updateDocument(documentId, { status });
};

/**
 * Increment document view count
 *
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export const incrementDocumentViews = async (documentId) => {
  try {
    const docRef = doc(db, "documents", documentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, error: "Document not found" };
    }

    const currentViews = docSnap.data().stats?.views || 0;
    await updateDoc(docRef, {
      "stats.views": currentViews + 1,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error incrementing document views:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Share a document (make public or generate share link)
 *
 * @param {string} documentId - Document ID
 * @param {boolean} isPublic - Whether to make document public
 * @returns {Promise<Object>} - { success: boolean, shareLink?: string, error?: string }
 */
export const shareDocument = async (documentId, isPublic = true) => {
  try {
    const shareLink = isPublic ? generateShareLink(documentId) : null;

    await updateDoc(doc(db, "documents", documentId), {
      "sharing.isPublic": isPublic,
      "sharing.shareLink": shareLink,
      updatedAt: serverTimestamp(),
    });

    return { success: true, shareLink };
  } catch (error) {
    console.error("Error sharing document:", error);
    return { success: false, error: error.message };
  }
};

// ============================================
// Helper Functions
// ============================================

/**
 * Calculate word count from text content
 *
 * @param {string} content - Text content
 * @returns {number} - Word count
 */
function calculateWordCount(content) {
  if (!content) return 0;
  return content.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Generate a share link for a document
 *
 * @param {string} documentId - Document ID
 * @returns {string} - Share link
 */
function generateShareLink(documentId) {
  // In production, you might want to use a shorter URL or custom domain
  const baseUrl = window.location.origin;
  return `${baseUrl}/shared/${documentId}`;
}

/**
 * Increment user's document count
 *
 * @param {string} userId - User ID
 */
async function incrementUserDocumentCount(userId) {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const currentCount = userSnap.data().documentsCount || 0;
      await updateDoc(userRef, {
        documentsCount: currentCount + 1,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error incrementing user document count:", error);
  }
}

/**
 * Decrement user's document count
 *
 * @param {string} userId - User ID
 */
async function decrementUserDocumentCount(userId) {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const currentCount = userSnap.data().documentsCount || 0;
      await updateDoc(userRef, {
        documentsCount: Math.max(0, currentCount - 1),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error decrementing user document count:", error);
  }
}

/**
 * Batch delete documents
 *
 * @param {Array<string>} documentIds - Array of document IDs
 * @param {string} userId - User ID (for verification)
 * @returns {Promise<Object>} - { success: boolean, deleted: number, error?: string }
 */
export const batchDeleteDocuments = async (documentIds, userId) => {
  try {
    let deletedCount = 0;

    for (const documentId of documentIds) {
      const result = await deleteDocument(documentId, userId);
      if (result.success) {
        deletedCount++;
      }
    }

    return { success: true, deleted: deletedCount };
  } catch (error) {
    console.error("Error batch deleting documents:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Search documents by title
 *
 * @param {string} userId - User ID
 * @param {string} searchTerm - Search term
 * @returns {Promise<Object>} - { success: boolean, data?: Array, error?: string }
 */
export const searchDocuments = async (userId, searchTerm) => {
  try {
    // Note: Firestore doesn't support full-text search natively
    // For production, consider using Algolia, Elasticsearch, or Cloud Functions
    // This is a basic implementation that fetches all and filters client-side

    const result = await getUserDocuments(userId, { limitCount: 100 });
    if (!result.success) {
      return result;
    }

    const filtered = result.data.filter((doc) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return { success: true, data: filtered };
  } catch (error) {
    console.error("Error searching documents:", error);
    return { success: false, error: error.message };
  }
};
