import './Card.css';

export default function Card({
    children,
    title,
    description,
    icon,
    hoverable = true,
    className = '',
    onClick,
    ...props
}) {
    const classes = [
        'card-component',
        hoverable ? 'card-hoverable' : '',
        onClick ? 'card-clickable' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} onClick={onClick} {...props}>
            {icon && <div className="card-icon">{icon}</div>}
            {title && <h3 className="card-title">{title}</h3>}
            {description && <p className="card-description">{description}</p>}
            {children}
        </div>
    );
}
