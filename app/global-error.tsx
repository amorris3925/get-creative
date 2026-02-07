'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          fontFamily: 'system-ui, sans-serif',
          background: '#FDFDFC',
        }}>
          <h2 style={{ fontSize: 24, marginBottom: 16 }}>Something went wrong!</h2>
          <button
            onClick={() => reset()}
            style={{
              padding: '12px 24px',
              background: '#ED7F35',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
