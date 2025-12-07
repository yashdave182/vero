import './Button.css';

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    className = '',
    ...props
}) {
    const classes = [
        'button',
        `button-${variant}`,
        `button-${size}`,
        className
    ].filter(Boolean).join(' ');

    return (
        <button className={classes} {...props}>
            {icon && iconPosition === 'left' && <span className="button-icon">{icon}</span>}
            {children}
            {icon && iconPosition === 'right' && <span className="button-icon">{icon}</span>}
        </button>
    );
}
