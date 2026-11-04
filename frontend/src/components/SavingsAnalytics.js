import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { History, Trophy, TrendingUp, Loader2, Calendar, CheckCircle2, BarChart3 } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { getCurrentUserId } from '../activeUser';
import '../styles/flow.css';
import '../styles/shared.css';

export default function SavingsAnalytics() {
    const [completedPlans, setCompletedPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/formulations?user_id=${encodeURIComponent(getCurrentUserId())}`);
                if (response.data.status === 'success') {
                    // Filter ONLY historical/completed plans
                    const completed = (response.data.plans || []).filter(p => p.diff_category === 'Historical');
                    setCompletedPlans(completed);
                }
            } catch (err) {
                console.error("Failed to load plans", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh', flexDirection: 'column', gap: '16px' }}>
                <Loader2 size={40} color="#10b981" className="spin" />
                <p className="text-muted font-600 uppercase tracking-widest text-xs">Loading Historic Data...</p>
            </div>
        );
    }

    // Calculate metrics from completed plans only
    const totalSavingsRealized = completedPlans.reduce((acc, p) => acc + (p.savings || 0), 0);
    const avgSavingsPerPlan = completedPlans.length > 0 ? totalSavingsRealized / completedPlans.length : 0;
    const cropsCovered = new Set(completedPlans.map(p => p.context?.crop).filter(Boolean)).size;

    // Group by crop type
    const cropMap = {};
    completedPlans.forEach(p => {
        const crop = p.context?.crop || 'Unknown';
        if (!cropMap[crop]) cropMap[crop] = { count: 0, savings: 0 };
        cropMap[crop].count += 1;
        cropMap[crop].savings += p.savings || 0;
    });

    // Monthly trend of completed savings
    const monthlyMap = {};
    completedPlans.forEach(p => {
        const dateObj = new Date(p.updated_at?.$date || p.updated_at || p.created_at?.$date || p.created_at || Date.now());
        const monthKey = dateObj.toLocaleString('en-US', { month: 'short', year: '2-digit' });
        const sortKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyMap[sortKey]) monthlyMap[sortKey] = { name: monthKey, savings: 0, transitions: 0, sortKey };
        monthlyMap[sortKey].savings += p.savings || 0;
        monthlyMap[sortKey].transitions += 1;
    });

    const monthlyTrendData = Object.values(monthlyMap)
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
        .map(({ name, savings, transitions }) => ({ name, savings, transitions }));

    // Crop breakdown for charts
    const cropBreakdownData = Object.entries(cropMap)
        .map(([crop, data]) => ({ name: crop, savings: data.savings, plans: data.count }))
        .sort((a, b) => b.savings - a.savings);

    return (
        <div className="flow-page animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            {/* Header */}
            <header style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div className="icon-box" style={{ background: '#d1fae5' }}>
                        <Trophy size={22} color="#10b981" />
                    </div>
                    <h1 style={{ margin: 0, fontSize: '2.4rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>
                        Historic <span style={{ color: '#10b981' }}>Savings</span>
                    </h1>
                </div>
                <p className="text-muted" style={{ margin: '0', fontSize: '1.1rem', maxWidth: '700px' }}>
                    Actual savings achieved from completed organic transition cycles. This reflects past results only.
                </p>
            </header>

            {/* KPI Cards */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '48px' }}>
                
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', border: '1px solid #10b98130', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div className="stat-num" style={{ color: '#10b981' }}>₹{(totalSavingsRealized/1000).toFixed(1)}k</div>
                    <div className="stat-label">Total Realized</div>
                </div>

                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', border: '1px solid #3b82f630', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div className="stat-num" style={{ color: '#3b82f6' }}>₹{(avgSavingsPerPlan/1000).toFixed(1)}k</div>
                    <div className="stat-label">Avg Per Plan</div>
                </div>

                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #ffffff 100%)', border: '1px solid #f59e0b30', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div className="stat-num" style={{ color: '#d97706' }}>{completedPlans.length}</div>
                    <div className="stat-label">Plans Completed</div>
                </div>

                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #ffffff 100%)', border: '1px solid #6366f130', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div className="stat-num" style={{ color: '#4f46e5' }}>{cropsCovered}</div>
                    <div className="stat-label">Crops Covered</div>
                </div>
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginBottom: '48px' }}>
                
                {/* Monthly Trend */}
                <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 24px 0', color: '#1e293b', fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={20} color="#10b981" />
                        Monthly Realization
                    </h3>
                    {monthlyTrendData.length === 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#cbd5e1' }}>
                            <p>No completed cycles yet.</p>
                        </div>
                    ) : (
                        <div style={{ flex: 1, minHeight: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `₹${val/1000}k`} />
                                    <Tooltip 
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', background: '#ffffff' }}
                                        formatter={(val) => `₹${(val/1000).toFixed(1)}k`}
                                    />
                                    <Bar dataKey="savings" fill="#10b981" radius={[8, 8, 0, 0]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Crop Breakdown */}
                <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 24px 0', color: '#1e293b', fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BarChart3 size={20} color="#3b82f6" />
                        By Crop Type
                    </h3>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {cropBreakdownData.length === 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '250px', color: '#cbd5e1' }}>
                                <p>No data available.</p>
                            </div>
                        ) : (
                            cropBreakdownData.map((crop, idx) => (
                                <div key={idx} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: idx < cropBreakdownData.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <span style={{ fontWeight: '700', color: '#1e293b' }}>{crop.name}</span>
                                        <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>{crop.plans} plan{crop.plans !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#10b981' }}>
                                        ₹{(crop.savings / 1000).toFixed(1)}k
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Completed Transactions Log */}
            <div className="card">
                <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <History size={20} color="#10b981" />
                    <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem', fontWeight: '800' }}>Completed Plans</h3>
                </div>
                <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
                    {completedPlans.length === 0 ? (
                        <div style={{ padding: '64px 24px', textAlign: 'center', color: '#94a3b8' }}>
                            <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                            <p style={{ fontSize: '1rem', fontWeight: '600' }}>No completed plans yet.</p>
                            <p style={{ fontSize: '0.9rem', margin: '8px 0 0 0' }}>Finish a plan to start tracking your savings here.</p>
                        </div>
                    ) : (
                        completedPlans
                            .sort((a, b) => new Date(b.updated_at?.$date || b.updated_at || b.created_at?.$date || b.created_at) - new Date(a.updated_at?.$date || a.updated_at || a.created_at?.$date || a.created_at))
                            .map((plan, i) => {
                                const dateObj = new Date(plan.updated_at?.$date || plan.updated_at || plan.created_at?.$date || plan.created_at || Date.now());
                                const savings = plan.savings || 0;
                                
                                return (
                                    <div key={i} style={{ padding: '20px 24px', borderBottom: i < completedPlans.length - 1 ? '1px solid #f8fafc' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <CheckCircle2 size={16} color="#10b981" />
                                                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10b981', textTransform: 'uppercase' }}>
                                                    Completed: {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <h4 style={{ margin: '6px 0 4px 0', color: '#0f172a', fontWeight: '800', fontSize: '1.05rem' }}>
                                                {plan.context?.alternative} on {plan.context?.crop}
                                            </h4>
                                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                                                {plan.context?.acres} Acres · Plot: {plan.context?.plot}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right', minWidth: '140px' }}>
                                            <div style={{ color: '#10b981', fontWeight: '900', fontSize: '1.35rem' }}>
                                                ₹{savings.toLocaleString()}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '700', marginTop: '4px' }}>
                                                Savings Realized
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                    )}
                </div>
            </div>

        </div>
    );
}
