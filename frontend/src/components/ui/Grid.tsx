interface GridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: string;
  style?: React.CSSProperties;
}

export default function Grid({ children, columns = 2, gap = "1.5rem", style }: GridProps) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap,
      ...style
    }}>
      {children}
    </div>
  );
}