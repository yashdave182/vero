import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import './Templates.css';

const templates = [
    {
        id: 'resume',
        name: 'Resume Generator',
        description: 'Create a professional resume that stands out',
        icon: '📄',
        category: 'Career',
    },
    {
        id: 'proposal',
        name: 'Proposal Builder',
        description: 'Write compelling client proposals with AI',
        icon: '📝',
        category: 'Business',
    },
    {
        id: 'cover-letter',
        name: 'Cover Letter',
        description: 'Craft personalized cover letters quickly',
        icon: '✉️',
        category: 'Career',
    },
    {
        id: 'invoice',
        name: 'Invoice Template',
        description: 'Professional invoices for your clients',
        icon: '🧾',
        category: 'Business',
    },
    {
        id: 'contract',
        name: 'Contract Template',
        description: 'Freelance contracts and agreements',
        icon: '📋',
        category: 'Legal',
    },
    {
        id: 'portfolio-pdf',
        name: 'Portfolio PDF',
        description: 'Export your portfolio as a PDF',
        icon: '📁',
        category: 'Portfolio',
    },
];

export default function Templates() {
    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="templates-page">
                <div className="templates-header">
                    <div>
                        <h1 className="templates-title">Templates</h1>
                        <p className="templates-subtitle">Choose a template to get started</p>
                    </div>
                </div>

                <div className="templates-filters">
                    <button className="filter-btn active">All</button>
                    <button className="filter-btn">Career</button>
                    <button className="filter-btn">Business</button>
                    <button className="filter-btn">Legal</button>
                    <button className="filter-btn">Portfolio</button>
                </div>

                <div className="templates-grid">
                    {templates.map((template) => (
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
                                <Link to={`/dashboard/templates/${template.id}`} className="btn btn-primary template-btn">
                                    Generate
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
