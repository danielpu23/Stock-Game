interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info";
  style?: React.CSSProperties;
  as?: "button" | "a";
  href?: string;
}

const variants = {
  primary: { backgroundColor: "#007bff", color: "white" },
  secondary: { backgroundColor: "#6c757d", color: "white" },
  success: { backgroundColor: "#28a745", color: "white" },
  danger: { backgroundColor: "#dc3545", color: "white" },
  warning: { backgroundColor: "#ffc107", color: "#333" },
  info: { backgroundColor: "#17a2b8", color: "white" }
};

const baseStyle = {
  padding: "0.75rem 1.5rem",
  border: "none",
  borderRadius: "6px",
  fontWeight: "500",
  fontSize: "0.95rem",
  transition: "all 0.2s ease",
  textDecoration: "none",
  display: "inline-block",
  textAlign: "center" as const
};

export default function Button({ children, onClick, disabled, variant = "primary", style, as = "button", href }: ButtonProps) {
  const combinedStyle = {
    ...baseStyle,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    pointerEvents: disabled ? "none" : "auto",
    ...variants[variant],
    ...style
  };

  if (as === "a" && href) {
    return (
      <a href={href} style={combinedStyle}>
        {children}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={combinedStyle}
    >
      {children}
    </button>
  );
}