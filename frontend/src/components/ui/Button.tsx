interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info";
  style?: React.CSSProperties;
  as?: "button" | "a";
  href?: string;
}

export default function Button({ children, onClick, disabled, variant = "primary", style, as = "button", href }: ButtonProps) {
  const className = `btn btn-${variant}`;

  if (as === "a" && href) {
    return (
      <a href={href} className={className} style={style}>
        {children}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={style}
    >
      {children}
    </button>
  );
}