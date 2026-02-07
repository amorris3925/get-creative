import { verifyAdmin } from '@/lib/admin/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await verifyAdmin();

  // Middleware handles redirect for unauthenticated users
  // This layout just conditionally shows the nav

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    }}>
      {isAdmin && (
        <nav style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          background: 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <a href="/admin" style={{
              fontSize: 16,
              fontWeight: 500,
              color: '#FFFFFF',
              textDecoration: 'none',
            }}>
              <span style={{ color: '#ED7F35' }}>IC</span> Admin
            </a>
            <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} />
            <a href="/admin/sections" style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.7)',
              textDecoration: 'none',
            }}>
              Sections
            </a>
            <a href="/admin/history" style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.7)',
              textDecoration: 'none',
            }}>
              History
            </a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <a href="/" target="_blank" style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.5)',
              textDecoration: 'none',
            }}>
              View Site →
            </a>
            <form action="/api/admin/logout" method="POST">
              <button type="submit" style={{
                padding: '8px 16px',
                fontSize: 12,
                fontWeight: 500,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 8,
                color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
              }}>
                Logout
              </button>
            </form>
          </div>
        </nav>
      )}
      <main style={{ paddingTop: isAdmin ? 64 : 0 }}>
        {children}
      </main>
    </div>
  );
}
