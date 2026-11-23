interface CardProps {
  title?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export default function Card({ title, children, style }: CardProps) {
  return (
    <div className="card" style={style}>
      {title && (
        <h3 className="card-title">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}