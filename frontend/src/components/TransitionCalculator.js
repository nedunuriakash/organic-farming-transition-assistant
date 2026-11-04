import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Plus, Trash2, Leaf, Loader2, Calculator, Settings2, ChevronDown, ChevronUp, TrendingDown, IndianRupee, Sprout, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../config';

const fmt = (n) => `₹${new Intl.NumberFormat('en-IN').format(Math.round(n || 0))}`;

/* ─────────── inline styles (scoped, no CSS bleed) ─────────── */
const S = {
    page:     { maxWidth: '960px', margin: '0 auto', padding: '32px 20px', fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" },
    header:   { marginBottom: '36px' },
    h1:       { fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' },
    subtitle: { fontSize: '0.95rem', color: '#64748b', margin: '6px 0 0', fontWeight: 500 },

    /* pills */
    pillBar:  { display: 'inline-flex', gap: '4px', background: '#f1f5f9', borderRadius: '10px', padding: '3px' },
    pill:     (on) => ({ padding: '6px 16px', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', background: on ? '#0f172a' : 'transparent', color: on ? '#fff' : '#64748b', transition: 'all .15s' }),

    /* zone card */
    zone:     { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
    zoneHead: { padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' },
    zoneBody: { padding: '20px 24px' },

    /* select rows inside zone */
    selRow:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
    selFull:  { display: 'grid', gridTemplateColumns: '1fr', marginBottom: '16px' },
    label:    { display: 'block', fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' },
    select:   { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', background: '#f8fafc', appearance: 'auto', cursor: 'pointer', outline: 'none', boxSizing: 'border-box' },
    numInput: { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', background: '#f8fafc', outline: 'none', boxSizing: 'border-box' },

    /* cost strip */
    strip:    { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' },
    stripBox: (accent) => ({ textAlign: 'center', padding: '12px', borderRadius: '12px', background: '#fff', border: `1px solid ${accent}22` }),
    stripLbl: { fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
    stripVal: (c) => ({ fontSize: '1.15rem', fontWeight: 900, color: c, margin: 0 }),

    /* override drawer */
    drawer:   { padding: '20px 24px', background: '#fafbfc', borderTop: '1px solid #f1f5f9' },
    ovGrid:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    ovTitle:  (c) => ({ fontSize: '0.7rem', fontWeight: 900, color: c, textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 12px' }),
    ovRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
    ovLbl:    { fontSize: '0.8rem', color: '#64748b', fontWeight: 600 },
    ovInp:    { width: '90px', padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, textAlign: 'right', outline: 'none', boxSizing: 'border-box' },

    /* summary */
    summary:  { background: 'linear-gradient(145deg, #0f172a, #1e293b)', borderRadius: '20px', padding: '28px', color: '#fff', marginTop: '8px' },
    sumLabel: { fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' },
    sumBig:   { fontSize: '2.6rem', fontWeight: 900, color: '#10b981', margin: '4px 0 0' },
    sumSub:   { fontSize: '0.85rem', color: '#94a3b8', marginTop: '8px' },

    /* chart */
    chartBox: { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', marginTop: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
    chartH:   { fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 20px' },

    /* buttons */
    addBtn:   { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 22px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', color: '#0f172a', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' },
    iconBtn:  (bg) => ({ width: '34px', height: '34px', borderRadius: '10px', border: '1px solid #e2e8f0', background: bg || '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }),

    /* tip */
    tip:      { padding: '16px 20px', borderRadius: '12px', background: '#ecfdf5', border: '1px solid #d1fae522', marginTop: '16px' },
    tipText:  { margin: 0, fontSize: '0.82rem', color: '#065f46', lineHeight: 1.6 },
};

export default function TransitionCalculator() {
    const [meta, setMeta]       = useState(null);
    const [maps, setMaps]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [years, setYears]     = useState(5);
    const [rows, setRows]       = useState([]);

    /* fetch on mount */
    useEffect(() => {
        (async () => {
            try {
                const [mR, rR] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/mappings`),
                    axios.get(`${API_BASE_URL}/api/roi_meta`)
                ]);
                const m = mR.data.status === 'success' ? mR.data.data : null;
                const r = rR.data.status === 'success' ? rR.data.data.reference_rates : null;
                setMaps(m);
                setMeta(r);
                if (m && r) setRows([buildRow(m, r, m.crops[0])]);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    /* build a default row from a crop */
    function buildRow(m, r, crop) {
        const prob = (m.problems_by_crop[crop] || [])[0] || '';
        const chem = (m.chemicals_by_problem[prob] || [])[0] || '';
        const altKey = `${prob}_${chem}`;
        const alt  = m.alternative_by_chemical[altKey] || 'Jeevamrutham';
        return {
            id: Date.now() + Math.random(),
            crop, prob, chem, alt,
            acres: 5,
            price: r.chemical_prices[chem]?.price || 500,
            qty: 1, apps: 2,
            orgPrice: r.organic_costs[alt]?.price || 80,
            orgQty: 2, orgApps: 1,
            open: false
        };
    }

    /* cascade updates */
    function upd(id, field, val) {
        setRows(prev => prev.map(row => {
            if (row.id !== id) return row;
            const r = { ...row, [field]: val };

            if (field === 'crop') {
                r.prob = (maps.problems_by_crop[val] || [])[0] || '';
                r.chem = (maps.chemicals_by_problem[r.prob] || [])[0] || '';
                r.price = meta.chemical_prices[r.chem]?.price || r.price;
                const ak = `${r.prob}_${r.chem}`;
                r.alt = maps.alternative_by_chemical[ak] || 'Jeevamrutham';
                r.orgPrice = meta.organic_costs[r.alt]?.price || 80;
            }
            if (field === 'prob') {
                r.chem = (maps.chemicals_by_problem[val] || [])[0] || '';
                r.price = meta.chemical_prices[r.chem]?.price || r.price;
                const ak = `${val}_${r.chem}`;
                r.alt = maps.alternative_by_chemical[ak] || 'Jeevamrutham';
                r.orgPrice = meta.organic_costs[r.alt]?.price || 80;
            }
            if (field === 'chem') {
                r.price = meta.chemical_prices[val]?.price || r.price;
                const ak = `${r.prob}_${val}`;
                r.alt = maps.alternative_by_chemical[ak] || 'Jeevamrutham';
                r.orgPrice = meta.organic_costs[r.alt]?.price || 80;
            }
            return r;
        }));
    }

    /* totals */
    const totals = useMemo(() => {
        let aChem = 0, aOrg = 0;
        rows.forEach(r => {
            aChem += r.price * r.qty * r.acres * r.apps;
            aOrg  += r.orgPrice * r.orgQty * r.acres * r.orgApps;
        });
        const hist = [];
        let cC = 0, cO = 0;
        for (let y = 0; y <= years; y++) {
            if (y > 0) { cC += aChem * Math.pow(1.05, y-1); cO += aOrg * Math.pow(1.02, y-1); }
            hist.push({ year: `Yr ${y}`, chemical: Math.round(cC), organic: Math.round(cO), savings: Math.round(cC - cO) });
        }
        return { aChem, aOrg, hist };
    }, [rows, years]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
            <Loader2 size={40} color="#10b981" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#94a3b8', fontWeight: 600 }}>Loading market intelligence…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );

    return (
        <div style={S.page}>
            {/* ── header ── */}
            <header style={{ ...S.header, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}>
                            <Calculator size={20} color="#fff" />
                        </div>
                        <h1 style={S.h1}>ROI Calculator</h1>
                    </div>
                    <p style={S.subtitle}>Compare your current chemical spend against organic alternatives, crop by crop.</p>
                </div>
                <div style={S.pillBar}>
                    {[3,5,10].map(y => <button key={y} onClick={() => setYears(y)} style={S.pill(years===y)}>{y} Yr</button>)}
                </div>
            </header>

            {/* ── zone cards ── */}
            {rows.map((row, i) => {
                const chemAnn = row.price * row.qty * row.acres * row.apps;
                const orgAnn  = row.orgPrice * row.orgQty * row.acres * row.orgApps;
                const saved   = chemAnn - orgAnn;

                return (
                    <div key={row.id} style={S.zone}>
                        {/* zone title bar */}
                        <div style={S.zoneHead}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900, color: '#10b981' }}>{i+1}</div>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>Crop Scenario {i+1}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button onClick={() => setRows(p => p.map(r => r.id===row.id ? {...r, open:!r.open} : r))} style={{ ...S.iconBtn(row.open ? '#f1f5f9' : '#fff'), width: 'auto', padding: '6px 14px', gap: '6px', display: 'flex', alignItems: 'center' }} title="Edit prices">
                                    <Settings2 size={14} color="#64748b" />
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>{row.open ? 'Close' : 'Edit Prices'}</span>
                                </button>
                                {rows.length > 1 && (
                                    <button onClick={() => setRows(p => p.filter(r => r.id !== row.id))} style={S.iconBtn('#fff')} title="Remove scenario">
                                        <Trash2 size={16} color="#ef4444" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* selection body */}
                        <div style={S.zoneBody}>
                            <div style={S.selRow}>
                                <div>
                                    <label style={S.label}>Crop</label>
                                    <select style={S.select} value={row.crop} onChange={e => upd(row.id, 'crop', e.target.value)}>
                                        {maps.crops.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={S.label}>Problem / Disease</label>
                                    <select style={S.select} value={row.prob} onChange={e => upd(row.id, 'prob', e.target.value)}>
                                        {(maps.problems_by_crop[row.crop]||[]).map(p => <option key={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={S.selRow}>
                                <div>
                                    <label style={S.label}>Chemical / Pesticide</label>
                                    <select style={S.select} value={row.chem} onChange={e => upd(row.id, 'chem', e.target.value)}>
                                        {(maps.chemicals_by_problem[row.prob]||[]).map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={S.label}>Acres</label>
                                    <input type="number" style={S.numInput} value={row.acres} min={0} onChange={e => upd(row.id, 'acres', Math.max(0, Number(e.target.value)))} />
                                </div>
                            </div>

                            {/* organic alternative badge */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d022' }}>
                                <Sprout size={16} color="#10b981" />
                                <span style={{ fontSize: '0.82rem', color: '#065f46', fontWeight: 600 }}>Organic Alternative: </span>
                                <span style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 800 }}>{row.alt}</span>
                            </div>
                        </div>

                        {/* cost strip */}
                        <div style={S.strip}>
                            <div style={S.stripBox('#ef4444')}>
                                <p style={S.stripLbl}>Chemical / Year</p>
                                <p style={S.stripVal('#ef4444')}>{fmt(chemAnn)}</p>
                            </div>
                            <div style={S.stripBox('#10b981')}>
                                <p style={S.stripLbl}>Organic / Year</p>
                                <p style={S.stripVal('#10b981')}>{fmt(orgAnn)}</p>
                            </div>
                            <div style={S.stripBox(saved >= 0 ? '#10b981' : '#ef4444')}>
                                <p style={S.stripLbl}>Savings / Year</p>
                                <p style={S.stripVal(saved >= 0 ? '#10b981' : '#ef4444')}>{fmt(saved)}</p>
                            </div>
                        </div>

                        {/* advanced drawer (hidden by default) */}
                        {row.open && (
                            <div style={S.drawer}>
                                <div style={S.ovGrid}>
                                    <div>
                                        <p style={S.ovTitle('#ef4444')}>Chemical Cost Override</p>
                                        <div style={S.ovRow}><span style={S.ovLbl}>Price per unit (₹)</span><input type="number" min={0} style={S.ovInp} value={row.price} onChange={e => upd(row.id, 'price', Math.max(0, Number(e.target.value)))} /></div>
                                        <div style={S.ovRow}><span style={S.ovLbl}>Qty per acre</span><input type="number" step="0.1" min={0} style={S.ovInp} value={row.qty} onChange={e => upd(row.id, 'qty', Math.max(0, Number(e.target.value)))} /></div>
                                        <div style={S.ovRow}><span style={S.ovLbl}>Applications / year</span><input type="number" min={0} style={S.ovInp} value={row.apps} onChange={e => upd(row.id, 'apps', Math.max(0, Number(e.target.value)))} /></div>
                                    </div>
                                    <div>
                                        <p style={S.ovTitle('#10b981')}>Organic Cost Override</p>
                                        <div style={S.ovRow}><span style={S.ovLbl}>Price per unit (₹)</span><input type="number" min={0} style={S.ovInp} value={row.orgPrice} onChange={e => upd(row.id, 'orgPrice', Math.max(0, Number(e.target.value)))} /></div>
                                        <div style={S.ovRow}><span style={S.ovLbl}>Dosage per acre</span><input type="number" step="0.1" min={0} style={S.ovInp} value={row.orgQty} onChange={e => upd(row.id, 'orgQty', Math.max(0, Number(e.target.value)))} /></div>
                                        <div style={S.ovRow}><span style={S.ovLbl}>Applications / year</span><input type="number" min={0} style={S.ovInp} value={row.orgApps} onChange={e => upd(row.id, 'orgApps', Math.max(0, Number(e.target.value)))} /></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* add zone */}
            <button onClick={() => setRows([...rows, buildRow(maps, meta, maps.crops[0])])} style={S.addBtn}>
                <Plus size={18} /> Add Crop Scenario
            </button>

            {/* ── summary card ── */}
            <div style={S.summary}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '20px' }}>
                    <div>
                        <p style={S.sumLabel}>Total Chemical / Year</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fca5a5', margin: '4px 0 0' }}>{fmt(totals.aChem)}</p>
                    </div>
                    <div>
                        <p style={S.sumLabel}>Total Organic / Year</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#6ee7b7', margin: '4px 0 0' }}>{fmt(totals.aOrg)}</p>
                    </div>
                    <div>
                        <p style={S.sumLabel}>{years}-Year Net Savings</p>
                        <p style={S.sumBig}>{fmt(totals.hist[totals.hist.length-1].savings)}</p>
                    </div>
                </div>
                <p style={S.sumSub}>Projection includes 5% annual chemical inflation and 2% organic cost growth.</p>
            </div>

            {/* ── chart ── */}
            <div style={S.chartBox}>
                <h3 style={S.chartH}>{years}-Year Investment Horizon</h3>
                <div style={{ height: '280px' }}>
                    <ResponsiveContainer>
                        <AreaChart data={totals.hist}>
                            <defs>
                                <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity={0.15}/><stop offset="100%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                                <linearGradient id="go" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.25}/><stop offset="100%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} width={55} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontWeight: 600 }} formatter={v => fmt(v)} />
                            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontWeight: 700, fontSize: '0.8rem' }} />
                            <Area name="Chemical Path" type="monotone" dataKey="chemical" stroke="#ef4444" fill="url(#gc)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                            <Area name="Organic Path" type="monotone" dataKey="organic" stroke="#10b981" fill="url(#go)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* tip */}
            <div style={S.tip}>
                <p style={S.tipText}><strong>💡 Tip:</strong> Click "Edit Prices" on any scenario to manually adjust unit prices and dosages to match your local dealer rates.</p>
            </div>
        </div>
    );
}
