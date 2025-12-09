import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <div className="logo-icon">
              <img
                src="/vero_logo.jpg"
                alt="Verolabz Logo"
                width="32"
                height="32"
                style={{ borderRadius: "8px", border: "2px solid #2563EB" }}
              />
            </div>
            <span>Verolabz</span>
          </Link>
          <p className="footer-tagline">
            Build your freelance identity in one workspace.
          </p>
        </div>

        <div className="footer-links">
          <Link to="/about" className="footer-link">
            About
          </Link>
          <Link to="/contact" className="footer-link">
            Contact
          </Link>
          <Link to="/community" className="footer-link">
            Community
          </Link>
          <Link to="/privacy" className="footer-link">
            Privacy
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Github
          </a>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} Verolabz. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
