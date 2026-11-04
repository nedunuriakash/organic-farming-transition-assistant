import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, Loader2, PlusCircle, X } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getCurrentUserId } from '../activeUser';
import '../styles/flow.css';
import '../styles/shared.css';

export default function Triage() {
    const navigate = useNavigate();
    const [farms, setFarms] = useState([]);
    const [mappings, setMappings] = useState(null);
    const [selectedFarmKey, setSelectedFarmKey] = useState('');
    const [chemical, setChemical] = useState('');

    // Status states
    const [loadingFarms, setLoadingFarms] = useState(true);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [error, setError] = useState('');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [newFarm, setNewFarm] = useState({ name: '', plot: '', crop: '', acres: 1, soil_type: 'Red' });
    const [savingFarm, setSavingFarm] = useState(false);

    const fetchFarms = async () => {
        setLoadingFarms(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/farms?user_id=${encodeURIComponent(getCurrentUserId())}`);
            const fetchedFarms = response.data.farms || [];
            setFarms(fetchedFarms);
            if (fetchedFarms.length > 0) {
                // Set default selection to the first farm's ID
                setSelectedFarmKey(fetchedFarms[0]._id.$oid);
            }
        } catch (err) {
            console.error("Failed to fetch farms", err);
            setError("Could not load your farm profiles.");
        } finally {
            setLoadingFarms(false);
        }
    };

    useEffect(() => {
        fetchFarms();
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
        if (!newFarm.name || !newFarm.plot || !newFarm.crop) {
            alert('Please enter a Farm Name, Plot Identifier, and Crop.');
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
                setSelectedFarmKey(res.data.farm_id); // Auto-select the new one
                setNewFarm({ name: '', plot: '', crop: '', acres: 1, soil_type: 'Red' });
                await fetchFarms(); // Refresh list
            }
        } catch (err) {
            setError('Failed to save farm. Please try again.');
        } finally {
            setSavingFarm(false);
        }
    };

    const handleNext = async () => {
        if (!chemical) {
            setError('Please enter a chemical name or describe the crop problem.');
            return;
        }
        if (!selectedFarmKey) {
            setError('Please select or create a farm plot.');
            return;
        }

        setLoadingSearch(true);
        setError('');

        try {
            const selectedFarm = farms.find(f => f._id.$oid === selectedFarmKey);
            const cropToUse = selectedFarm.crop || 'Unknown';

            const response = await axios.post(`${API_BASE_URL}/recommend`, {
                chemical: chemical,
                crop: cropToUse,
                acres: selectedFarm.acres || 1,
                language: 'English'
            });

            if (response.data.status === 'success') {
                const bestOption = response.data.options[0];
                // Skip /options entirely — go straight to the formulation lab
                navigate('/lab', {
                    state: {
                        selectedOption: bestOption,
                        context: {
                            chemical: bestOption.corrected_chemical || chemical,
                            corrected_chemical: bestOption.corrected_chemical || chemical,
                            crop: cropToUse,
                            plot: `${selectedFarm.name} - ${selectedFarm.plot}`,
                            acres: selectedFarm.acres || 1,
                            farm_id: selectedFarm._id.$oid
                        }
                    }
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to connect to backend server.');
        } finally {
            setLoadingSearch(false);
        }
    };

    return (
        <div className="flow-page animate-fade-in">
            <header className="page-header">
                <h1>Step 1: Farm Triage</h1>
                <p>Select the plot and identify the chemical dependency you want to eliminate.</p>
            </header>

            <div className="form-card" style={{ position: 'relative' }}>
                {error && <div style={{ color: '#dc2626', background: '#fee2e2', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}

                <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><MapPin size={16} /> Which plot are we treating?</span>
                    <button onClick={() => setShowModal(true)} style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <PlusCircle size={16} /> New Plot
                    </button>
                </label>

                {loadingFarms ? (
                    <div style={{ padding: '14px', border: '2px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', color: '#64748b' }}>
                        <Loader2 size={16} className="spin" style={{ display: 'inline', marginBottom: '-2px', marginRight: '8px' }} /> Loading plots...
                    </div>
                ) : (
                    <select
                        value={selectedFarmKey}
                        onChange={(e) => setSelectedFarmKey(e.target.value)}
                        className="modern-input"
                    >
                        {farms.length === 0 ? (
                            <option value="">No plots found. Please create one.</option>
                        ) : (
                            farms.map((farm) => (
                                <option key={farm._id.$oid} value={farm._id.$oid}>
                                    {farm.name} - {farm.plot} ({farm.crop}, {farm.acres} Acres)
                                </option>
                            ))
                        )}
                    </select>
                )}

                <label className="input-label" style={{ marginTop: '24px' }}><Search size={16} /> Chemical or Problem to Solve</label>
                <input
                    type="text"
                    list="chemList"
                    placeholder="e.g., Urea, DAP, or 'nitrogen deficiency'..."
                    value={chemical}
                    onChange={(e) => setChemical(e.target.value)}
                    className="modern-input"
                />
                <datalist id="chemList">
                    {mappings && Object.values(mappings.chemicals_by_problem).flat().map((c, i) => (
                        <option key={i} value={c} />
                    ))}
                </datalist>

                <button className="primary-btn mt-6" onClick={handleNext} disabled={loadingSearch || farms.length === 0}>
                    {loadingSearch ? <><Loader2 size={18} className="spin" style={{ display: 'inline', marginBottom: '-4px' }} /> Finding Organic Alternative...</> : <>Find Organic Alternative &rarr;</>}
                </button>

                {/* MODAL OVERLAY */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-panel">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ margin: 0, color: '#111827' }}>Add New Farm Plot</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X /></button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <datalist id="existingFarms">
                                    {[...new Set(farms.map(f => f.name))].map(name => (
                                        <option key={name} value={name} />
                                    ))}
                                </datalist>

                                <div>
                                    <label className="input-label">Farm Name</label>
                                    <input type="text" list="existingFarms" className="modern-input" style={{ width: '100%' }} value={newFarm.name} onChange={e => setNewFarm({ ...newFarm, name: e.target.value })} placeholder="Select existing or type new farm..." />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                    <div>
                                        <label className="input-label">Plot Identifier</label>
                                        <input type="text" className="modern-input" style={{ width: '100%' }} value={newFarm.plot} onChange={e => setNewFarm({ ...newFarm, plot: e.target.value })} placeholder="e.g., North Field" />
                                    </div>
                                    <div>
                                        <label className="input-label">Target Crop</label>
                                        <select className="modern-input" style={{ width: '100%' }} value={newFarm.crop} onChange={e => setNewFarm({ ...newFarm, crop: e.target.value })}>
                                            <option value="">Select Crop...</option>
                                            {mappings && mappings.crops.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                    <div>
                                        <label className="input-label">Acres</label>
                                        <input type="number" min="0.1" step="0.1" className="modern-input" style={{ width: '100%' }} value={newFarm.acres} onChange={e => setNewFarm({ ...newFarm, acres: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="input-label">Soil Type</label>
                                        <select className="modern-input" style={{ width: '100%' }} value={newFarm.soil_type} onChange={e => setNewFarm({ ...newFarm, soil_type: e.target.value })}>
                                            <option value="Red">Red Soil</option>
                                            <option value="Black">Black Soil</option>
                                            <option value="Alluvial">Alluvial Soil</option>
                                            <option value="Loamy">Loamy Soil</option>
                                        </select>
                                    </div>
                                </div>
                                <button className="primary-btn mt-6" onClick={handleCreateFarm} disabled={savingFarm}>
                                    {savingFarm ? 'Saving to Database...' : 'Save New Plot'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
}
