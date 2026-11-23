interface CardProps {
  title?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export default function Card({ title, children, style, className }: CardProps) {
  return (
    <div className={`card ${className || ""}`} style={style}>
      {title && (
        <h3 className="card-title">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}