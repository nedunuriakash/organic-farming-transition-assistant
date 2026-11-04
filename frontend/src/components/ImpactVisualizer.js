import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ShieldAlert, Loader2, Beaker, Globe, Zap, Clock, ShieldCheck, Skull, Microscope, HeartPulse, Leaf, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../config';

const S = {
    page:      { maxWidth: '960px', margin: '0 auto', padding: '32px 20px', fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" },
    header:    { marginBottom: '32px' },
    h1:        { fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' },
    subtitle:  { fontSize: '0.95rem', color: '#64748b', margin: '6px 0 0', fontWeight: 500 },
    card:      { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
    cardPad:   { padding: '24px' },
    label:     { display: 'block', fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' },
    select:    { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', background: '#f8fafc', cursor: 'pointer', outline: 'none', boxSizing: 'border-box' },
    sectionH:  { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
    sectionT:  { margin: 0, fontWeight: 800, fontSize: '1rem', color: '#0f172a' },
    tag:       (bg, color) => ({ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, background: bg, color }),
    metricBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
    metricLbl: { fontSize: '0.82rem', color: '#64748b', fontWeight: 600 },
    metricVal: { fontSize: '0.82rem', fontWeight: 800, color: '#1e293b' },
    pill:      { padding: '8px 16px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '8px' },
    pillText:  { fontSize: '0.82rem', fontWeight: 700, color: '#991b1b' },
    altCard:   { padding: '14px 16px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d022', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    altName:   { fontWeight: 700, fontSize: '0.9rem', color: '#065f46' },
    altSub:    { fontSize: '0.75rem', fontWeight: 600, color: '#10b981', marginTop: '2px' },
};

export default function ImpactVisualizer() {
    const [impactData, setImpactData] = useState(null);
    const [chemicals, setChemicals] = useState([]);
    const [selectedChemical, setSelectedChemical] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/impact`);
                if (res.data.status === 'success') {
                    const data = res.data.data;
                    setImpactData(data);
                    const list = Object.keys(data).sort();
                    setChemicals(list);
                    if (list.length > 0) setSelectedChemical(list[0]);
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
            <Loader2 size={40} color="#ef4444" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#94a3b8', fontWeight: 600 }}>Loading toxicity profiles…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );

    if (!impactData || chemicals.length === 0) return (
        <div style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center' }}>
            <ShieldAlert size={40} color="#ef4444" style={{ marginBottom: '12px' }} />
            <h2 style={{ color: '#0f172a', fontWeight: 800 }}>Toxicity Data Unavailable</h2>
            <p style={{ color: '#64748b' }}>Could not load the chemical impact database.</p>
        </div>
    );

    const current = impactData[selectedChemical];
    const metrics  = current.chemical_metrics || {};
    const profile  = current.scientific_profile || {};
    const diseases = current.famous_diseases || [];
    const alts     = current.safe_alternatives || [];

    const radarData = Object.keys(metrics).map(k => ({ subject: k, value: metrics[k] }));
    const maxScore = Math.max(...Object.values(metrics));

    const hazard = maxScore >= 90
        ? { label: 'EXTREME DANGER', color: '#dc2626', bg: '#fef2f2' }
        : maxScore >= 75
        ? { label: 'CRITICAL RISK', color: '#ea580c', bg: '#fff7ed' }
        : maxScore >= 50
        ? { label: 'HIGH CONCERN', color: '#d97706', bg: '#fffbeb' }
        : { label: 'MODERATE', color: '#64748b', bg: '#f8fafc' };

    const translateTech = (t) => {
        if (!t) return '';
        const l = t.toLowerCase();
        if (l.includes('trichogramma')) return 'Parasitic wasp';
        if (l.includes('beauveria'))    return 'Bio-fungus';
        if (l.includes('jeevamrutham')) return 'Fermented culture';
        if (l.includes('neem oil'))     return 'Neem extract';
        return '';
    };

    return (
        <div style={S.page}>
            {/* Header */}
            <header style={{ ...S.header, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg,#ef4444,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(239,68,68,0.25)' }}>
                            <ShieldAlert size={20} color="#fff" />
                        </div>
                        <h1 style={S.h1}>Impact Visualizer</h1>
                    </div>
                    <p style={S.subtitle}>See how dangerous your current pesticide or fertilizer really is — in plain language.</p>
                </div>
                <div style={S.tag(hazard.bg, hazard.color)}>
                    <AlertTriangle size={14} />
                    {hazard.label}
                </div>
            </header>

            <div style={{ ...S.card, ...S.cardPad, marginBottom: '20px' }}>
                <label style={S.label}>Which chemical do you use?</label>
                <select style={{ ...S.select, fontSize: '1rem', fontWeight: 700, padding: '12px' }} value={selectedChemical} onChange={e => setSelectedChemical(e.target.value)}>
                    {chemicals.map(c => <option key={c}>{c}</option>)}
                </select>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>Select the pesticide or fertilizer you spray on your field to see its health impact</p>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

                {/* Radar Chart */}
                <div style={{ ...S.card, padding: '20px', background: '#0f172a', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.08, background: 'radial-gradient(circle at 50% 50%, #ef4444, transparent 70%)', pointerEvents: 'none' }} />
                    <div style={{ height: '340px', position: 'relative', zIndex: 1 }}>
                        <ResponsiveContainer>
                            <RadarChart key={selectedChemical} cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Toxicity" dataKey="value" stroke="#ef4444" strokeWidth={2.5} fill="#ef4444" fillOpacity={0.35} dot={{ r: 4, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }} />
                                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', fontSize: '0.85rem', fontWeight: 700 }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <style>{`
                        @keyframes glow { 0%,100% { filter: drop-shadow(0 0 4px rgba(239,68,68,0.3)); } 50% { filter: drop-shadow(0 0 20px rgba(239,68,68,0.6)); } }
                        .recharts-radar-polygon { animation: glow 3s infinite ease-in-out; }
                    `}</style>
                </div>

                {/* Right Column: Health + Science */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Health Hazards */}
                    <div style={{ ...S.card, ...S.cardPad }}>
                        <div style={S.sectionH}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <HeartPulse size={18} color="#ef4444" />
                            </div>
                            <h3 style={S.sectionT}>Linked Health Risks</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {diseases.map(d => (
                                <div key={d} style={S.pill}>
                                    <Skull size={14} color="#dc2626" />
                                    <span style={S.pillText}>{d}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Scientific Profile */}
                    <div style={{ ...S.card, ...S.cardPad, background: '#f8fafc' }}>
                        <div style={S.sectionH}>
                            <Microscope size={18} color="#64748b" />
                            <h3 style={{ ...S.sectionT, fontSize: '0.9rem' }}>Scientific Profile</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {[
                                { k: 'What is this chemical?', v: profile["Chemical Type"] },
                                { k: 'How long it stays in soil', v: profile["Soil Poison Time"] },
                                { k: 'How does it work?', v: profile["Attack Method"] },
                                { k: 'Is it safe worldwide?', v: profile["Global Status"] }
                            ].map(item => (
                                <div key={item.k} style={{ padding: '12px', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{item.k}</div>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.4 }}>{item.v}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Safe Alternatives */}
            <div style={{ ...S.card, ...S.cardPad, border: '1px solid #10b98133' }}>
                <div style={S.sectionH}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldCheck size={18} color="#10b981" />
                    </div>
                    <h3 style={S.sectionT}>Safe Organic Alternatives</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {alts.map(alt => (
                        <div key={alt} style={S.altCard}>
                            <div>
                                <div style={S.altName}>{alt}</div>
                                {translateTech(alt) && <div style={S.altSub}>{translateTech(alt)}</div>}
                            </div>
                            <Leaf size={18} color="#10b981" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
