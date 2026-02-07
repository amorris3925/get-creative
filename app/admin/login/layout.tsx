// Login page has its own layout that doesn't require authentication
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    }}>
      {children}
    </div>
  );
}
