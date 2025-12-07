import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./Dashboard.css";
import { useUser } from "../../lib/authContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useRecentDocuments, useDocumentStats } from "../../hooks/useDocuments";

const quickActions = [
  {
    title: "Build Portfolio",
    description: "Create and customize your professional portfolio",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    path: "/dashboard/portfolio",
    color: "#2563EB",
  },
  {
    title: "Document Tools",
    description: "Enhance, sign, and convert your documents",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    path: "/dashboard/tools",
    color: "#0D9488",
  },
  {
    title: "Templates",
    description: "Resume, proposal, and cover letter templates",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    path: "/dashboard/templates",
    color: "#7C3AED",
  },
];

export default function Dashboard() {
  const { user } = useUser();
  const { profile, loading: profileLoading } = useUserProfile(user?.uid);
  const { documents: recentDocs, loading: docsLoading } = useRecentDocuments(
    user?.uid,
    5,
  );
  const { stats, loading: statsLoading } = useDocumentStats(user?.uid);

  // Extract first name from display name or use email
  const getFirstName = () => {
    if (profile?.displayName) {
      return profile.displayName.split(" ")[0];
    }
    if (user?.displayName) {
      return user.displayName.split(" ")[0];
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "there";
  };

  // Format date for document display
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";

    // Handle Firestore Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

    const options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  // Get public username for profile link
  const publicUsername = profile?.username || user?.uid;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              Welcome back, {getFirstName()}! 👋
            </h1>
            <p className="dashboard-subtitle">
              Here's what's happening with your workspace today.
            </p>
          </div>
          <Link
            to={`/u/${publicUsername}`}
            className="btn btn-secondary"
            target="_blank"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            View Public Profile
          </Link>
        </div>

        {/* Stats Row */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{ background: "rgba(37, 99, 235, 0.1)", color: "#2563EB" }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">
                {profileLoading
                  ? "..."
                  : (profile?.portfolioViews || 0).toLocaleString()}
              </span>
              <span className="stat-label">Portfolio Views</span>
            </div>
          </div>
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                background: "rgba(13, 148, 136, 0.1)",
                color: "#0D9488",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">
                {statsLoading ? "..." : stats.total}
              </span>
              <span className="stat-label">Documents</span>
            </div>
          </div>
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                background: "rgba(124, 58, 237, 0.1)",
                color: "#7C3AED",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">
                {profileLoading ? "..." : profile?.projectsCount || 0}
              </span>
              <span className="stat-label">Projects</span>
            </div>
          </div>
          <div className="stat-card">
            <div
              className="stat-icon"
              style={{
                background: "rgba(245, 158, 11, 0.1)",
                color: "#F59E0B",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">
                {profileLoading ? "..." : profile?.aiEnhancementsCount || 0}
              </span>
              <span className="stat-label">AI Enhancements</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="dashboard-section">
          <h2 className="section-heading">Quick Actions</h2>
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.path} className="quick-action-card">
                <div
                  className="quick-action-icon"
                  style={{
                    background: `${action.color}15`,
                    color: action.color,
                  }}
                >
                  {action.icon}
                </div>
                <div className="quick-action-content">
                  <h3 className="quick-action-title">{action.title}</h3>
                  <p className="quick-action-description">
                    {action.description}
                  </p>
                </div>
                <svg
                  className="quick-action-arrow"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Documents */}
        <section className="dashboard-section">
          <div className="section-header-row">
            <h2 className="section-heading">Recent Documents</h2>
            <Link to="/dashboard/documents" className="section-link">
              View All
            </Link>
          </div>

          {docsLoading ? (
            <div className="documents-loading">
              <p>Loading documents...</p>
            </div>
          ) : recentDocs.length === 0 ? (
            <div className="documents-empty">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                style={{ opacity: 0.3, margin: "0 auto 1rem" }}
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <p>No documents yet</p>
              <p
                style={{
                  fontSize: "0.875rem",
                  opacity: 0.7,
                  marginTop: "0.5rem",
                }}
              >
                Create your first document using the quick actions above
              </p>
            </div>
          ) : (
            <div className="documents-table">
              <div className="documents-header">
                <span>Name</span>
                <span>Type</span>
                <span>Date</span>
                <span>Actions</span>
              </div>
              {recentDocs.map((doc) => (
                <div key={doc.id} className="document-row">
                  <span className="document-name">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    {doc.title || "Untitled Document"}
                  </span>
                  <span className="document-type">
                    <span className="type-badge">
                      {doc.type
                        ? doc.type.charAt(0).toUpperCase() + doc.type.slice(1)
                        : "Document"}
                    </span>
                  </span>
                  <span className="document-date">
                    {formatDate(doc.updatedAt || doc.createdAt)}
                  </span>
                  <span className="document-actions">
                    <button className="doc-action-btn" title="Download">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </button>
                    <button className="doc-action-btn" title="Edit">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
