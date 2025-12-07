/**
 * User Profile Service
 *
 * Handles all user-related Firestore operations:
 * - Create user profiles on sign-up
 * - Read user data
 * - Update user profiles
 * - Manage user preferences and settings
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ============================================
// User Profile CRUD Operations
// ============================================

/**
 * Create a new user profile in Firestore
 * Called after Firebase Auth account creation
 *
 * @param {string} userId - Firebase Auth UID
 * @param {Object} userData - User data from sign-up
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export const createUserProfile = async (userId, userData = {}) => {
  try {
    const userRef = doc(db, "users", userId);

    // Check if user already exists
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      console.log("User profile already exists");
      return { success: true, data: userSnap.data() };
    }

    // Create new user profile
    const userProfile = {
      uid: userId,
      email: userData.email || "",
      displayName: userData.displayName || "",
      photoURL: userData.photoURL || "",
      bio: "",
      username: generateUsername(userData.email || userData.displayName || ""),
      portfolioUrl: "",

      // Stats
      portfolioViews: 0,
      documentsCount: 0,
      projectsCount: 0,
      aiEnhancementsCount: 0,

      // Preferences
      preferences: {
        theme: "light",
        emailNotifications: true,
        marketingEmails: false,
      },

      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };

    await setDoc(userRef, userProfile);
    console.log("User profile created successfully");
    return { success: true, data: userProfile };
  } catch (error) {
    console.error("Error creating user profile:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user profile from Firestore
 *
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<Object>} - { success: boolean, data?: Object, error?: string }
 */
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return {
        success: true,
        data: { id: userSnap.id, ...userSnap.data() },
      };
    } else {
      return { success: false, error: "User profile not found" };
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update user profile in Firestore
 *
 * @param {string} userId - Firebase Auth UID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, "users", userId);

    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined),
    );

    // Use setDoc with merge to create document if it doesn't exist
    await setDoc(
      userRef,
      {
        ...cleanUpdates,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update last login timestamp
 *
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export const updateLastLogin = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        lastLoginAt: serverTimestamp(),
      },
      { merge: true },
    );
    return { success: true };
  } catch (error) {
    console.error("Error updating last login:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Increment user stats
 *
 * @param {string} userId - Firebase Auth UID
 * @param {string} statField - Field to increment (e.g., 'portfolioViews')
 * @param {number} incrementBy - Amount to increment (default: 1)
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export const incrementUserStat = async (userId, statField, incrementBy = 1) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false, error: "User not found" };
    }

    const currentValue = userSnap.data()[statField] || 0;
    await updateDoc(userRef, {
      [statField]: currentValue + incrementBy,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error incrementing user stat:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update user preferences
 *
 * @param {string} userId - Firebase Auth UID
 * @param {Object} preferences - Preferences object
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export const updateUserPreferences = async (userId, preferences) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    const currentPrefs = userSnap.exists()
      ? userSnap.data().preferences || {}
      : {};

    await setDoc(
      userRef,
      {
        preferences: { ...currentPrefs, ...preferences },
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if username is available
 *
 * @param {string} username - Username to check
 * @returns {Promise<boolean>} - true if available, false if taken
 */
// eslint-disable-next-line no-unused-vars
export const isUsernameAvailable = async (_username) => {
  // This is a simplified check - in production, you'd want to use a separate
  // collection or index for efficient username lookups
  // For now, return true - implement proper username collision detection
  // when you add username uniqueness constraints
  return true;
};

// ============================================
// Helper Functions
// ============================================

/**
 * Generate a username from email or display name
 *
 * @param {string} input - Email or display name
 * @returns {string} - Generated username
 */
function generateUsername(input) {
  if (!input) return `user${Date.now()}`;

  // If it's an email, take the part before @
  if (input.includes("@")) {
    input = input.split("@")[0];
  }

  // Remove special characters and spaces
  let username = input
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 20);

  // Add random suffix to avoid collisions
  const suffix = Math.floor(Math.random() * 1000);
  username = `${username}${suffix}`;

  return username;
}

/**
 * Extract user data from Firebase Auth user object
 *
 * @param {Object} firebaseUser - Firebase Auth user object
 * @returns {Object} - Extracted user data
 */
export const extractUserData = (firebaseUser) => {
  if (!firebaseUser) return {};

  return {
    email: firebaseUser.email || "",
    displayName: firebaseUser.displayName || "",
    photoURL: firebaseUser.photoURL || "",
    emailVerified: firebaseUser.emailVerified || false,
  };
};

/**
 * Sync Firebase Auth profile with Firestore
 * Useful after Google sign-in or profile updates in Auth
 *
 * @param {string} userId - Firebase Auth UID
 * @param {Object} authData - Data from Firebase Auth
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export const syncAuthProfile = async (userId, authData) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create profile if it doesn't exist
      return await createUserProfile(userId, authData);
    }

    // Update existing profile with auth data
    const updates = {};
    if (authData.displayName) updates.displayName = authData.displayName;
    if (authData.photoURL) updates.photoURL = authData.photoURL;
    if (authData.email) updates.email = authData.email;

    if (Object.keys(updates).length > 0) {
      await updateUserProfile(userId, updates);
    }

    return { success: true };
  } catch (error) {
    console.error("Error syncing auth profile:", error);
    return { success: false, error: error.message };
  }
};
