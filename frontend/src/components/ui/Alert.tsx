interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const types = {
  success: { backgroundColor: "#d4edda", color: "#155724", borderColor: "#c3e6cb" },
  error: { backgroundColor: "#f8d7da", color: "#721c24", borderColor: "#f5c6cb" },
  warning: { backgroundColor: "#fff3cd", color: "#856404", borderColor: "#ffeaa7" },
  info: { backgroundColor: "#d1ecf1", color: "#0c5460", borderColor: "#bee5eb" }
};

export default function Alert({ type, children, style }: AlertProps) {
  return (
    <div style={{
      padding: "1rem 1.25rem",
      borderRadius: "6px",
      border: "1px solid",
      marginBottom: "1rem",
      ...types[type],
      ...style
    }}>
      {children}
    </div>
  );
}