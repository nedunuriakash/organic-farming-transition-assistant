import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Tractor, MapPin, Sprout, Ruler, Activity, Clock, CheckCircle2, ChevronRight, Loader2, ArrowLeft, History, FlaskConical, Trash2, Calendar, AlertTriangle, Beaker, CalendarClock, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { getCurrentUserId } from '../activeUser';
import '../styles/flow.css';

export default function FarmDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [farm, setFarm] = useState(null);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFarmData = async () => {
            try {
                // Efficient: fetch single farm by ID directly
                const userId = getCurrentUserId();
                const farmRes = await axios.get(`${API_BASE_URL}/api/farms/${id}?user_id=${encodeURIComponent(userId)}`);
                const matchedFarm = farmRes.data.farm;

                if (!matchedFarm) {
                    setError('Farm not found.');
                    setLoading(false);
                    return;
                }
                setFarm(matchedFarm);

                // Fetch formulations and filter for this farm
                const plansRes = await axios.get(`${API_BASE_URL}/api/formulations?user_id=${encodeURIComponent(userId)}`);
                const allPlans = plansRes.data.plans || [];

                // Keep only plans bound to this exact farm ID
                const farmPlans = allPlans.filter(plan =>
                    plan.context && plan.context.farm_id === id
                );

                // Sort by newest first
                farmPlans.sort((a, b) => {
                    const dateA = getPlanDate(a.created_at).getTime();
                    const dateB = getPlanDate(b.created_at).getTime();
                    return dateB - dateA;
                });

                setPlans(farmPlans);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching farm details:', err);
                setError('Failed to load farm data. Please try again.');
                setLoading(false);
            }
        };

        if (id) fetchFarmData();
    }, [id]);

    const handlePlanClick = (plan) => {
        navigate('/plan-summary', {
            state: {
                from: '/farms',
                formulation_data: plan.formulation_data,
                custom_instructions: plan.custom_instructions,
                substitutions: plan.substitutions,
                analysis: plan.analysis,
                is_saved: true,
                saved_plan_id: plan._id.$oid || plan._id,
                plan_id: plan._id.$oid || plan._id,
                completed_task_ids: plan.completed_task_ids || [],
                context: plan.context
            }
        });
    };

    if (loading) {
        return (
            <div className="flow-page" style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ color: '#64748b' }}>Loading farm data...</p>
            </div>
        );
    }

    if (error || !farm) {
        return (
            <div className="flow-page" style={{ padding: '2rem' }}>
                <button onClick={() => navigate('/farms')} style={{ background: 'none', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '24px' }}>
                    <ArrowLeft size={18} /> Back to Portfolio
                </button>
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '24px', borderRadius: '16px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <AlertCircle size={24} /> {error}
                </div>
            </div>
        );
    }

    const activePlans = plans.filter(p => p.diff_category !== 'Historical');
    const historicalPlans = plans.filter(p => p.diff_category === 'Historical');

    return (
        <div className="flow-page animate-fade-in" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header / Navigation */}
            <button onClick={() => navigate('/farms')} style={{ background: 'none', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '24px', fontWeight: '500', padding: 0 }} className="hover-opacity">
                <ArrowLeft size={18} /> Back to Portfolio
            </button>

            {/* Farm Header Card */}
            <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: '0 0 8px 0', fontSize: '2.4rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '800' }}>
                        <MapPin size={32} color="#10b981" /> {farm.name}
                    </h1>
                    <div style={{ color: '#64748b', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }}></div> Plot: {farm.plot}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Sprout size={16} /> {farm.crop || 'Unknown Crop'}</span>
                        <span>{farm.acres} Acres</span>
                    </div>
                </div>
            </div>

            {/* Content Split */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

                {/* ACTIVE LOGIC */}
                <section>
                    <h2 style={{ fontSize: '1.4rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontWeight: '700' }}>
                        <FlaskConical size={24} color="#10b981" /> Active Plans
                    </h2>

                    {activePlans.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {activePlans.map(plan => (
                                <div key={plan._id.$oid}
                                    onClick={() => handlePlanClick(plan)}
                                    style={{ background: '#ecfdf5', border: '2px solid #34d399', borderRadius: '16px', padding: '24px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.15)', position: 'relative' }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(16, 185, 129, 0.25)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(16, 185, 129, 0.15)'; }}
                                >
                                    <div style={{ position: 'absolute', top: '-12px', right: '24px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '4px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                                        {plan.diff_category === 'Historical' ? 'COMPLETED' : (plan.status || 'PREPARING')}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '48px', height: '48px', background: '#d1fae5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Beaker size={24} color="#059669" />
                                            </div>
                                            <div>
                                                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.3rem', color: '#065f46', fontWeight: '700' }}>{plan.context.alternative}</h3>
                                                <p style={{ margin: 0, color: '#047857', fontSize: '0.95rem' }}>Replaces: <span style={{ fontWeight: '600' }}>{plan.context.chemical_replaced || plan.context.corrected_chemical || plan.context.chemical}</span></p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', color: '#047857' }}>
                                            <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: '600' }}>Deployed On</div>
                                            <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{getPlanDate(plan.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '32px', background: '#fff', borderRadius: '16px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#64748b' }}>
                            <p style={{ margin: 0, fontSize: '1.1rem' }}>No active regimens configured for this plot.</p>
                            <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem' }}>Deploy a formulation via the Lab to begin.</p>
                        </div>
                    )}
                </section>

                {/* HISTORICAL LOGIC */}
                <section>
                    <h2 style={{ fontSize: '1.4rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontWeight: '700' }}>
                        <CalendarClock size={24} color="#94a3b8" /> Past Plans
                    </h2>

                    {historicalPlans.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {historicalPlans.map(plan => (
                                <div key={plan._id.$oid}
                                    onClick={() => handlePlanClick(plan)}
                                    style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.background = '#f8fafc'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff'; }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <CalendarClock size={20} color="#64748b" />
                                            </div>
                                            <div>
                                                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#334155', fontWeight: '600' }}>{plan.context.alternative}</h3>
                                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Replaced {plan.context.chemical_replaced || plan.context.corrected_chemical || plan.context.chemical}</p>
                                            </div>
                                        </div>
                                        <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
                                            {getPlanDate(plan.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#94a3b8' }}>
                            <p style={{ margin: 0 }}>No historical data archived.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

function getPlanDate(value) {
    const rawValue = value?.$date || value;
    const date = rawValue ? new Date(rawValue) : new Date(0);
    return Number.isNaN(date.getTime()) ? new Date(0) : date;
}
