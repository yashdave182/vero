import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./TemplateGenerator.css";
import { useTemplate } from "../../hooks/useTemplates";
import { useUser } from "../../lib/authContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import { getPortfolio } from "../../lib/portfolioService";
import {
  generateResume,
  generateCoverLetter,
  generateProposal,
  generateInvoice,
  generateContract,
  exportPortfolioPDF,
  downloadBlob,
} from "../../lib/templateService";

export default function TemplateGenerator() {
  const templateId = useParams().templateId;
  const navigate = useNavigate();
  const { user } = useUser();
  const { profile } = useUserProfile(user?.uid);
  const { template, loading: templateLoading } = useTemplate(templateId);

  const [formData, setFormData] = useState({});
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [portfolio, setPortfolio] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  // Load portfolio data
  useEffect(() => {
    const loadPortfolio = async () => {
      if (user?.uid) {
        const result = await getPortfolio(user.uid);
        if (result.success) {
          setPortfolio(result.data);
        }
      }
    };
    loadPortfolio();
  }, [user?.uid]);

  // Pre-fill form with user profile and portfolio data
  useEffect(() => {
    if (profile && templateId) {
      const prefillData = {};

      if (templateId === "resume" || templateId === "portfolio-pdf") {
        prefillData.name = profile.displayName || "";
        prefillData.email = profile.email || "";
        prefillData.phone = profile.phone || "";
        prefillData.bio = portfolio?.bio || profile.bio || "";
        prefillData.skills = portfolio?.skills || profile.skills || [];
        prefillData.experience = profile.experience || [];
        prefillData.education = profile.education || [];
        prefillData.projects = portfolio?.projects || [];
        prefillData.location = profile.location || "";
        prefillData.linkedin =
          portfolio?.socials?.linkedin || profile.socials?.linkedin || "";
        prefillData.website =
          portfolio?.socials?.website || profile.website || "";
        prefillData.title = portfolio?.title || "";
        prefillData.enhanceWithAI = false;
      } else if (templateId === "cover-letter") {
        prefillData.name = profile.displayName || "";
        prefillData.email = profile.email || "";
        prefillData.phone = profile.phone || "";
        prefillData.skills = portfolio?.skills || profile.skills || [];
        prefillData.generateWithAI = true;
      }

      setFormData(prefillData);
    }
  }, [profile, portfolio, templateId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      let result;

      switch (templateId) {
        case "resume":
          result = await generateResume(formData);
          break;
        case "cover-letter":
          result = await generateCoverLetter(formData);
          break;
        case "proposal":
          result = await generateProposal(formData);
          break;
        case "invoice":
          result = await generateInvoice(formData);
          break;
        case "contract":
          result = await generateContract(formData);
          break;
        case "portfolio-pdf":
          result = await exportPortfolioPDF(formData);
          break;
        default:
          throw new Error("Invalid template");
      }

      if (result.success) {
        downloadBlob(result.blob, result.filename);
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      } else {
        setError(result.error || "Failed to generate document");
      }
    } catch (err) {
      console.error("Generation error:", err);
      setError(err.message || "Failed to generate document");
    } finally {
      setGenerating(false);
    }
  };

  if (templateLoading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="template-generator-page">
          <div className="loading-container">
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
            <p>Loading template...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="template-generator-page">
          <div className="error-container">
            <h2>Template Not Found</h2>
            <p>The requested template could not be found.</p>
            <button
              onClick={() => navigate("/dashboard/templates")}
              className="btn btn-primary"
            >
              Back to Templates
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="template-generator-page">
        <div className="generator-header">
          <button
            onClick={() => navigate("/dashboard/templates")}
            className="back-button"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Templates
          </button>
          <div className="header-content">
            <div className="template-icon-large">{template.icon}</div>
            <div>
              <h1 className="generator-title">{template.name}</h1>
              <p className="generator-subtitle">{template.description}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
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
              <strong>Generation Failed</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
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
            <div>
              <strong>Success!</strong>
              <p>Your document has been generated and downloaded.</p>
            </div>
          </div>
        )}

        <div className="generator-content">
          <div className="form-section">
            <h2 className="section-title">Document Information</h2>

            {templateId === "resume" && (
              <>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ""}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ""}
                      onChange={handleInputChange}
                      placeholder="+1234567890"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Professional Summary</label>
                  <textarea
                    name="bio"
                    value={formData.bio || ""}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Brief professional summary..."
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="enhanceWithAI"
                      checked={formData.enhanceWithAI || false}
                      onChange={handleInputChange}
                    />
                    <span>Enhance content with AI</span>
                  </label>
                  <p className="help-text">
                    AI will improve descriptions and formatting
                  </p>
                </div>
              </>
            )}

            {templateId === "cover-letter" && (
              <>
                <div className="form-group">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ""}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ""}
                      onChange={handleInputChange}
                      placeholder="+1234567890"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Company Name *</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company || ""}
                      onChange={handleInputChange}
                      placeholder="Tech Corp"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Position *</label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position || ""}
                      onChange={handleInputChange}
                      placeholder="Senior Developer"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Hiring Manager (Optional)</label>
                  <input
                    type="text"
                    name="hiringManager"
                    value={formData.hiringManager || ""}
                    onChange={handleInputChange}
                    placeholder="Jane Smith"
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="generateWithAI"
                      checked={formData.generateWithAI !== false}
                      onChange={handleInputChange}
                    />
                    <span>Generate content with AI</span>
                  </label>
                  <p className="help-text">
                    AI will create personalized cover letter content
                  </p>
                </div>
              </>
            )}

            {templateId === "proposal" && (
              <>
                <div className="form-group">
                  <label>Proposal Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title || ""}
                    onChange={handleInputChange}
                    placeholder="Web Development Proposal"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Client Name *</label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName || ""}
                      onChange={handleInputChange}
                      placeholder="ABC Company"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Prepared By</label>
                    <input
                      type="text"
                      name="preparedBy"
                      value={formData.preparedBy || ""}
                      onChange={handleInputChange}
                      placeholder="Your Company"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Project Title *</label>
                  <input
                    type="text"
                    name="projectTitle"
                    value={formData.projectTitle || ""}
                    onChange={handleInputChange}
                    placeholder="E-commerce Website Development"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Timeline</label>
                    <input
                      type="text"
                      name="timeline"
                      value={formData.timeline || ""}
                      onChange={handleInputChange}
                      placeholder="3 months"
                    />
                  </div>
                  <div className="form-group">
                    <label>Budget</label>
                    <input
                      type="text"
                      name="budget"
                      value={formData.budget || ""}
                      onChange={handleInputChange}
                      placeholder="$50,000"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="generateWithAI"
                      checked={formData.generateWithAI !== false}
                      onChange={handleInputChange}
                    />
                    <span>Generate proposal content with AI</span>
                  </label>
                </div>
              </>
            )}

            {templateId === "invoice" && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Invoice Number *</label>
                    <input
                      type="text"
                      name="invoiceNumber"
                      value={formData.invoiceNumber || `INV-${Date.now()}`}
                      onChange={handleInputChange}
                      placeholder="INV-001"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Client Name *</label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName || ""}
                    onChange={handleInputChange}
                    placeholder="Client Name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Client Email</label>
                  <input
                    type="email"
                    name="clientEmail"
                    value={formData.clientEmail || ""}
                    onChange={handleInputChange}
                    placeholder="client@example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes || ""}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Thank you for your business"
                  />
                </div>
              </>
            )}

            {templateId === "contract" && (
              <>
                <div className="form-group">
                  <label>Contract Type *</label>
                  <input
                    type="text"
                    name="contractType"
                    value={formData.contractType || ""}
                    onChange={handleInputChange}
                    placeholder="Freelance Service Agreement"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Service Provider Name *</label>
                    <input
                      type="text"
                      name="freelancerName"
                      value={formData.freelancerName || ""}
                      onChange={handleInputChange}
                      placeholder="Your Name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Client Name *</label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName || ""}
                      onChange={handleInputChange}
                      placeholder="Client Name"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="generateWithAI"
                      checked={formData.generateWithAI !== false}
                      onChange={handleInputChange}
                    />
                    <span>Generate contract terms with AI</span>
                  </label>
                </div>
              </>
            )}

            {templateId === "portfolio-pdf" && (
              <>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Professional Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title || ""}
                    onChange={handleInputChange}
                    placeholder="Full Stack Developer"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio || ""}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Brief professional bio..."
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="enhanceWithAI"
                      checked={formData.enhanceWithAI || false}
                      onChange={handleInputChange}
                    />
                    <span>Enhance portfolio with AI</span>
                  </label>
                </div>
              </>
            )}
          </div>

          <div className="actions-section">
            {/* Debug Section */}
            {(templateId === "resume" || templateId === "portfolio-pdf") && (
              <div className="debug-section" style={{ marginBottom: "20px" }}>
                <button
                  type="button"
                  onClick={() => setShowDebug(!showDebug)}
                  className="btn btn-secondary"
                  style={{
                    width: "100%",
                    marginBottom: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>🔍 Show Data Preview</span>
                  <span>{showDebug ? "▼" : "▶"}</span>
                </button>

                {showDebug && (
                  <div
                    className="debug-content"
                    style={{
                      background: "#f5f5f5",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "15px",
                      marginBottom: "15px",
                      maxHeight: "400px",
                      overflow: "auto",
                      fontSize: "12px",
                      fontFamily: "monospace",
                    }}
                  >
                    <h4 style={{ marginTop: 0, color: "#333" }}>
                      Portfolio Data (What will be sent):
                    </h4>
                    <div style={{ marginBottom: "10px" }}>
                      <strong>Name:</strong> {formData.name || "(empty)"}
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <strong>Email:</strong> {formData.email || "(empty)"}
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <strong>Phone:</strong> {formData.phone || "(empty)"}
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <strong>Bio/Summary:</strong> {formData.bio || "(empty)"}
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <strong>Skills ({formData.skills?.length || 0}):</strong>
                      <pre style={{ margin: "5px 0", whiteSpace: "pre-wrap" }}>
                        {JSON.stringify(formData.skills, null, 2)}
                      </pre>
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <strong>
                        Projects ({formData.projects?.length || 0}):
                      </strong>
                      <pre style={{ margin: "5px 0", whiteSpace: "pre-wrap" }}>
                        {JSON.stringify(formData.projects, null, 2)}
                      </pre>
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <strong>
                        Experience ({formData.experience?.length || 0}):
                      </strong>
                      <pre style={{ margin: "5px 0", whiteSpace: "pre-wrap" }}>
                        {JSON.stringify(formData.experience, null, 2)}
                      </pre>
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <strong>
                        Education ({formData.education?.length || 0}):
                      </strong>
                      <pre style={{ margin: "5px 0", whiteSpace: "pre-wrap" }}>
                        {JSON.stringify(formData.education, null, 2)}
                      </pre>
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <strong>AI Enhancement:</strong>{" "}
                      {formData.enhanceWithAI ? "✅ Enabled" : "❌ Disabled"}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn btn-primary btn-generate"
            >
              {generating ? (
                <>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="spinning"
                  >
                    <circle cx="12" cy="12" r="10" opacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Generate Document
                </>
              )}
            </button>

            <div className="info-box">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <div>
                <strong>How it works</strong>
                <p>
                  Fill in the required fields above. Click "Generate Document"
                  to create your {template.name.toLowerCase()}. The document
                  will be downloaded automatically.
                </p>
                {template.aiEnhancement && (
                  <p className="ai-info">
                    ✨ AI enhancement is available for this template to improve
                    content quality.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
