import './Input.css';

export default function Input({
    label,
    icon,
    error,
    className = '',
    ...props
}) {
    return (
        <div className={`input-group ${className}`}>
            {label && <label className="input-label">{label}</label>}
            <div className="input-container">
                {icon && <span className="input-icon-wrapper">{icon}</span>}
                <input
                    className={`input-field ${icon ? 'input-with-icon' : ''} ${error ? 'input-error' : ''}`}
                    {...props}
                />
            </div>
            {error && <span className="input-error-message">{error}</span>}
        </div>
    );
}
