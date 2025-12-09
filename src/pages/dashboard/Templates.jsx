import { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./Templates.css";
import {
  useTemplates,
  useTemplateCategories,
  useFilteredTemplates,
} from "../../hooks/useTemplates";

export default function Templates() {
  const { templates, loading, error } = useTemplates();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = useTemplateCategories(templates);
  const filteredTemplates = useFilteredTemplates(templates, selectedCategory);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="templates-page">
        <div className="templates-header">
          <div>
            <h1 className="templates-title">Templates</h1>
            <p className="templates-subtitle">
              Choose a template to get started with AI-powered document
              generation
            </p>
          </div>
          <div className="templates-status">
            {loading && (
              <span className="status-badge loading">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" opacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                </svg>
                Loading templates...
              </span>
            )}
            {error && (
              <span className="status-badge error">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Using offline templates
              </span>
            )}
            {!loading && !error && (
              <span className="status-badge success">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {templates.length} templates available
              </span>
            )}
          </div>
        </div>

        <div className="templates-filters">
          {categories.map((category) => (
            <button
              key={category}
              className={`filter-btn ${selectedCategory === category ? "active" : ""}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="templates-loading">
            <div className="loading-spinner">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" opacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
            </div>
            <p>Loading templates from backend...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="templates-empty">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <h3>No templates found</h3>
            <p>Try selecting a different category</p>
          </div>
        ) : (
          <div className="templates-grid">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="template-card">
                <div className="template-preview">
                  <div className="template-preview-content">
                    <span className="template-icon">{template.icon}</span>
                  </div>
                </div>
                <div className="template-info">
                  <span className="template-category">{template.category}</span>
                  <h3 className="template-name">{template.name}</h3>
                  <p className="template-description">{template.description}</p>
                  <Link
                    to={`/dashboard/templates/${template.id}`}
                    className="btn btn-primary template-btn"
                  >
                    Generate
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="templates-notice">
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
            <div>
              <strong>Backend API Unavailable</strong>
              <p>
                Showing offline templates. Some features may be limited. The
                backend service at{" "}
                <a
                  href="https://huggingface.co/spaces/omgy/vero_template"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Hugging Face
                </a>{" "}
                may be starting up or temporarily unavailable.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
