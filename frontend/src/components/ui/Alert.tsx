interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export default function Alert({ type, children, style }: AlertProps) {
  const className = `alert alert-${type}`;

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}