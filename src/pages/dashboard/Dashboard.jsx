import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./Dashboard.css";
import { useUser } from "../../lib/authContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useDocumentStats } from "../../hooks/useDocuments";
import { useRecentActivities } from "../../hooks/useActivities";
import { useActiveSuggestions } from "../../hooks/useSuggestions";
import { useAnalytics } from "../../hooks/useAnalytics";

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
    bgColor: "#EFF6FF",
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
    path: "/dashboard/documents",
    color: "#0D9488",
    bgColor: "#CCFBF1",
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
    bgColor: "#F3E8FF",
  },
];

export default function Dashboard() {
  const { user } = useUser();
  const { profile, loading: profileLoading } = useUserProfile(user?.uid);
  const { stats, loading: statsLoading } = useDocumentStats(user?.uid);
  const { activities, loading: activitiesLoading } = useRecentActivities(
    user?.uid,
    3,
  );
  const { suggestions, loading: suggestionsLoading } = useActiveSuggestions(
    user?.uid,
    2,
  );
  const { trends, loading: trendsLoading } = useAnalytics(user?.uid);

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

  // Calculate portfolio completion percentage
  const calculatePortfolioCompletion = () => {
    if (!profile) return 0;
    let completion = 0;
    const fields = [
      profile.displayName,
      profile.bio,
      profile.username,
      profile.projects && profile.projects.length > 0,
      profile.skills && profile.skills.length > 0,
      profile.photoURL,
      profile.experience && profile.experience.length > 0,
      profile.education && profile.education.length > 0,
    ];

    fields.forEach((field) => {
      if (field) completion += 12.5;
    });

    return Math.round(completion);
  };

  const portfolioCompletion = calculatePortfolioCompletion();

  // Format date for activity display
  const formatDate = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Get trend data or use default
  const getTrend = (type) => {
    if (trendsLoading || !trends) {
      return { value: 0, isPositive: true };
    }
    return trends[type] || { value: 0, isPositive: true };
  };

  // Get activity icon and color based on type
  const getActivityIconAndColor = (activity) => {
    const type = activity.type?.toLowerCase();
    const action = activity.action?.toLowerCase();

    if (action === "completed" || action === "published") {
      return {
        icon: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        ),
        bgColor: "#d1fae5",
        color: "#10b981",
      };
    } else if (type === "project") {
      return {
        icon: (
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
        ),
        bgColor: "#dbeafe",
        color: "#2563EB",
      };
    } else if (type === "document") {
      return {
        icon: (
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
        ),
        bgColor: "#ccfbf1",
        color: "#0D9488",
      };
    }

    return {
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
      bgColor: "#f3f4f6",
      color: "#6b7280",
    };
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        {/* Header with Welcome Message */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              Welcome back, {getFirstName()}! 👋
            </h1>
            <p className="dashboard-subtitle">
              Here's what's happening with your workspace today.
            </p>
          </div>
          <div className="header-right">
            <button className="btn-share">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              Share
            </button>
            <div className="welcome-illustration">
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="20"
                  y="30"
                  width="60"
                  height="70"
                  rx="4"
                  fill="#EFF6FF"
                  stroke="#BFDBFE"
                  strokeWidth="2"
                />
                <rect
                  x="30"
                  y="45"
                  width="40"
                  height="3"
                  rx="1.5"
                  fill="#93C5FD"
                />
                <rect
                  x="30"
                  y="55"
                  width="30"
                  height="3"
                  rx="1.5"
                  fill="#93C5FD"
                />
                <rect
                  x="30"
                  y="65"
                  width="35"
                  height="3"
                  rx="1.5"
                  fill="#93C5FD"
                />
                <circle cx="95" cy="25" r="15" fill="#4F46E5" opacity="0.2" />
                <circle cx="95" cy="25" r="8" fill="#4F46E5" />
                <path
                  d="M91 25L93.5 27.5L99 22"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Portfolio Completion */}
        <div className="portfolio-completion-card">
          <div className="completion-header">
            <div>
              <h3 className="completion-title">Portfolio Completion</h3>
              <div className="completion-percentage">
                {profileLoading ? "..." : `${portfolioCompletion}%`}
              </div>
            </div>
            <Link to="/dashboard/portfolio" className="btn-complete">
              Complete your portfolio
            </Link>
          </div>
          <div className="completion-bar">
            <div
              className="completion-progress"
              style={{ width: `${portfolioCompletion}%` }}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div
              className="stat-icon-wrapper"
              style={{ backgroundColor: "#EFF6FF" }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div className="stat-info">
              {!trendsLoading && getTrend("portfolioViews").value > 0 && (
                <div
                  className={`stat-trend ${getTrend("portfolioViews").isPositive ? "positive" : "negative"}`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline
                      points={
                        getTrend("portfolioViews").isPositive
                          ? "18 15 12 9 6 15"
                          : "6 9 12 15 18 9"
                      }
                    />
                  </svg>
                  {getTrend("portfolioViews").value}%
                </div>
              )}
              <div className="stat-value">
                {profileLoading
                  ? "..."
                  : (profile?.portfolioViews || 0).toLocaleString()}
              </div>
              <div className="stat-label">Portfolio Views</div>
            </div>
          </div>

          <div className="stat-card">
            <div
              className="stat-icon-wrapper"
              style={{ backgroundColor: "#CCFBF1" }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0D9488"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="stat-info">
              {!trendsLoading && getTrend("documents").value > 0 && (
                <div
                  className={`stat-trend ${getTrend("documents").isPositive ? "positive" : "negative"}`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline
                      points={
                        getTrend("documents").isPositive
                          ? "18 15 12 9 6 15"
                          : "6 9 12 15 18 9"
                      }
                    />
                  </svg>
                  {getTrend("documents").value}
                </div>
              )}
              <div className="stat-value">
                {statsLoading ? "..." : stats.total || 0}
              </div>
              <div className="stat-label">Documents</div>
            </div>
          </div>

          <div className="stat-card">
            <div
              className="stat-icon-wrapper"
              style={{ backgroundColor: "#F3E8FF" }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#7C3AED"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3" />
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="12" r="8" />
              </svg>
            </div>
            <div className="stat-info">
              {!trendsLoading && getTrend("projects").value > 0 && (
                <div
                  className={`stat-trend ${getTrend("projects").isPositive ? "positive" : "negative"}`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline
                      points={
                        getTrend("projects").isPositive
                          ? "18 15 12 9 6 15"
                          : "6 9 12 15 18 9"
                      }
                    />
                  </svg>
                  {getTrend("projects").value}
                </div>
              )}
              <div className="stat-value">
                {profileLoading ? "..." : profile?.projectsCount || 0}
              </div>
              <div className="stat-label">Projects</div>
            </div>
          </div>

          <div className="stat-card">
            <div
              className="stat-icon-wrapper"
              style={{ backgroundColor: "#FEF3C7" }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div className="stat-info">
              {!trendsLoading && getTrend("aiEnhancements").value > 0 && (
                <div
                  className={`stat-trend ${getTrend("aiEnhancements").isPositive ? "positive" : "negative"}`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline
                      points={
                        getTrend("aiEnhancements").isPositive
                          ? "18 15 12 9 6 15"
                          : "6 9 12 15 18 9"
                      }
                    />
                  </svg>
                  {getTrend("aiEnhancements").value}%
                </div>
              )}
              <div className="stat-value">
                {profileLoading ? "..." : profile?.aiEnhancementsCount || 0}
              </div>
              <div className="stat-label">AI Enhancements</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="dashboard-section">
          <h2 className="section-heading">Quick Actions</h2>
          <div className="quick-actions-grid-new">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className="quick-action-card-new"
              >
                <div
                  className="quick-action-icon-new"
                  style={{ backgroundColor: action.bgColor }}
                >
                  <div style={{ color: action.color }}>{action.icon}</div>
                </div>
                <h3 className="quick-action-title-new">{action.title}</h3>
                <p className="quick-action-description-new">
                  {action.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Activity & Suggestions */}
        <section className="dashboard-section">
          <div className="section-header-row">
            <h2 className="section-heading">Recent Activity & Suggestions</h2>
            <Link to="/dashboard/documents" className="section-link">
              View All
            </Link>
          </div>

          <div className="activity-list">
            {/* Loading State */}
            {(activitiesLoading || suggestionsLoading) && (
              <div className="activity-item">
                <div className="activity-icon loading-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </div>
                <div className="activity-content">
                  <p className="activity-text">Loading recent activity...</p>
                </div>
              </div>
            )}

            {/* Recent Activities from Firestore */}
            {!activitiesLoading &&
              activities &&
              activities.length > 0 &&
              activities.slice(0, 2).map((activity) => {
                const iconData = getActivityIconAndColor(activity);
                return (
                  <div key={activity.id} className="activity-item">
                    <div
                      className="activity-icon"
                      style={{
                        backgroundColor: iconData.bgColor,
                        color: iconData.color,
                      }}
                    >
                      {iconData.icon}
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">
                        <strong>{activity.type || "Item"}</strong> "
                        {activity.title || "Untitled"}" was{" "}
                        {activity.action || "updated"}
                      </p>
                      <span className="activity-time">
                        {formatDate(activity.createdAt)}
                      </span>
                    </div>
                    {activity.action === "completed" && (
                      <span className="activity-status completed">
                        Completed
                      </span>
                    )}
                  </div>
                );
              })}

            {/* AI Suggestions from Firestore */}
            {!suggestionsLoading &&
              suggestions &&
              suggestions.length > 0 &&
              suggestions.slice(0, 1).map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="activity-item suggestion-item"
                >
                  <div className="activity-icon suggestion-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <div className="activity-content">
                    <p className="activity-text">
                      <strong className="suggestion-label">
                        AI Suggestion:
                      </strong>{" "}
                      {suggestion.title}
                    </p>
                    {suggestion.description && (
                      <p className="activity-description">
                        {suggestion.description}
                      </p>
                    )}
                  </div>
                  <Link
                    to={suggestion.actionUrl || "/dashboard/portfolio"}
                    className="activity-action"
                  >
                    View
                  </Link>
                </div>
              ))}

            {/* Default state when no activities or suggestions */}
            {!activitiesLoading &&
              !suggestionsLoading &&
              (!activities || activities.length === 0) &&
              (!suggestions || suggestions.length === 0) && (
                <>
                  <div className="activity-item">
                    <div
                      className="activity-icon"
                      style={{
                        backgroundColor: "#f3f4f6",
                        color: "#6b7280",
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
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">
                        No recent activity yet. Start by creating your first
                        project or document!
                      </p>
                    </div>
                  </div>

                  <div className="activity-item suggestion-item">
                    <div className="activity-icon suggestion-icon">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">
                        <strong className="suggestion-label">
                          AI Suggestion:
                        </strong>{" "}
                        Complete your portfolio to get personalized
                        recommendations
                      </p>
                      <p className="activity-description">
                        Add your bio, skills, and projects to unlock AI-powered
                        insights.
                      </p>
                    </div>
                    <Link to="/dashboard/portfolio" className="activity-action">
                      Get Started
                    </Link>
                  </div>
                </>
              )}
          </div>
        </section>
      </main>
    </div>
  );
}
