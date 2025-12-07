/**
 * Portfolio Service
 *
 * Handles all portfolio-related Firestore operations:
 * - Create and manage user portfolios
 * - Add, update, delete projects
 * - Publish/unpublish portfolios
 * - Track portfolio views
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";
import { updateUserProfile } from "./userService";

// ============================================
// Portfolio CRUD Operations
// ============================================

/**
 * Create or update user portfolio
 *
 * @param {string} userId - Firebase Auth UID
 * @param {Object} portfolioData - Portfolio data
 * @returns {Promise<Object>} - { success: boolean, data?: Object, error?: string }
 */
export const savePortfolio = async (userId, portfolioData) => {
  try {
    const portfolioRef = doc(db, "portfolios", userId);

    const portfolio = {
      userId,
      name: portfolioData.name || "",
      title: portfolioData.title || "",
      bio: portfolioData.bio || "",
      skills: portfolioData.skills || [],
      socials: portfolioData.socials || {},
      projects: portfolioData.projects || [],
      isPublished: portfolioData.isPublished || false,
      updatedAt: serverTimestamp(),
    };

    // Check if portfolio exists
    const portfolioSnap = await getDoc(portfolioRef);

    if (portfolioSnap.exists()) {
      // Update existing portfolio
      await updateDoc(portfolioRef, portfolio);
    } else {
      // Create new portfolio
      portfolio.createdAt = serverTimestamp();
      await setDoc(portfolioRef, portfolio);
    }

    return { success: true, data: portfolio };
  } catch (error) {
    console.error("Error saving portfolio:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user portfolio
 *
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<Object>} - { success: boolean, data?: Object, error?: string }
 */
export const getPortfolio = async (userId) => {
  try {
    const portfolioRef = doc(db, "portfolios", userId);
    const portfolioSnap = await getDoc(portfolioRef);

    if (portfolioSnap.exists()) {
      return {
        success: true,
        data: { id: portfolioSnap.id, ...portfolioSnap.data() },
      };
    } else {
      return { success: false, error: "Portfolio not found" };
    }
  } catch (error) {
    console.error("Error getting portfolio:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get portfolio by username (for public view)
 *
 * @param {string} username - User's username
 * @returns {Promise<Object>} - { success: boolean, data?: Object, error?: string }
 */
export const getPortfolioByUsername = async (username) => {
  try {
    // First get user by username
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, error: "User not found" };
    }

    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;

    // Get portfolio
    const portfolioRef = doc(db, "portfolios", userId);
    const portfolioSnap = await getDoc(portfolioRef);

    if (portfolioSnap.exists()) {
      const portfolio = portfolioSnap.data();

      // Only return if published
      if (!portfolio.isPublished) {
        return { success: false, error: "Portfolio not published" };
      }

      return {
        success: true,
        data: {
          id: portfolioSnap.id,
          ...portfolio,
          userData: userDoc.data(),
        },
      };
    } else {
      return { success: false, error: "Portfolio not found" };
    }
  } catch (error) {
    console.error("Error getting portfolio by username:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Publish portfolio
 *
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export const publishPortfolio = async (userId) => {
  try {
    const portfolioRef = doc(db, "portfolios", userId);

    await updateDoc(portfolioRef, {
      isPublished: true,
      publishedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error publishing portfolio:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Unpublish portfolio
 *
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export const unpublishPortfolio = async (userId) => {
  try {
    const portfolioRef = doc(db, "portfolios", userId);

    await updateDoc(portfolioRef, {
      isPublished: false,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error unpublishing portfolio:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete portfolio
 *
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export const deletePortfolio = async (userId) => {
  try {
    const portfolioRef = doc(db, "portfolios", userId);
    await deleteDoc(portfolioRef);

    return { success: true };
  } catch (error) {
    console.error("Error deleting portfolio:", error);
    return { success: false, error: error.message };
  }
};

// ============================================
// Project Operations
// ============================================

/**
 * Add project to portfolio
 *
 * @param {string} userId - Firebase Auth UID
 * @param {Object} projectData - Project data
 * @returns {Promise<Object>} - { success: boolean, data?: Object, error?: string }
 */
export const addProject = async (userId, projectData) => {
  try {
    const portfolioRef = doc(db, "portfolios", userId);
    const portfolioSnap = await getDoc(portfolioRef);

    if (!portfolioSnap.exists()) {
      return { success: false, error: "Portfolio not found" };
    }

    const portfolio = portfolioSnap.data();
    const projects = portfolio.projects || [];

    const newProject = {
      id: Date.now().toString(),
      name: projectData.name || "",
      description: projectData.description || "",
      tech: projectData.tech || [],
      liveUrl: projectData.liveUrl || "",
      githubUrl: projectData.githubUrl || "",
      image: projectData.image || "",
      createdAt: new Date().toISOString(),
    };

    projects.push(newProject);

    await updateDoc(portfolioRef, {
      projects,
      updatedAt: serverTimestamp(),
    });

    // Update user's project count
    await updateUserProfile(userId, {
      projectsCount: projects.length,
    });

    return { success: true, data: newProject };
  } catch (error) {
    console.error("Error adding project:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update project in portfolio
 *
 * @param {string} userId - Firebase Auth UID
 * @param {string} projectId - Project ID
 * @param {Object} updates - Project updates
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export const updateProject = async (userId, projectId, updates) => {
  try {
    const portfolioRef = doc(db, "portfolios", userId);
    const portfolioSnap = await getDoc(portfolioRef);

    if (!portfolioSnap.exists()) {
      return { success: false, error: "Portfolio not found" };
    }

    const portfolio = portfolioSnap.data();
    const projects = portfolio.projects || [];

    const projectIndex = projects.findIndex((p) => p.id === projectId);

    if (projectIndex === -1) {
      return { success: false, error: "Project not found" };
    }

    projects[projectIndex] = {
      ...projects[projectIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(portfolioRef, {
      projects,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating project:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete project from portfolio
 *
 * @param {string} userId - Firebase Auth UID
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export const deleteProject = async (userId, projectId) => {
  try {
    const portfolioRef = doc(db, "portfolios", userId);
    const portfolioSnap = await getDoc(portfolioRef);

    if (!portfolioSnap.exists()) {
      return { success: false, error: "Portfolio not found" };
    }

    const portfolio = portfolioSnap.data();
    const projects = (portfolio.projects || []).filter(
      (p) => p.id !== projectId
    );

    await updateDoc(portfolioRef, {
      projects,
      updatedAt: serverTimestamp(),
    });

    // Update user's project count
    await updateUserProfile(userId, {
      projectsCount: projects.length,
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { success: false, error: error.message };
  }
};

// ============================================
// Portfolio Views
// ============================================

/**
 * Increment portfolio view count
 *
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export const incrementPortfolioViews = async (userId) => {
  try {
    const portfolioRef = doc(db, "portfolios", userId);

    await updateDoc(portfolioRef, {
      views: increment(1),
      lastViewedAt: serverTimestamp(),
    });

    // Also update user profile views
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      portfolioViews: increment(1),
    });

    return { success: true };
  } catch (error) {
    console.error("Error incrementing portfolio views:", error);
    return { success: false, error: error.message };
  }
};

// ============================================
// Helper Functions
// ============================================

/**
 * Validate portfolio data
 *
 * @param {Object} portfolioData - Portfolio data to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export const validatePortfolio = (portfolioData) => {
  const errors = [];

  if (!portfolioData.name || portfolioData.name.trim() === "") {
    errors.push("Name is required");
  }

  if (!portfolioData.title || portfolioData.title.trim() === "") {
    errors.push("Title/Role is required");
  }

  if (!portfolioData.bio || portfolioData.bio.trim() === "") {
    errors.push("Bio is required");
  }

  if (portfolioData.bio && portfolioData.bio.length > 500) {
    errors.push("Bio must be less than 500 characters");
  }

  if (!portfolioData.skills || portfolioData.skills.length === 0) {
    errors.push("At least one skill is required");
  }

  if (!portfolioData.projects || portfolioData.projects.length === 0) {
    errors.push("At least one project is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Generate portfolio preview URL
 *
 * @param {string} username - User's username
 * @returns {string} - Portfolio URL
 */
export const getPortfolioUrl = (username) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/u/${username}`;
};
