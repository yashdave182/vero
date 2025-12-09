import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const { hash } = useLocation();
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <img
              src="/vero_logo.jpg"
              alt="Verolabz Logo"
              width="40"
              height="40"
              style={{ borderRadius: "8px" }}
            />
          </div>
          <span className="logo-text">Verolabz</span>
        </Link>

        <div className="navbar-links">
          <Link
            to="/#features"
            className={`nav-link ${hash === "#features" ? "active" : ""}`}
          >
            Features
          </Link>
          <Link
            to="/#how-it-works"
            className={`nav-link ${hash === "#how-it-works" ? "active" : ""}`}
          >
            How it Works
          </Link>
          <Link
            to="/#tools"
            className={`nav-link ${hash === "#tools" ? "active" : ""}`}
          >
            Tools
          </Link>
        </div>

        <div className="navbar-actions">
          <Link to="/auth/signin" className="btn btn-ghost">
            Sign In
          </Link>
          <Link to="/auth/signup" className="btn btn-primary">
            Get Started
          </Link>
        </div>

        <button className="navbar-mobile-toggle" aria-label="Menu">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
