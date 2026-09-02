interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
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