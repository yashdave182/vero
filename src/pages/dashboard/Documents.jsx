import { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./Dashboard.css";
import { useUser } from "../../lib/authContext";
import { useDocuments } from "../../hooks/useDocuments";
import { deleteDocument } from "../../lib/documentService";

export default function Documents() {
  const { user } = useUser();
  const [filterType, setFilterType] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { documents, loading, refetch } = useDocuments(user?.uid, {
    type: filterType,
  });

  // Filter documents by search query
  const filteredDocuments = documents.filter((doc) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      doc.title?.toLowerCase().includes(query) ||
      doc.type?.toLowerCase().includes(query) ||
      doc.description?.toLowerCase().includes(query)
    );
  });

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle delete
  const handleDelete = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    const result = await deleteDocument(docId);
    if (result.success) {
      refetch();
    } else {
      alert("Failed to delete document: " + result.error);
    }
  };

  // Document type badge color
  const getTypeBadgeColor = (type) => {
    const colors = {
      resume: "#2563EB",
      proposal: "#0D9488",
      contract: "#7C3AED",
      cover_letter: "#F59E0B",
      portfolio: "#EC4899",
    };
    return colors[type?.toLowerCase()] || "#6B7280";
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">My Documents</h1>
            <p className="dashboard-subtitle">
              Manage all your documents in one place
            </p>
          </div>
          <button className="btn btn-primary">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Document
          </button>
        </div>

        {/* Filters and Search */}
        <div className="documents-controls">
          <div className="document-filters">
            <button
              className={`filter-chip ${!filterType ? "active" : ""}`}
              onClick={() => setFilterType(null)}
            >
              All
            </button>
            <button
              className={`filter-chip ${filterType === "resume" ? "active" : ""}`}
              onClick={() => setFilterType("resume")}
            >
              Resumes
            </button>
            <button
              className={`filter-chip ${filterType === "proposal" ? "active" : ""}`}
              onClick={() => setFilterType("proposal")}
            >
              Proposals
            </button>
            <button
              className={`filter-chip ${filterType === "contract" ? "active" : ""}`}
              onClick={() => setFilterType("contract")}
            >
              Contracts
            </button>
            <button
              className={`filter-chip ${filterType === "cover_letter" ? "active" : ""}`}
              onClick={() => setFilterType("cover_letter")}
            >
              Cover Letters
            </button>
          </div>

          <div className="search-box">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Documents List */}
        <section className="dashboard-section">
          {loading ? (
            <div className="documents-loading">
              <p>Loading documents...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="documents-empty">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                style={{ opacity: 0.3, margin: "0 auto 1rem" }}
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <p>
                {searchQuery || filterType
                  ? "No documents found"
                  : "No documents yet"}
              </p>
              <p
                style={{
                  fontSize: "0.875rem",
                  opacity: 0.7,
                  marginTop: "0.5rem",
                }}
              >
                {searchQuery || filterType
                  ? "Try adjusting your filters or search query"
                  : "Create your first document to get started"}
              </p>
              {!searchQuery && !filterType && (
                <button
                  className="btn btn-primary"
                  style={{ marginTop: "1.5rem" }}
                >
                  Create Document
                </button>
              )}
            </div>
          ) : (
            <div className="documents-grid">
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="document-card">
                  <div className="document-card-header">
                    <div className="document-card-icon">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div className="document-card-menu">
                      <button className="icon-btn">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="document-card-body">
                    <h3 className="document-card-title">
                      {doc.title || "Untitled Document"}
                    </h3>
                    <p className="document-card-description">
                      {doc.description || "No description"}
                    </p>

                    <div className="document-card-meta">
                      <span
                        className="type-badge"
                        style={{
                          background: `${getTypeBadgeColor(doc.type)}15`,
                          color: getTypeBadgeColor(doc.type),
                        }}
                      >
                        {doc.type
                          ? doc.type
                              .replace("_", " ")
                              .charAt(0)
                              .toUpperCase() +
                            doc.type.replace("_", " ").slice(1)
                          : "Document"}
                      </span>
                      <span className="document-date">
                        {formatDate(doc.updatedAt || doc.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="document-card-footer">
                    <button className="btn btn-ghost btn-sm" title="Edit">
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
                      Edit
                    </button>
                    <button className="btn btn-ghost btn-sm" title="Download">
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
                      Download
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      title="Delete"
                      onClick={() => handleDelete(doc.id)}
                      style={{ color: "#DC2626" }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
