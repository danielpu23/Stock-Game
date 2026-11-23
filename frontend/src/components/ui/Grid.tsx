interface GridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: string;
  style?: React.CSSProperties;
}

export default function Grid({ children, columns = 2, gap = "1.5rem", style }: GridProps) {
  const getGapClass = (gap: string) => {
    const gapMap: Record<string, string> = {
      "0.25rem": "gap-1",
      "0.5rem": "gap-2",
      "0.75rem": "gap-3",
      "1rem": "gap-4",
      "1.5rem": "gap-6",
      "2rem": "gap-8",
    };
    return gapMap[gap] || "";
  };

  const getColsClass = (cols: number) => {
    return `grid-cols-${cols}`;
  };

  return (
    <div
      className={`grid ${getColsClass(columns)} ${getGapClass(gap)}`}
      style={style}
    >
      {children}
    </div>
  );
}