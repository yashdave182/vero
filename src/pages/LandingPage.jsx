import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./LandingPage.css";

const features = [
  {
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
        <circle cx="12" cy="15" r="2" />
        <path d="M12 12v1" />
      </svg>
    ),
    title: "AI Resume & Proposal Builder",
    description:
      "Generate professional resumes and client proposals in seconds with AI assistance.",
  },
  {
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
    title: "Portfolio Space",
    description:
      "Publish your work with a beautiful, personalized portfolio page.",
  },
  {
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
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: "AI Document Enhancer",
    description:
      "Transform your documents with smart formatting and content suggestions.",
  },
  {
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
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
      </svg>
    ),
    title: "Digital Signing",
    description:
      "Sign documents electronically with secure, legally-binding signatures.",
  },
  {
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
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "Project Storage",
    description:
      "Keep all your files organized and accessible in one secure location.",
  },
  {
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
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    title: "Showcase Publicly",
    description:
      "Share your portfolio with a custom URL and attract more clients.",
  },
];

const steps = [
  {
    number: "01",
    title: "Sign up & Create Workspace",
    description:
      "Get started in seconds with a free account and personalized workspace.",
  },
  {
    number: "02",
    title: "Upload or Generate Documents",
    description: "Use AI to create documents or upload your existing files.",
  },
  {
    number: "03",
    title: "Share Portfolio with Clients",
    description: "Publish your work and share your unique portfolio link.",
  },
];

const tools = [
  {
    title: "Enhance Document",
    description: "Improve writing quality and formatting",
    icon: "✨",
  },
  {
    title: "Sign PDF",
    description: "Add digital signatures to any PDF",
    icon: "✍️",
  },
  {
    title: "Convert & Format",
    description: "Convert between PDF, DOCX, and more",
    icon: "🔄",
  },
];

export default function LandingPage() {
  return (
    <div className="landing-page">
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-gradient" />
          <div className="hero-pattern" />
        </div>
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span>🚀 Now in Public Beta</span>
            </div>
            <h1 className="hero-title">
              Build Your Freelance Identity in One Workspace
            </h1>
            <p className="hero-subtitle">
              Portfolios, Resumes, Proposals & Document Tools — Powered by AI.
            </p>

            <div className="hero-actions">
              <Link
                to="/auth/signup"
                className="btn btn-primary btn-lg animate-slide-up"
                aria-label="Get started free"
              >
                Get Started Free
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />

                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>

              <Link
                to="/dashboard/tools"
                className="btn btn-secondary btn-lg animate-slide-up"
                aria-label="Try AI tools"
              >
                Try Tools
              </Link>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-number">10K+</span>
                <span className="hero-stat-label">Portfolios Created</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-number">50K+</span>
                <span className="hero-stat-label">Documents Enhanced</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-number">4.9</span>
                <span className="hero-stat-label">User Rating</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-mockup">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="mockup-content">
                <div className="mockup-sidebar">
                  <div className="mockup-nav-item active"></div>
                  <div className="mockup-nav-item"></div>
                  <div className="mockup-nav-item"></div>
                  <div className="mockup-nav-item"></div>
                </div>
                <div className="mockup-main">
                  <div className="mockup-card"></div>
                  <div className="mockup-card"></div>
                  <div className="mockup-card-wide"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Features</span>
            <h2 className="section-title">Everything you need to succeed</h2>
            <p className="section-subtitle">
              Powerful tools designed to help freelancers build their
              professional presence.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card animate-fade-in"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>

                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="section section-gray how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">How it Works</span>
            <h2 className="section-title">Get started in minutes</h2>
            <p className="section-subtitle">
              Three simple steps to build your professional identity.
            </p>
          </div>

          <div className="steps-grid">
            {steps.map((step, index) => (
              <div
                key={index}
                className="step-card animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="step-number">{step.number}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="step-connector">
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Preview */}
      <section id="tools" className="section tools-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Tools</span>
            <h2 className="section-title">Powerful document tools</h2>
            <p className="section-subtitle">
              Everything you need to create, enhance, and manage your documents.
            </p>
          </div>

          <div className="tools-grid">
            {tools.map((tool, index) => (
              <div
                key={index}
                className="tool-card animate-fade-in"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="tool-icon" aria-hidden="true">
                  {tool.icon}
                </div>
                <h3 className="tool-title">{tool.title}</h3>

                <p className="tool-description">{tool.description}</p>

                <Link
                  to="/dashboard/tools"
                  className="btn btn-secondary"
                  aria-label={`Try ${tool.title} now`}
                >
                  Try Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <h2 className="cta-title">
                Start building your portfolio in minutes
              </h2>
              <p className="cta-subtitle">
                Join thousands of freelancers who trust Verolabz to showcase
                their work.
              </p>
              <Link to="/auth/signup" className="btn btn-primary btn-lg">
                Get Started Free
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
            <div className="cta-decoration">
              <div className="cta-circle cta-circle-1" />
              <div className="cta-circle cta-circle-2" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
