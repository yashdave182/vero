import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Input from "../../components/Input";
import Button from "../../components/Button";
import "./PortfolioBuilder.css";
import { useUser } from "../../lib/authContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import {
  savePortfolio,
  getPortfolio,
  publishPortfolio,
  deleteProject,
  validatePortfolio,
  getPortfolioUrl,
} from "../../lib/portfolioService";

export default function PortfolioBuilder() {
  const { user } = useUser();
  const { profile } = useUserProfile(user?.uid);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [data, setData] = useState({
    name: "",
    title: "",
    bio: "",
    skills: [],
    socials: {
      linkedin: "",
      github: "",
      twitter: "",
      portfolio: "",
    },
    projects: [],
    isPublished: false,
  });

  const [newSkill, setNewSkill] = useState("");

  // Load portfolio data on mount
  useEffect(() => {
    const loadPortfolio = async () => {
      if (!user?.uid) return;

      setLoading(true);
      const result = await getPortfolio(user.uid);

      if (result.success) {
        setData(result.data);
      } else {
        // Initialize with user profile data
        if (profile) {
          setData((prev) => ({
            ...prev,
            name: profile.displayName || user.displayName || "",
            bio: profile.bio || "",
          }));
        }
      }
      setLoading(false);
    };

    loadPortfolio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // Show message helper
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // Handle add skill
  const handleAddSkill = () => {
    if (newSkill.trim() && !data.skills.includes(newSkill.trim())) {
      setData({ ...data, skills: [...data.skills, newSkill.trim()] });
      setNewSkill("");
    }
  };

  // Handle remove skill
  const handleRemoveSkill = (skill) => {
    setData({ ...data, skills: data.skills.filter((s) => s !== skill) });
  };

  // Handle add project
  const handleAddProject = () => {
    if (data.projects.length >= 3) {
      showMessage("error", "Maximum 3 projects allowed");
      return;
    }

    const newProject = {
      id: Date.now().toString(),
      name: "",
      description: "",
      tech: [],
      liveUrl: "",
      githubUrl: "",
      image: "",
    };

    setData({ ...data, projects: [...data.projects, newProject] });
  };

  // Handle update project
  const handleUpdateProject = (projectId, field, value) => {
    setData({
      ...data,
      projects: data.projects.map((p) =>
        p.id === projectId ? { ...p, [field]: value } : p,
      ),
    });
  };

  // Handle add tech to project
  const handleAddTech = (projectId, tech) => {
    if (!tech.trim()) return;

    setData({
      ...data,
      projects: data.projects.map((p) =>
        p.id === projectId && !p.tech.includes(tech.trim())
          ? { ...p, tech: [...p.tech, tech.trim()] }
          : p,
      ),
    });
  };

  // Handle remove tech from project
  const handleRemoveTech = (projectId, tech) => {
    setData({
      ...data,
      projects: data.projects.map((p) =>
        p.id === projectId
          ? { ...p, tech: p.tech.filter((t) => t !== tech) }
          : p,
      ),
    });
  };

  // Handle delete project
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    // If project exists in Firestore, delete it
    if (user?.uid) {
      await deleteProject(user.uid, projectId);
    }

    setData({
      ...data,
      projects: data.projects.filter((p) => p.id !== projectId),
    });
    showMessage("success", "Project deleted successfully");
  };

  // Handle save
  const handleSave = async () => {
    if (!user?.uid) {
      showMessage("error", "You must be logged in to save");
      return;
    }

    setSaving(true);
    const result = await savePortfolio(user.uid, data);

    if (result.success) {
      showMessage("success", "Portfolio saved successfully!");
    } else {
      showMessage("error", result.error || "Failed to save portfolio");
    }

    setSaving(false);
  };

  // Handle publish
  const handlePublish = async () => {
    if (!user?.uid) {
      showMessage("error", "You must be logged in to publish");
      return;
    }

    // Validate portfolio
    const validation = validatePortfolio(data);
    if (!validation.valid) {
      showMessage("error", validation.errors[0]);
      return;
    }

    setSaving(true);

    // Save first
    const saveResult = await savePortfolio(user.uid, data);
    if (!saveResult.success) {
      showMessage("error", saveResult.error || "Failed to save portfolio");
      setSaving(false);
      return;
    }

    // Then publish
    const publishResult = await publishPortfolio(user.uid);

    if (publishResult.success) {
      setData({ ...data, isPublished: true });
      showMessage("success", "Portfolio published successfully!");
    } else {
      showMessage(
        "error",
        publishResult.error || "Failed to publish portfolio",
      );
    }

    setSaving(false);
  };

  // Handle preview
  const handlePreview = () => {
    if (!profile?.username) {
      showMessage("error", "Please set a username in Settings first");
      return;
    }
    const url = getPortfolioUrl(profile.username);
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="portfolio-builder">
          <div className="builder-loading">
            <div className="loading-spinner"></div>
            <p>Loading portfolio...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="portfolio-builder">
        <div className="builder-header">
          <div>
            <h1 className="builder-title">Portfolio Builder</h1>
            <p className="builder-subtitle">
              Customize your professional portfolio • {data.projects.length}/3
              projects
            </p>
          </div>
          <div className="builder-actions">
            <Button variant="secondary" onClick={handlePreview}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Preview
            </Button>
            <Button variant="secondary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Draft"}
            </Button>
            <Button variant="primary" onClick={handlePublish} disabled={saving}>
              {data.isPublished ? "Update & Publish" : "Publish"}
            </Button>
          </div>
        </div>

        {message.text && (
          <div className={`builder-message ${message.type}`}>
            {message.type === "success" ? (
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
            ) : (
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

        <div className="builder-content">
          {/* Editor Panel */}
          <div className="editor-panel">
            <section className="editor-section">
              <h2 className="editor-section-title">Basic Information</h2>
              <div className="editor-fields">
                <Input
                  label="Full Name *"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  placeholder="Your full name"
                  required
                />
                <Input
                  label="Title / Role *"
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                  placeholder="e.g. Full Stack Developer"
                  required
                />
                <div className="input-group">
                  <label className="input-label">
                    Bio *{" "}
                    <span className="char-count">{data.bio.length}/500</span>
                  </label>
                  <textarea
                    className="editor-textarea"
                    value={data.bio}
                    onChange={(e) => setData({ ...data, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    maxLength={500}
                    required
                  />
                </div>
              </div>
            </section>

            <section className="editor-section">
              <h2 className="editor-section-title">Skills *</h2>
              <div className="skills-input-row">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill (e.g. React, Python)..."
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddSkill())
                  }
                />
                <Button variant="secondary" onClick={handleAddSkill}>
                  Add
                </Button>
              </div>
              {data.skills.length > 0 ? (
                <div className="skills-list">
                  {data.skills.map((skill) => (
                    <span key={skill} className="skill-chip">
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="skill-remove"
                        type="button"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="empty-state-text">No skills added yet</p>
              )}
            </section>

            <section className="editor-section">
              <h2 className="editor-section-title">Social Links</h2>
              <div className="editor-fields">
                <Input
                  label="LinkedIn"
                  value={data.socials.linkedin}
                  onChange={(e) =>
                    setData({
                      ...data,
                      socials: { ...data.socials, linkedin: e.target.value },
                    })
                  }
                  placeholder="https://linkedin.com/in/username"
                  icon={
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  }
                />
                <Input
                  label="GitHub"
                  value={data.socials.github}
                  onChange={(e) =>
                    setData({
                      ...data,
                      socials: { ...data.socials, github: e.target.value },
                    })
                  }
                  placeholder="https://github.com/username"
                  icon={
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  }
                />
                <Input
                  label="Twitter / X"
                  value={data.socials.twitter}
                  onChange={(e) =>
                    setData({
                      ...data,
                      socials: { ...data.socials, twitter: e.target.value },
                    })
                  }
                  placeholder="https://twitter.com/username"
                  icon={
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  }
                />
                <Input
                  label="Personal Website"
                  value={data.socials.portfolio}
                  onChange={(e) =>
                    setData({
                      ...data,
                      socials: { ...data.socials, portfolio: e.target.value },
                    })
                  }
                  placeholder="https://yourwebsite.com"
                  icon={
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
                  }
                />
              </div>
            </section>

            <section className="editor-section">
              <div className="section-header-flex">
                <h2 className="editor-section-title">
                  Projects *{" "}
                  <span className="project-count">
                    ({data.projects.length}/3)
                  </span>
                </h2>
                {data.projects.length < 3 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleAddProject}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Project
                  </Button>
                )}
              </div>

              <div className="projects-list">
                {data.projects.length === 0 ? (
                  <div className="empty-state">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    <p>No projects yet</p>
                    <Button variant="primary" onClick={handleAddProject}>
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
                      Add Your First Project
                    </Button>
                  </div>
                ) : (
                  data.projects.map((project, index) => (
                    <div key={project.id} className="project-edit-card">
                      <div className="project-card-header">
                        <h3 className="project-number">Project {index + 1}</h3>
                        <button
                          className="delete-project-btn"
                          onClick={() => handleDeleteProject(project.id)}
                          title="Delete project"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>

                      <Input
                        label="Project Name *"
                        value={project.name}
                        onChange={(e) =>
                          handleUpdateProject(
                            project.id,
                            "name",
                            e.target.value,
                          )
                        }
                        placeholder="My Awesome Project"
                        required
                      />

                      <div className="input-group">
                        <label className="input-label">Description *</label>
                        <textarea
                          className="editor-textarea"
                          value={project.description}
                          onChange={(e) =>
                            handleUpdateProject(
                              project.id,
                              "description",
                              e.target.value,
                            )
                          }
                          placeholder="Describe your project..."
                          rows={3}
                          required
                        />
                      </div>

                      <Input
                        label="Live Project URL *"
                        value={project.liveUrl}
                        onChange={(e) =>
                          handleUpdateProject(
                            project.id,
                            "liveUrl",
                            e.target.value,
                          )
                        }
                        placeholder="https://myproject.com"
                        required
                        icon={
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                          </svg>
                        }
                      />

                      {project.liveUrl && (
                        <div className="project-preview">
                          <label className="input-label">
                            Live Preview
                            <span className="preview-note">
                              (If blank, the site may block embedding)
                            </span>
                          </label>
                          <div className="project-preview-container">
                            <iframe
                              src={project.liveUrl}
                              className="project-preview-iframe"
                              title={`${project.name} preview`}
                              sandbox="allow-scripts allow-same-origin allow-popups"
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                            />
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="project-preview-link"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                              </svg>
                              Visit Site
                            </a>
                          </div>
                        </div>
                      )}

                      <Input
                        label="GitHub URL (Optional)"
                        value={project.githubUrl}
                        onChange={(e) =>
                          handleUpdateProject(
                            project.id,
                            "githubUrl",
                            e.target.value,
                          )
                        }
                        placeholder="https://github.com/username/project"
                        icon={
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                        }
                      />

                      <div className="input-group">
                        <label className="input-label">Technologies Used</label>
                        <div className="tech-input-row">
                          <input
                            type="text"
                            className="tech-input"
                            placeholder="Add technology (e.g. React)"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddTech(project.id, e.target.value);
                                e.target.value = "";
                              }
                            }}
                          />
                        </div>
                        <div className="project-tech-chips">
                          {project.tech.map((tech) => (
                            <span key={tech} className="tech-chip">
                              {tech}
                              <button
                                onClick={() =>
                                  handleRemoveTech(project.id, tech)
                                }
                                className="tech-chip-remove"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Preview Panel */}
          <div className="preview-panel">
            <div className="preview-header">
              <span className="preview-label">Live Preview</span>
              {profile?.username && (
                <a
                  href={getPortfolioUrl(profile.username)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="preview-link"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  View Public Page
                </a>
              )}
            </div>
            <div className="preview-content">
              <div className="preview-portfolio">
                <div className="preview-hero">
                  <div className="preview-avatar">
                    {data.name
                      ? data.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "U"}
                  </div>
                  <h2 className="preview-name">{data.name || "Your Name"}</h2>
                  <p className="preview-title">{data.title || "Your Title"}</p>
                  <p className="preview-bio">
                    {data.bio || "Your bio will appear here..."}
                  </p>
                </div>

                {data.skills.length > 0 && (
                  <div className="preview-section">
                    <h3 className="preview-section-title">Skills</h3>
                    <div className="preview-skills">
                      {data.skills.map((skill) => (
                        <span key={skill} className="preview-skill-pill">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {data.projects.length > 0 && (
                  <div className="preview-section">
                    <h3 className="preview-section-title">Projects</h3>
                    <div className="preview-projects">
                      {data.projects.map((project) => (
                        <div key={project.id} className="preview-project-card">
                          {project.liveUrl ? (
                            <div className="preview-project-iframe-container">
                              <iframe
                                src={project.liveUrl}
                                className="preview-project-iframe"
                                title={project.name}
                                sandbox="allow-scripts allow-same-origin"
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <div className="preview-project-placeholder"></div>
                          )}
                          <h4 className="preview-project-name">
                            {project.name || "Project Name"}
                          </h4>
                          <p className="preview-project-desc">
                            {project.description || "Project description..."}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
