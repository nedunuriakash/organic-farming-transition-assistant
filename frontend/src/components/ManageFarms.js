import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, PlusCircle, Sprout, Edit3, Trash2, CalendarClock, Beaker, MapPin } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { getCurrentUserId } from '../activeUser';
import axios from 'axios';
import '../styles/flow.css';

export default function ManageFarms() {
    const navigate = useNavigate();
    const [farms, setFarms] = useState([]);
    const [mappings, setMappings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [newFarm, setNewFarm] = useState({ name: '', plot: '', crop: '', acres: 1, soil_type: 'Red' });
    const [savingFarm, setSavingFarm] = useState(false);
    const [modalError, setModalError] = useState('');
    const [confirmDeleteId, setConfirmDeleteId] = useState(null); // farmId awaiting delete confirm

    const fetchFarmsAndHistory = async () => {
        setLoading(true);
        try {
            // Fetch farms for the user
            const userId = getCurrentUserId();
            const farmsRes = await axios.get(`${API_BASE_URL}/api/farms?user_id=${encodeURIComponent(userId)}`);
            const userFarms = farmsRes.data.farms || [];

            // Fetch formulation history for the user
            const plansRes = await axios.get(`${API_BASE_URL}/api/formulations?user_id=${encodeURIComponent(userId)}`);
            const allPlans = plansRes.data.plans || [];

            // Tie plans to farms
            const farmsWithHistory = userFarms.map(farm => {
                const farmSubstr = `${farm.name} - ${farm.plot}`;

                // Find plans targeting this specific farm via explicitly passed ID, or fallback to name matching for older records
                const farmPlans = allPlans.filter(plan => {
                    if (plan.context && plan.context.farm_id) {
                        return plan.context.farm_id === farm._id.$oid;
                    }
                    return plan.context && plan.context.plot && plan.context.plot.includes(farmSubstr);
                });

                return {
                    ...farm,
                    history: farmPlans
                };
            });

            setFarms(farmsWithHistory);
        } catch (err) {
            setError('Failed to load farms and history.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFarmsAndHistory();
        const fetchMappings = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/mappings`);
                if (res.data.status === 'success') setMappings(res.data.data);
            } catch (err) {
                console.error("Failed to load mappings", err);
            }
        };
        fetchMappings();
    }, []);

    const handleCreateFarm = async () => {
        setModalError('');
        if (!newFarm.name || !newFarm.plot || !newFarm.crop) {
            setModalError('Please fill in Farm Name, Plot Identifier, and Target Crop.');
            return;
        }
        setSavingFarm(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/farms`, {
                ...newFarm,
                user_id: getCurrentUserId()
            });
            if (res.data.status === 'success') {
                setShowModal(false);
                setNewFarm({ name: '', plot: '', crop: '', acres: 1, soil_type: 'Red' });
                await fetchFarmsAndHistory(); // Refresh list
            }
        } catch (err) {
            setModalError('Failed to save farm. Please check your connection and try again.');
        } finally {
            setSavingFarm(false);
        }
    };

    const handleDelete = async (farmId) => {
        setConfirmDeleteId(null);
        try {
            await axios.delete(`${API_BASE_URL}/api/farms/${farmId}`);
            await fetchFarmsAndHistory();
        } catch (err) {
            setError('Failed to delete farm. Please try again.');
        }
    };

    return (
        <div className="flow-page animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', background: 'rgba(255, 255, 255, 0.9)', padding: '24px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', backdropFilter: 'blur(10px)', border: '1px solid #f1f5f9' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', margin: '0 0 8px 0', background: 'linear-gradient(45deg, #059669, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Farm Portfolio
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: '#64748b', margin: 0 }}>Manage your land assets and review active treatment regimens.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="primary-btn"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '14px 28px', borderRadius: '30px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 25px -5px rgba(16, 185, 129, 0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(16, 185, 129, 0.3)'; }}
                >
                    <PlusCircle size={20} /> Register New Plot
                </button>
            </header>

            {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '16px', borderRadius: '12px', marginBottom: '24px', color: '#b91c1c' }}>
                    {error}
                </div>
            )}

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px', color: '#8b5cf6', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                    <Loader2 size={64} className="spin" />
                    <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>Loading your farms...</p>
                </div>
            ) : farms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 40px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>
                    <Sprout size={80} color="#3b82f6" style={{ margin: '0 auto 32px', opacity: 0.8, filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.5))' }} />
                    <h3 style={{ color: '#1e293b', marginBottom: '16px', fontSize: '1.6rem', fontWeight: '700' }}>No plots registered yet</h3>
                    <p style={{ color: '#64748b', marginBottom: '40px', fontSize: '1.1rem', maxWidth: '420px', margin: '0 auto 40px', lineHeight: '1.6' }}>You haven't added any farm plots yet. Click the button below to register your first plot and start getting organic plans.</p>
                    <button onClick={() => setShowModal(true)} className="primary-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><PlusCircle size={18} /> Add Your First Plot</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
                    {farms.map((farm) => (
                        <div key={farm._id.$oid}
                            onClick={() => navigate(`/farms/${farm._id.$oid}`)}
                            style={{ background: 'rgba(255, 255, 255, 0.9)', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', overflow: 'hidden', display: 'flex', flexDirection: 'column', backdropFilter: 'blur(10px)', cursor: 'pointer', transition: 'all 0.2s ease-in-out' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px -8px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#93c5fd'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                        >

                            {/* Card Header block */}
                            <div style={{ padding: '24px 24px 16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 4px 0', color: '#1e293b', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                                        <MapPin size={22} color="#3b82f6" /> {farm.name}
                                    </h3>
                                    <div style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }}></div> Plot: <span style={{ color: '#475569' }}>{farm.plot}</span></div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {confirmDeleteId === farm._id.$oid ? (
                                        <>
                                            <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: '600' }}>Delete?</span>
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(farm._id.$oid); }} style={{ background: '#ef4444', border: 'none', color: 'white', cursor: 'pointer', padding: '6px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700' }}>Yes</button>
                                            <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }} style={{ background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600' }}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={(e) => { e.stopPropagation(); /* edit disabled */ }} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#94a3b8', cursor: 'pointer', padding: '8px', borderRadius: '12px', transition: 'all 0.2s' }} title="Edit disabled in MVP" disabled>
                                                <Edit3 size={18} />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(farm._id.$oid); }} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '12px', transition: 'all 0.2s' }} title="Delete Farm">
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Core Info */}
                            <div style={{ padding: '0 24px 24px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: '600' }}>Target Crop</div>
                                    <div style={{ fontWeight: '600', color: '#334155', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>🌱 {farm.crop || 'Unknown'}</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: '600' }}>Land Area</div>
                                    <div style={{ fontWeight: '600', color: '#334155', fontSize: '1.05rem' }}>📏 {farm.acres} Acres</div>
                                </div>
                            </div>

                            {/* Unified Action Footer */}
                            <div style={{ padding: '16px 24px', background: '#f8fafc', flex: 1, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.95rem' }}>
                                    <Beaker size={18} color="#8b5cf6" />
                                    <span style={{ fontWeight: '600' }}>{farm.history && farm.history.length > 0 ? `${farm.history.length} Saved Formulations` : 'No formulations yet'}</span>
                                </div>
                                <div style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    View Details &rarr;
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL OVERLAY FOR ADDING FARMS */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="animate-fade-in" style={{ background: '#fff', borderRadius: '24px', padding: '40px', width: '90%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <div>
                                <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.8rem' }}>Register New Plot</h2>
                                <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Enter the details of your agricultural land to begin.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'} onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', color: '#475569', fontWeight: '600' }}>Farm/Estate Name</label>
                                <input type="text" className="modern-input" style={{ width: '100%', boxSizing: 'border-box', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '14px' }} value={newFarm.name} onChange={e => setNewFarm({ ...newFarm, name: e.target.value })} placeholder="e.g. uday farm1" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', color: '#475569', fontWeight: '600' }}>Plot Identifier</label>
                                    <input type="text" className="modern-input" style={{ width: '100%', boxSizing: 'border-box', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '14px' }} value={newFarm.plot} onChange={e => setNewFarm({ ...newFarm, plot: e.target.value })} placeholder="e.g., hasanparthy" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', color: '#475569', fontWeight: '600' }}>Target Crop</label>
                                    <select 
                                        className="modern-input" 
                                        style={{ width: '100%', boxSizing: 'border-box', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '14px', cursor: 'pointer' }} 
                                        value={newFarm.crop} 
                                        onChange={e => setNewFarm({ ...newFarm, crop: e.target.value })}
                                    >
                                        <option value="">Select Crop...</option>
                                        {mappings && mappings.crops.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', color: '#475569', fontWeight: '600' }}>Land Area (Acres)</label>
                                    <input type="number" className="modern-input" style={{ width: '100%', boxSizing: 'border-box', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '14px' }} value={newFarm.acres} onChange={e => setNewFarm({ ...newFarm, acres: e.target.value })} min="0.1" step="0.1" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', color: '#475569', fontWeight: '600' }}>Soil Profile</label>
                                    <select className="modern-input" style={{ width: '100%', boxSizing: 'border-box', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '14px', cursor: 'pointer' }} value={newFarm.soil_type} onChange={e => setNewFarm({ ...newFarm, soil_type: e.target.value })}>
                                        <option value="Red">Red Soil</option>
                                        <option value="Black">Black Soil</option>
                                        <option value="Alluvial">Alluvial Soil</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                className="primary-btn mt-6"
                                onClick={handleCreateFarm}
                                disabled={savingFarm}
                                style={{ width: '100%', padding: '16px', fontSize: '1.1rem', borderRadius: '16px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', cursor: savingFarm ? 'not-allowed' : 'pointer', opacity: savingFarm ? 0.7 : 1, transition: 'transform 0.2s', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}
                            >
                                {savingFarm ? <><Loader2 size={20} className="spin" style={{ display: 'inline', marginBottom: '-4px', marginRight: '8px' }} />Creating Plot Profile...</> : 'Save Plot Profile'}
                            </button>
                            {modalError && (
                                <p style={{ color: '#b91c1c', fontSize: '0.9rem', marginTop: '8px', textAlign: 'center' }}>{modalError}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
