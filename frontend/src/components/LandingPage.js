import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Trigger entry animation
        setTimeout(() => setMounted(true), 50);
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 5vw',
            fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
            overflow: 'hidden'
        }}>
            {/* Background blobs */}
            <div style={{ position: 'absolute', top: '-120px', right: '-120px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '380px', height: '380px', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

            <div style={{
                maxWidth: '1100px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '40px',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(24px)',
                transition: 'opacity 0.7s ease, transform 0.7s ease'
            }}>

                {/* Left: Text content */}
                <div style={{ flex: 1, maxWidth: '560px' }}>
                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: '#ecfdf5', border: '1px solid #a7f3d0',
                        color: '#065f46', padding: '6px 16px', borderRadius: '20px',
                        fontSize: '0.82rem', fontWeight: '600', marginBottom: '28px',
                        letterSpacing: '0.3px'
                    }}>
                        🌱 AI-Powered Organic Farming
                    </div>

                    <h1 style={{ margin: 0, lineHeight: 1.1 }}>
                        <span style={{ display: 'block', fontSize: 'clamp(2.8rem, 5vw, 4.2rem)', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px' }}>
                            Organic
                        </span>
                        <span style={{ display: 'block', fontSize: 'clamp(2.8rem, 5vw, 4.2rem)', fontWeight: '900', color: '#10b981', letterSpacing: '-1px' }}>
                            Recommender
                        </span>
                    </h1>

                    <p style={{
                        marginTop: '20px',
                        fontSize: '1.15rem',
                        color: '#475569',
                        lineHeight: '1.75',
                        maxWidth: '440px'
                    }}>
                        We recommend organic alternatives over chemicals to preserve soil health and your future.
                    </p>

                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: '28px', marginTop: '32px', marginBottom: '42px' }}>
                        {[
                            { num: '40+', label: 'Chemicals covered' },
                            { num: '7', label: 'Crops supported' },
                            { num: 'AI', label: 'Powered plans' },
                        ].map(stat => (
                            <div key={stat.label}>
                                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#10b981' }}>{stat.num}</div>
                                <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    <button
                        className="hero-cta"
                        onClick={() => navigate('/dashboard')}
                    >
                        LET'S GO
                        <span style={{ fontSize: '1.1rem' }}>→</span>
                    </button>
                </div>

                {/* Right: Image */}
                <div style={{ flex: '0 0 auto', position: 'relative' }}>
                    {/* Decorative ring */}
                    <div style={{
                        width: '380px',
                        height: '380px',
                        borderRadius: '50%',
                        border: '3px solid #d1fae5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                    }}>
                        <div style={{
                            width: '340px',
                            height: '340px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            boxShadow: '0 20px 60px rgba(16,185,129, 0.18)'
                        }}>
                            <img
                                src="/main.jpg"
                                alt="Organic farming — hands holding soil with a seedling"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={e => { e.target.style.background = 'linear-gradient(135deg, #d1fae5, #a7f3d0)'; e.target.removeAttribute('src'); }}
                            />
                        </div>

                        {/* Floating label top-right */}
                        <div style={{
                            position: 'absolute', top: '28px', right: '-12px',
                            background: '#fff', border: '1px solid #e2e8f0',
                            borderRadius: '12px', padding: '10px 16px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.07)',
                            fontSize: '0.85rem', fontWeight: '600', color: '#0f172a',
                            display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                            🧪 Gemini AI
                        </div>

                        {/* Floating label bottom-left */}
                        <div style={{
                            position: 'absolute', bottom: '44px', left: '-20px',
                            background: '#fff', border: '1px solid #e2e8f0',
                            borderRadius: '12px', padding: '10px 16px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.07)',
                            fontSize: '0.85rem', fontWeight: '600', color: '#0f172a',
                            display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                            🌾 Indian Farming
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer strip */}
            <div style={{
                position: 'absolute', bottom: '24px', left: 0, right: 0,
                textAlign: 'center', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '500'
            }}>
                B.Tech Final Year Project — Organic Buddy · 2025–26
            </div>
        </div>
    );
}
