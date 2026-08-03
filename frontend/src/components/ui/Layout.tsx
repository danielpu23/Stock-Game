interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function Layout({ children, title }: LayoutProps) {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f5f7fa",
      display: "flex",
      flexDirection: "column"
    }}>
      {children}
    </div>
  );
}