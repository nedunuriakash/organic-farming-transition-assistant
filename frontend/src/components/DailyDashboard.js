import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, CheckCircle2, Circle, Loader2, Sparkles, AlertCircle, ArrowRight, Leaf, Clock, PartyPopper, Trophy, ExternalLink } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { getCurrentUserId } from '../activeUser';
import '../styles/flow.css';
import '../styles/shared.css';

export default function DailyDashboard() {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [syncingTasks, setSyncingTasks] = useState({});

    const fetchPlans = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/formulations?user_id=${encodeURIComponent(getCurrentUserId())}`);
            if (response.data.status === 'success') {
                const allPlans = response.data.plans || [];
                
                // REFINED VISIBILITY LOGIC:
                const now = new Date();
                const visiblePlans = allPlans.filter(p => {
                    if (p.diff_category === 'Active') return true;
                    
                    // Keep recently finished on dashboard for today
                    const lastTouch = new Date(p.updated_at?.$date || p.updated_at || p.created_at?.$date || p.created_at);
                    const diffHours = (now - lastTouch) / (1000 * 60 * 60);
                    return diffHours < 24; 
                });
                
                setPlans(visiblePlans);
            }
        } catch (err) {
            setError('System sync failure.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const calculateCurrentDay = (plan) => {
        let dateStr = plan.start_date || plan.created_at;
        if (dateStr && dateStr.$date) dateStr = dateStr.$date;
        if (!dateStr) return 1;

        const startDate = new Date(dateStr);
        const today = new Date();
        startDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        
        const diffDays = Math.round((today - startDate) / (1000 * 60 * 60 * 24));
        return Math.max(1, diffDays + 1);
    };

    const toggleTask = async (planId, taskId, currentCompletedArray) => {
        const willBeCompleted = !currentCompletedArray.includes(taskId);
        const syncKey = `${planId}_${taskId}`;
        
        // Optimistic UI Update - NO FETCH here to prevent shaking
        setPlans(prev => prev.map(p => {
            const pId = p._id?.$oid || (typeof p._id === 'string' ? p._id : String(p._id));
            const targetId = typeof planId === 'string' ? planId : (planId?.$oid || String(planId));
            
            if (pId !== targetId) return p;
            const newCompleted = willBeCompleted
                ? [...(p.completed_task_ids || []), taskId]
                : (p.completed_task_ids || []).filter(id => id !== taskId);
            return { ...p, completed_task_ids: newCompleted };
        }));

        try {
            setSyncingTasks(prev => ({ ...prev, [syncKey]: true }));
            await axios.put(`${API_BASE_URL}/api/tasks/sync`, { plan_id: planId, task_id: taskId, is_completed: willBeCompleted });
        } catch (err) {
            console.error('Sync failed:', err);
            // Revert on error
            fetchPlans();
        } finally {
            setSyncingTasks(prev => ({ ...prev, [syncKey]: false }));
        }
    };

    const getPlanMetrics = (plan) => {
        const currentDay = calculateCurrentDay(plan);
        const allPrepTasks = plan.formulation_data?.preparation_tasks || [];
        
        // Find max day
        let maxDay = 1;
        let totalInstances = 0;
        allPrepTasks.forEach(t => {
            if (t.days) {
                maxDay = Math.max(maxDay, ...t.days);
                totalInstances += t.days.length;
            }
        });

        const tasksDueToday = allPrepTasks
            .map((t, idx) => ({ ...t, original_index: idx }))
            .filter(t => t.days && t.days.includes(currentDay));
        
        const totalCompleted = plan.completed_task_ids?.length || 0;
        
        // A plan is ONLY truly done if everything is finished AND we've reached/passed the final day
        const isFullyDone = totalCompleted >= totalInstances && currentDay >= maxDay;

        return { currentDay, tasksDueToday, isFullyDone, maxDay };
    };

    const processedPlans = plans.map(plan => ({ ...plan, ...getPlanMetrics(plan) }));
    const activePlans = processedPlans.filter(p => !p.isFullyDone && p.tasksDueToday.length > 0);
    const completedPlansToday = processedPlans.filter(p => p.isFullyDone);

    const openSummary = (plan) => {
        navigate('/plan-summary', {
            state: {
                from: '/dashboard',
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

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh', flexDirection: 'column', gap: '16px' }}>
                <Loader2 size={40} color="#10b981" className="spin" />
                <p className="font-600 uppercase tracking-widest text-xs color-subtle">Syncing local calendar...</p>
            </div>
        );
    }

    return (
        <div className="flow-page animate-fade-in" style={{ padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2.4rem', fontWeight: '900', color: '#0f172a' }}>
                            Daily <span style={{ color: '#10b981' }}>Dashboard</span>
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '4px' }}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </header>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* ACTIVE TASKS SECTION */}
                    {activePlans.length > 0 ? (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <div style={{ height: '4px', width: '24px', background: '#10b981', borderRadius: '2px' }}></div>
                                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Today's Priority
                                </h2>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {activePlans.map(plan => (
                                    <div key={plan._id?.$oid || plan._id} className="card" style={{ padding: '24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                                                    Day {plan.currentDay} of {plan.maxDay}
                                                </div>
                                                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800' }}>{plan.context?.alternative} Preparation</h3>
                                            </div>
                                            <button 
                                                className="ghost-btn" 
                                                onClick={() => openSummary(plan)}
                                                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                                            >
                                                View Roadmap <ExternalLink size={14} style={{ marginLeft: '4px' }} />
                                            </button>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {plan.tasksDueToday.map((task) => {
                                                const taskId = `task_${task.original_index}_day_${plan.currentDay}`;
                                                const isCompleted = (plan.completed_task_ids || []).includes(taskId);
                                                const isSyncing = syncingTasks[`${plan._id?.$oid || plan._id}_${taskId}`];

                                                return (
                                                    <button
                                                        key={taskId}
                                                        type="button"
                                                        aria-pressed={isCompleted}
                                                        onClick={() => !isSyncing && toggleTask(plan._id?.$oid || plan._id, taskId, plan.completed_task_ids || [])}
                                                        style={{
                                                            width: '100%',
                                                            textAlign: 'left',
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            gap: '16px',
                                                            padding: '18px',
                                                            borderRadius: '16px',
                                                            background: isCompleted ? '#f0fdfa' : '#ffffff',
                                                            border: isCompleted ? '1px solid #05966930' : '1px solid #e2e8f0',
                                                            cursor: isSyncing ? 'wait' : 'pointer',
                                                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            boxShadow: isCompleted ? 'none' : '0 1px 3px rgba(0,0,0,0.02)'
                                                        }}
                                                    >
                                                        <div style={{ 
                                                            flexShrink: 0, 
                                                            width: '26px', 
                                                            height: '26px', 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'center',
                                                            marginTop: '1px' 
                                                        }}>
                                                            {isSyncing ? (
                                                                <Loader2 size={20} className="spin" color="#10b981" />
                                                            ) : isCompleted ? (
                                                                <CheckCircle2 size={26} color="#059669" fill="#10b98115" strokeWidth={2.5} />
                                                            ) : (
                                                                <Circle size={24} color="#cbd5e1" strokeWidth={2} />
                                                            )}
                                                        </div>
                                                        <span style={{ 
                                                            fontSize: '1rem', 
                                                            color: isCompleted ? '#065f46' : '#1e293b',
                                                            fontWeight: isCompleted ? '600' : '500',
                                                            lineHeight: '1.5',
                                                            opacity: isCompleted ? 0.8 : 1
                                                        }}>
                                                            {task.step || task.description || task.desc}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : completedPlansToday.length === 0 ? (
                        <div className="empty-state" style={{ padding: '60px 20px', background: '#fff' }}>
                            <Calendar size={48} color="#cbd5e1" style={{ marginBottom: '20px' }} />
                            <h3>Clear Schedule</h3>
                            <p>No organic preparation tasks scheduled for today. Check your Library to start a new Triage plan.</p>
                            <button className="secondary-btn mt-6" onClick={() => navigate('/my-plans')}>Open Library</button>
                        </div>
                    ) : null}

                    {/* COMPLETED TODAY SECTION */}
                    {completedPlansToday.length > 0 && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <div style={{ height: '4px', width: '24px', background: '#3b82f6', borderRadius: '2px' }}></div>
                                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Mission Accomplished
                                </h2>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {completedPlansToday.map(plan => (
                                    <div key={plan._id?.$oid || plan._id} className="card" style={{ padding: '20px', background: 'linear-gradient(to right, #f0fdf4, #ffffff)', border: '1px solid #10b98130', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ background: '#10b981', padding: '10px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}>
                                                <Trophy size={24} color="#fff" />
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#065f46' }}>{plan.context?.alternative}</h3>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#059669', fontWeight: '600' }}>
                                                    <PartyPopper size={14} /> View Application Phase
                                                </div>
                                            </div>
                                        </div>
                                        <button className="ghost-btn" onClick={() => openSummary(plan)}>
                                            Review Application <ArrowRight size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
