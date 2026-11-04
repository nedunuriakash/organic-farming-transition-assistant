import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Library, CheckCircle, Clock, ArrowRight, Loader2, Search, Filter, Activity, Sprout, BookOpen, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { getCurrentUserId } from '../activeUser';
import axios from 'axios';
import '../styles/flow.css';
import '../styles/shared.css';

export default function MyPlans() {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/formulations?user_id=${encodeURIComponent(getCurrentUserId())}`);
                if (response.data.status === 'success') {
                    setPlans(response.data.plans || []);
                }
            } catch (err) {
                setError('Failed to load your saved plans.');
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    const activePlans = plans.filter(p => p.diff_category === 'Active');
    const historicalPlans = plans.filter(p => p.diff_category === 'Historical');

    return (
        <div className="flow-page animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <header className="page-header" style={{ marginBottom: '48px', borderBottom: '1px solid #f1f5f9', paddingBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                    <div className="icon-box" style={{ background: '#ecfdf5', width: '48px', height: '48px' }}>
                        <Library size={28} color="#10b981" />
                    </div>
                    <h1 style={{ margin: 0, fontSize: '2.6rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.8px' }}>
                        Formulation <span style={{ color: '#10b981' }}>Library</span>
                    </h1>
                </div>
                <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '700px', lineHeight: '1.6' }}>
                    A comprehensive repository of your organic transitions. Manage active roadmaps or review successful historical archives.
                </p>
            </header>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px 40px', color: '#64748b' }}>
                    <Loader2 size={40} className="spin" style={{ margin: '0 auto 24px auto', color: '#10b981' }} />
                    <p className="font-600 uppercase tracking-widest text-xs">Querying Archives...</p>
                </div>
            ) : error ? (
                <div className="error-banner">{error}</div>
            ) : plans.length === 0 ? (
                <div className="empty-state" style={{ padding: '80px 40px' }}>
                    <BookOpen size={64} color="#cbd5e1" style={{ marginBottom: '24px' }} />
                    <h2>Your Library is Empty</h2>
                    <p>Start a Triage scan to generate and save your first organic plan.</p>
                    <button className="primary-btn mt-6" onClick={() => navigate('/triage')}>Launch New Scan</button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
                    
                    {/* ACTIVE ROADMAPS */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#3b82f6', boxShadow: '0 0 10px rgba(59, 130, 246, 0.4)' }}></div>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Active Roadmaps</h2>
                            </div>
                            <span className="pill pill-blue">{activePlans.length} Running</span>
                        </div>
                        
                        {activePlans.length === 0 ? (
                            <div style={{ padding: '32px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#94a3b8' }}>
                                No active roadmap currently in progress.
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '28px' }}>
                                {activePlans.map(plan => (
                                    <PlanDetailCard 
                                        key={plan._id?.$oid || plan._id} 
                                        plan={plan} 
                                        isActive={true} 
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* HISTORICAL ARCHIVES */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#10b981', boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)' }}></div>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Success Archives</h2>
                            </div>
                            <span className="pill pill-green">{historicalPlans.length} Completed</span>
                        </div>

                        {historicalPlans.length === 0 ? (
                            <div style={{ padding: '32px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#94a3b8' }}>
                                Complete all tasks in a plan to move it to archives.
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '28px' }}>
                                {historicalPlans.map(plan => (
                                    <PlanDetailCard 
                                        key={plan._id?.$oid || (typeof plan._id === 'string' ? plan._id : 'plan-' + Math.random())} 
                                        plan={plan} 
                                        isActive={false} 
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                </div>
            )}
        </div>
    );
}

function PlanDetailCard({ plan, isActive }) {
    const navigate = useNavigate();
    const date = new Date(plan.created_at?.$date || plan.created_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
    const replacedChemical = plan.context?.chemical_replaced || plan.context?.corrected_chemical || plan.context?.chemical || 'Unknown chemical';

    const openPlan = () => {
        navigate('/plan-summary', {
            state: {
                from: '/my-plans',
                formulation_data: plan.formulation_data,
                substitutions: plan.context?.substitutions || {},
                custom_instructions: plan.context?.custom_instructions || '',
                context: plan.context,
                is_saved: true,
                plan_id: plan._id?.$oid || plan._id,
                completed_task_ids: plan.completed_task_ids || []
            }
        });
    };

    const tasks = plan.formulation_data?.preparation_tasks || [];
    const totalInstances = tasks.reduce((sum, t) => sum + (t.days?.length || 1), 0);
    const completedCount = plan.completed_task_ids?.length || 0;
    const progress = totalInstances > 0 ? (completedCount / totalInstances) * 100 : 0;

    return (
        <div 
            className="card card-hover" 
            style={{ 
                padding: '28px', 
                border: isActive ? '2px solid #3b82f615' : '1px solid #e2e8f0',
                background: '#fff',
                position: 'relative',
                cursor: 'pointer'
            }}
            onClick={openPlan}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sprout size={18} color={isActive ? '#3b82f6' : '#10b981'} />
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{date}</span>
                </div>
                <div className={`pill ${isActive ? 'pill-blue' : 'pill-green'}`}>
                    {isActive ? (progress >= 100 ? 'Action Pending' : 'Active') : 'Archived'}
                </div>
            </div>

            <h3 style={{ fontSize: '1.4rem', color: '#0f172a', margin: '0 0 12px 0', fontWeight: '800', lineHeight: '1.2' }}>
                {plan.context?.alternative}
            </h3>

            <div style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '24px' }}>
                Transitioning <strong>{plan.context?.acres} Acres</strong> of {plan.context?.crop} from {replacedChemical}.
            </div>

            <div style={{ marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Completion</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: isActive || progress < 100 ? '#3b82f6' : '#10b981' }}>{Math.round(progress)}%</span>
                </div>
                <div className="progress-track" style={{ height: '6px', background: '#f1f5f9' }}>
                    <div 
                        className={`progress-fill ${progress >= 100 ? 'done' : ''}`} 
                        style={{ 
                            width: `${Math.min(100, progress)}%`, 
                            background: progress >= 100 ? '#10b981' : '#3b82f6',
                            height: '100%',
                            transition: 'width 0.4s ease'
                        }} 
                    />
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f8fafc' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: progress >= 100 ? '#10b981' : '#3b82f6' }}>
                    {progress >= 100 ? 'Review Archive' : 'Resume Journey'}
                </span>
                <ArrowRight size={18} color={progress >= 100 ? '#10b981' : '#3b82f6'} />
            </div>
        </div>
    );
}
