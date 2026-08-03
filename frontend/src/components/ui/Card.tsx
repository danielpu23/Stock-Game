interface CardProps {
  title?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export default function Card({ title, children, style }: CardProps) {
  return (
    <div style={{
      backgroundColor: "white",
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      padding: "1.5rem",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      ...style
    }}>
      {title && (
        <h3 style={{
          margin: "0 0 1rem 0",
          fontSize: "1.25rem",
          fontWeight: "600",
          color: "#333",
          borderBottom: "2px solid #f0f0f0",
          paddingBottom: "0.5rem"
        }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}