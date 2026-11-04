import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, Droplets, ShieldCheck, ArrowLeft, Leaf, ChevronRight } from 'lucide-react';
import '../styles/flow.css';

export default function Options() {
    const navigate = useNavigate();
    const location = useLocation();

    // Get data passed from Triage screen
    const { options, context } = location.state || { options: [], context: {} };

    if (!options || options.length === 0) {
        return (
            <div className="flow-page animate-fade-in" style={{ maxWidth: '600px', margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
                <div style={{ background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '20px', padding: '48px 24px' }}>
                    <h2 style={{ color: '#334155', marginBottom: '12px' }}>No alternatives selected yet</h2>
                    <p style={{ color: '#64748b', marginBottom: '24px', lineHeight: '1.6' }}>
                        This page shows alternatives after you run a Triage scan.<br />Please start from the beginning.
                    </p>
                    <button className="primary-btn" onClick={() => navigate('/triage')}>Go to Triage →</button>
                </div>
            </div>
        );
    }

    const handleSelectOption = (selectedOption) => {
        // Pass the selected option and original context to the Formulation Lab
        navigate('/lab', { state: { selectedOption, context } });
    };

    return (
        <div className="flow-page animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
            <header className="page-header" style={{ display: 'flex', gap: '16px', marginBottom: '40px', textAlign: 'center', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
                    <button className="back-btn" onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ArrowLeft size={20} /> Back
                    </button>
                </div>

                <h1 style={{ fontSize: '2.5rem', marginBottom: '12px', color: '#1e293b' }}>
                    Choose Your <span style={{ color: '#10b981' }}>Organic Replacement</span>
                </h1>
                <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '600px' }}>
                    We found <strong>{options.length} viable alternatives</strong> to replace {options[0]?.corrected_chemical || context.chemical} for your {context.crop} crop. Select the method that best fits your schedule and resources.
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                {options.map((opt, index) => {
                    const prepTime = typeof opt.prep_time === 'string' ? opt.prep_time : '';
                    const prepDaysMatch = prepTime.match(/(\d+)/);
                    const firstDayNum = prepDaysMatch ? parseInt(prepDaysMatch[1], 10) : 99;
                    const normalizedPrepTime = prepTime.toLowerCase();
                    const isFast = firstDayNum < 5 || normalizedPrepTime.includes('hour') || normalizedPrepTime.includes('same day');
                    const rawConfidence = parseFloat(opt.confidence) || 0;
                    const confidencePercent = Math.min(rawConfidence * 100, 100).toFixed(0);

                    return (
                        <div
                            key={opt.id || index}
                            style={{
                                background: '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '20px',
                                padding: '32px 24px',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                cursor: 'default'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)';
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: '0',
                                left: '0',
                                right: '0',
                                height: '6px',
                                background: isFast ? 'linear-gradient(90deg, #3b82f6, #60a5fa)' : 'linear-gradient(90deg, #0f766e, #10b981)'
                            }}></div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div style={{
                                    background: isFast ? '#eff6ff' : '#f0fdf4',
                                    color: isFast ? '#2563eb' : '#0f766e',
                                    padding: '6px 14px',
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                    fontWeight: '700',
                                    letterSpacing: '0.5px',
                                    textTransform: 'uppercase'
                                }} className={isFast ? "pill-sky" : "pill-green"}>
                                    {isFast ? 'Fast Acting' : 'Long Yield'}
                                </div>
                                <Leaf size={24} color={isFast ? '#3b82f6' : '#0f766e'} opacity={0.5} />
                            </div>

                            <h2 style={{ fontSize: '1.8rem', color: '#0f172a', margin: '0 0 12px 0', lineHeight: '1.2' }}>{opt.alternative}</h2>
                            <p style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.6', marginBottom: '24px', flex: 1 }}>
                                Targets {opt.problem_target}. {opt.safety_note}
                            </p>

                            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <Clock size={18} color="#64748b" />
                                    <span style={{ color: '#334155', fontWeight: '500' }}>Prep:</span>
                                    <span style={{ color: '#0f172a', fontWeight: '700', marginLeft: 'auto' }}>{prepTime || 'Not specified'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <Droplets size={18} color="#64748b" />
                                    <span style={{ color: '#334155', fontWeight: '500' }}>Dosage:</span>
                                    <span style={{ color: '#0f172a', fontWeight: '700', marginLeft: 'auto' }}>{opt.dosage}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <ShieldCheck size={18} color="#64748b" />
                                    <span style={{ color: '#334155', fontWeight: '500' }}>AI Match:</span>
                                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '60px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ width: `${confidencePercent}%`, height: '100%', background: confidencePercent > 80 ? '#22c55e' : '#f59e0b' }}></div>
                                        </div>
                                        <span style={{ color: '#0f172a', fontWeight: '700', fontSize: '0.9rem' }}>{confidencePercent}%</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleSelectOption(opt)}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: '#0f172a',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '1.05rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'background 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#334155'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#0f172a'}
                            >
                                Customize Recipe <ChevronRight size={18} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
