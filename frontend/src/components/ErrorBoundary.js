import React from 'react';

/**
 * ErrorBoundary: catches any uncaught render errors in child components
 * and shows a friendly UI instead of a blank white screen.
 */
export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        // In production this would go to Sentry / LogRocket
        console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
    }

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', minHeight: '60vh', padding: '2rem',
                fontFamily: "'Inter', system-ui, sans-serif"
            }}>
                <div style={{
                    background: '#fef2f2', border: '1px solid #fca5a5',
                    borderRadius: '16px', padding: '40px 48px', maxWidth: '520px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚠️</div>
                    <h2 style={{ color: '#991b1b', margin: '0 0 12px', fontSize: '1.4rem', fontWeight: '700' }}>
                        Something went wrong
                    </h2>
                    <p style={{ color: '#b91c1c', marginBottom: '24px', lineHeight: '1.6', fontSize: '0.95rem' }}>
                        An unexpected error occurred in this section. You can try refreshing or navigating to a different page.
                    </p>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <pre style={{
                            background: '#fff', border: '1px solid #fca5a5', borderRadius: '8px',
                            padding: '12px', fontSize: '0.75rem', color: '#7f1d1d',
                            textAlign: 'left', overflow: 'auto', marginBottom: '20px',
                            maxHeight: '140px'
                        }}>
                            {this.state.error.message}
                        </pre>
                    )}
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            background: '#b91c1c', color: 'white', border: 'none',
                            padding: '12px 28px', borderRadius: '8px', fontWeight: '600',
                            cursor: 'pointer', fontSize: '0.95rem', marginRight: '12px'
                        }}
                    >
                        Refresh Page
                    </button>
                    <button
                        onClick={() => window.location.href = '/dashboard'}
                        style={{
                            background: 'white', color: '#64748b', border: '1px solid #e2e8f0',
                            padding: '12px 28px', borderRadius: '8px', fontWeight: '600',
                            cursor: 'pointer', fontSize: '0.95rem'
                        }}
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }
}
