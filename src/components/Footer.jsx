import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <Link to="/" className="footer-logo">
                        <div className="logo-icon">
                            <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="28" height="28" rx="8" fill="url(#gradient-footer)" />
                                <path d="M8 14L12 18L20 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <defs>
                                    <linearGradient id="gradient-footer" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#2563EB" />
                                        <stop offset="1" stopColor="#0D9488" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <span>Verolabz</span>
                    </Link>
                    <p className="footer-tagline">Build your freelance identity in one workspace.</p>
                </div>

                <div className="footer-links">
                    <Link to="/about" className="footer-link">About</Link>
                    <Link to="/contact" className="footer-link">Contact</Link>
                    <Link to="/community" className="footer-link">Community</Link>
                    <Link to="/privacy" className="footer-link">Privacy</Link>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer-link">
                        Github
                    </a>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Verolabz. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
