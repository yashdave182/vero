import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import "./Dashboard.css";
import "./Settings.css";
import { useUser } from "../../lib/authContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import {
  updateUserProfile,
  updateUserPreferences,
  createUserProfile,
  extractUserData,
} from "../../lib/userService";
import { updateProfile } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function Settings() {
  const { user } = useUser();
  const { profile, loading: profileLoading } = useUserProfile(user?.uid);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    displayName: "",
    username: "",
    bio: "",
    portfolioUrl: "",
  });

  // Preferences form state
  const [preferencesForm, setPreferencesForm] = useState({
    theme: "light",
    emailNotifications: true,
    marketingEmails: false,
  });

  // Load profile data when available or create if missing
  useEffect(() => {
    const initializeProfile = async () => {
      if (profile) {
        setProfileForm({
          displayName: profile.displayName || "",
          username: profile.username || "",
          bio: profile.bio || "",
          portfolioUrl: profile.portfolioUrl || "",
        });
        setPreferencesForm({
          theme: profile.preferences?.theme || "light",
          emailNotifications: profile.preferences?.emailNotifications ?? true,
          marketingEmails: profile.preferences?.marketingEmails ?? false,
        });
      } else if (user && !profileLoading) {
        // Profile doesn't exist, create it
        console.log("Creating missing user profile...");
        const result = await createUserProfile(user.uid, extractUserData(user));
        if (result.success) {
          console.log("User profile created successfully");
          // The useUserProfile hook should automatically reload
        } else {
          console.error("Failed to create user profile:", result.error);
          setMessage({
            type: "error",
            text: "Failed to initialize profile. Please refresh the page.",
          });
        }
      }
    };

    initializeProfile();
  }, [profile, user, profileLoading]);

  // Handle profile form changes
  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value,
    });
  };

  // Handle preferences form changes
  const handlePreferencesChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setPreferencesForm({
      ...preferencesForm,
      [e.target.name]: value,
    });
  };

  // Save profile updates
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      // Ensure profile exists first
      if (!profile) {
        console.log("Profile doesn't exist, creating...");
        const createResult = await createUserProfile(
          user.uid,
          extractUserData(user),
        );
        if (!createResult.success) {
          throw new Error("Failed to create profile: " + createResult.error);
        }
      }

      // Update Firestore profile
      const result = await updateUserProfile(user.uid, {
        displayName: profileForm.displayName,
        username: profileForm.username,
        bio: profileForm.bio,
        portfolioUrl: profileForm.portfolioUrl,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // Update Firebase Auth profile
      if (profileForm.displayName !== user.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: profileForm.displayName,
        });
      }

      setMessage({
        type: "success",
        text: "Profile updated successfully! You can now use Preview in Portfolio Builder.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  // Save preferences updates
  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      // Ensure profile exists first
      if (!profile) {
        console.log("Profile doesn't exist, creating...");
        const createResult = await createUserProfile(
          user.uid,
          extractUserData(user),
        );
        if (!createResult.success) {
          throw new Error("Failed to create profile: " + createResult.error);
        }
      }

      const result = await updateUserPreferences(user.uid, preferencesForm);

      if (!result.success) {
        throw new Error(result.error);
      }

      setMessage({
        type: "success",
        text: "Preferences updated successfully!",
      });
    } catch (error) {
      console.error("Error updating preferences:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to update preferences",
      });
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="settings-loading">Loading settings...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Settings</h1>
            <p className="dashboard-subtitle">
              Manage your account settings and preferences
            </p>
          </div>
        </div>

        {message.text && (
          <div className={`settings-message ${message.type}`}>
            {message.type === "success" && (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            {message.type === "error" && (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Profile Settings */}
        <section className="settings-section">
          <div className="settings-section-header">
            <h2 className="settings-section-title">Profile Information</h2>
            <p className="settings-section-description">
              Update your personal information and public profile
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  value={user?.email || ""}
                  disabled
                />
                <p className="form-hint">Your email cannot be changed</p>
              </div>

              <div className="form-group">
                <label htmlFor="displayName" className="form-label">
                  Display Name *
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  className="form-input"
                  value={profileForm.displayName}
                  onChange={handleProfileChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Username *
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="form-input"
                  value={profileForm.username}
                  onChange={handleProfileChange}
                  required
                  pattern="[a-zA-Z0-9_]+"
                  title="Only letters, numbers, and underscores are allowed"
                />
                <p className="form-hint">
                  Your public profile URL: verolabz.com/u/
                  {profileForm.username || "username"}
                  <br />
                  <strong>Required for Portfolio Preview!</strong>
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="portfolioUrl" className="form-label">
                  Portfolio URL
                </label>
                <input
                  type="url"
                  id="portfolioUrl"
                  name="portfolioUrl"
                  className="form-input"
                  value={profileForm.portfolioUrl}
                  onChange={handleProfileChange}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="bio" className="form-label">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                className="form-textarea"
                value={profileForm.bio}
                onChange={handleProfileChange}
                rows="4"
                placeholder="Tell us about yourself..."
              />
              <p className="form-hint">
                {profileForm.bio.length} / 500 characters
              </p>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </section>

        {/* Account Stats */}
        <section className="settings-section">
          <div className="settings-section-header">
            <h2 className="settings-section-title">Account Statistics</h2>
            <p className="settings-section-description">
              Your account overview
            </p>
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-item-label">Documents</span>
              <span className="stat-item-value">
                {profile?.documentsCount || 0}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-item-label">Projects</span>
              <span className="stat-item-value">
                {profile?.projectsCount || 0}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-item-label">Portfolio Views</span>
              <span className="stat-item-value">
                {profile?.portfolioViews || 0}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-item-label">AI Enhancements</span>
              <span className="stat-item-value">
                {profile?.aiEnhancementsCount || 0}
              </span>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="settings-section">
          <div className="settings-section-header">
            <h2 className="settings-section-title">Preferences</h2>
            <p className="settings-section-description">
              Customize your experience
            </p>
          </div>

          <form onSubmit={handleSavePreferences} className="settings-form">
            <div className="form-group">
              <label htmlFor="theme" className="form-label">
                Theme
              </label>
              <select
                id="theme"
                name="theme"
                className="form-select"
                value={preferencesForm.theme}
                onChange={handlePreferencesChange}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={preferencesForm.emailNotifications}
                  onChange={handlePreferencesChange}
                />
                <span className="checkbox-text">
                  <strong>Email Notifications</strong>
                  <span className="checkbox-description">
                    Receive notifications about your documents and activity
                  </span>
                </span>
              </label>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="marketingEmails"
                  checked={preferencesForm.marketingEmails}
                  onChange={handlePreferencesChange}
                />
                <span className="checkbox-text">
                  <strong>Marketing Emails</strong>
                  <span className="checkbox-description">
                    Receive updates about new features and promotions
                  </span>
                </span>
              </label>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </form>
        </section>

        {/* Account Info */}
        <section className="settings-section">
          <div className="settings-section-header">
            <h2 className="settings-section-title">Account Information</h2>
            <p className="settings-section-description">
              View your account details
            </p>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">User ID</span>
              <span className="info-value">{user?.uid}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Member Since</span>
              <span className="info-value">
                {profile?.createdAt
                  ? new Date(profile.createdAt.toDate()).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )
                  : "N/A"}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Last Login</span>
              <span className="info-value">
                {profile?.lastLoginAt
                  ? new Date(profile.lastLoginAt.toDate()).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )
                  : "N/A"}
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
