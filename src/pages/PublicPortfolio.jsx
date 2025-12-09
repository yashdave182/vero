import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { incrementPortfolioViews } from "../lib/portfolioService";
import { generateAvatarUrl } from "../utils/avatarGenerator";
import "./PublicPortfolio.css";

export default function PublicPortfolio() {
  const { username } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Find user by username
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const userSnapshot = await getDocs(q);

        if (userSnapshot.empty) {
          setError("User not found");
          setLoading(false);
          return;
        }

        const userData = userSnapshot.docs[0].data();
        const userId = userSnapshot.docs[0].id;
        setUserProfile({ id: userId, ...userData });

        // Step 2: Load portfolio data
        const portfolioRef = doc(db, "portfolios", userId);
        const portfolioSnap = await getDoc(portfolioRef);

        if (!portfolioSnap.exists()) {
          setError("Portfolio not found");
          setLoading(false);
          return;
        }

        const portfolioData = portfolioSnap.data();

        // Check if published
        if (!portfolioData.isPublished) {
          setError("This portfolio is not published yet");
          setLoading(false);
          return;
        }

        setPortfolio(portfolioData);

        // Increment view count
        await incrementPortfolioViews(userId);

        setLoading(false);
      } catch (err) {
        console.error("Error loading portfolio:", err);
        setError("Failed to load portfolio");
        setLoading(false);
      }
    };

    if (username) {
      loadPortfolio();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="public-portfolio">
        <div className="portfolio-loading">
          <div className="loading-spinner"></div>
          <p>Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-portfolio">
        <div className="portfolio-error">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h2>{error}</h2>
          <p>
            The portfolio you're looking for doesn't exist or isn't available.
          </p>
          <a href="/" className="btn btn-primary">
            Go Home
          </a>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return null;
  }

  return (
    <div className="public-portfolio">
      {/* Header */}
      <header className="portfolio-header">
        <div className="header-background">
          <div className="header-gradient"></div>
        </div>
        <div className="header-content">
          <div className="avatar-wrapper">
            <div className="portfolio-avatar">
              <img
                src={generateAvatarUrl(userProfile?.id || username)}
                alt={portfolio.name}
                className="portfolio-avatar-img"
              />
            </div>
          </div>
          <h1 className="portfolio-name">{portfolio.name}</h1>
          <p className="portfolio-title">{portfolio.title}</p>
          {portfolio.location && (
            <p className="portfolio-location">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {portfolio.location}
            </p>
          )}
          <p className="portfolio-bio">{portfolio.bio}</p>

          <div className="portfolio-actions">
            {userProfile?.email && (
              <a
                href={`mailto:${userProfile.email}`}
                className="btn btn-primary"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Contact Me
              </a>
            )}
            {portfolio.resumeUrl && (
              <a
                href={portfolio.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Resume
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Skills Section */}
      {portfolio.skills && portfolio.skills.length > 0 && (
        <section className="portfolio-section">
          <div className="section-container">
            <h2 className="section-title">Skills</h2>
            <div className="skills-grid">
              {portfolio.skills.map((skill) => (
                <span key={skill} className="skill-pill">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects Section */}
      {portfolio.projects && portfolio.projects.length > 0 && (
        <section className="portfolio-section section-alt">
          <div className="section-container">
            <h2 className="section-title">Projects</h2>
            <div className="projects-grid">
              {portfolio.projects.map((project) => (
                <div key={project.id} className="project-card">
                  <div className="project-image">
                    {project.liveUrl ? (
                      <div className="project-iframe-wrapper">
                        <iframe
                          src={project.liveUrl}
                          className="project-iframe"
                          title={`${project.name} preview`}
                          sandbox="allow-scripts allow-same-origin"
                          loading="lazy"
                        />
                      </div>
                    ) : project.imageUrl ? (
                      <img src={project.imageUrl} alt={project.name} />
                    ) : (
                      <div className="project-image-placeholder">
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                          />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="project-content">
                    <h3 className="project-name">{project.name}</h3>
                    <p className="project-description">{project.description}</p>
                    {project.tech && project.tech.length > 0 && (
                      <div className="project-tech">
                        {project.tech.map((t) => (
                          <span key={t} className="tech-tag">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    {project.liveUrl && (
                      <div className="project-links">
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-link"
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
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      {(userProfile?.email || portfolio.socials) && (
        <section className="portfolio-section">
          <div className="section-container">
            <h2 className="section-title">Get in Touch</h2>
            <div className="contact-grid">
              {userProfile?.email && (
                <a
                  href={`mailto:${userProfile.email}`}
                  className="contact-card"
                >
                  <div className="contact-icon email">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <span className="contact-label">Email</span>
                  <span className="contact-value">{userProfile.email}</span>
                </a>
              )}
              {portfolio.socials?.linkedin && (
                <a
                  href={
                    portfolio.socials.linkedin.startsWith("http")
                      ? portfolio.socials.linkedin
                      : `https://${portfolio.socials.linkedin}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-card"
                >
                  <div className="contact-icon linkedin">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </div>
                  <span className="contact-label">LinkedIn</span>
                  <span className="contact-value">Connect</span>
                </a>
              )}
              {portfolio.socials?.github && (
                <a
                  href={
                    portfolio.socials.github.startsWith("http")
                      ? portfolio.socials.github
                      : `https://${portfolio.socials.github}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-card"
                >
                  <div className="contact-icon github">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </div>
                  <span className="contact-label">GitHub</span>
                  <span className="contact-value">View Profile</span>
                </a>
              )}
              {portfolio.socials?.twitter && (
                <a
                  href={
                    portfolio.socials.twitter.startsWith("http")
                      ? portfolio.socials.twitter
                      : `https://${portfolio.socials.twitter}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-card"
                >
                  <div className="contact-icon twitter">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </div>
                  <span className="contact-label">Twitter</span>
                  <span className="contact-value">Follow</span>
                </a>
              )}
              {portfolio.socials?.portfolio && (
                <a
                  href={
                    portfolio.socials.portfolio.startsWith("http")
                      ? portfolio.socials.portfolio
                      : `https://${portfolio.socials.portfolio}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-card"
                >
                  <div className="contact-icon portfolio">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </div>
                  <span className="contact-label">Website</span>
                  <span className="contact-value">Visit</span>
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="portfolio-footer">
        <p>
          Built with <span className="heart">♥</span> using Verolabz
        </p>
      </footer>
    </div>
  );
}
