const { useState, useEffect } = React;

const API_BASE = 'https://tech-vision-ouy2.onrender.com';
const API_URL = `${API_BASE}/api`;

function App() {
    const [formData, setFormData] = useState({
        age: '',
        gender: '',
        annual_income: '',
        state: '',
        occupation: '',
        category: '',
        life_event: ''
    });
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('eligible');
    const [backendStatus, setBackendStatus] = useState('checking');

    useEffect(() => {
        fetch(`${API_URL}/health`)
            .then(res => res.json())
            .then(() => setBackendStatus('connected'))
            .catch(() => setBackendStatus('disconnected'));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResults(null);

        try {
            const response = await fetch(`${API_URL}/schemes/check-eligibility`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    age: parseInt(formData.age),
                    annual_income: parseInt(formData.annual_income)
                })
            });

            if (!response.ok) throw new Error('Failed to fetch schemes');

            const data = await response.json();
            setResults(data);

            // Scroll to results
            setTimeout(() => {
                document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (error) {
            alert('Error checking eligibility. Make sure the backend server is running on port 5000.');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityLabel = (score) => {
        if (score >= 80) return { label: 'High Priority', class: 'priority-high' };
        if (score >= 60) return { label: 'Medium Priority', class: 'priority-medium' };
        return { label: 'Low Priority', class: 'priority-low' };
    };

    const SchemeCard = ({ scheme, isEligible }) => {
        const priority = getPriorityLabel(scheme.priority_score || 0);

        return (
            <div className={`scheme-card ${isEligible ? 'eligible' : ''}`}>
                <div className="scheme-header">
                    <div>
                        <div className="scheme-type">{scheme.scheme_type}</div>
                        <h3 className="scheme-title">{scheme.name}</h3>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span className={isEligible ? 'scheme-badge badge-eligible' : 'scheme-badge badge-ineligible'}>
                            {isEligible ? '✓ Eligible' : '✗ Not Eligible'}
                        </span>
                        {isEligible && scheme.priority_score >= 70 && (
                            <span className="scheme-badge badge-priority">
                                🔥 {priority.label}
                            </span>
                        )}
                    </div>
                </div>

                <div className="scheme-benefit">
                    💰 {scheme.benefit}
                </div>

                <div className="scheme-details">
                    <div className="detail-item">
                        <span className="detail-icon">📋</span>
                        <div className="detail-content">
                            <div className="detail-label">Category</div>
                            <div className="detail-text">{scheme.category}</div>
                        </div>
                    </div>

                    {scheme.eligibility_status && (
                        <div className="detail-item">
                            <span className="detail-icon">{isEligible ? '✓' : '✗'}</span>
                            <div className="detail-content">
                                <div className="detail-label">Eligibility Status</div>
                                <ul className="reasons-list">
                                    {scheme.eligibility_status.reasons.map((reason, idx) => (
                                        <li key={idx} className={isEligible ? 'eligible-reason' : 'ineligible-reason'}>
                                            {reason}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    <div className="detail-item">
                        <span className="detail-icon">📄</span>
                        <div className="detail-content">
                            <div className="detail-label">Required Documents</div>
                            <div className="documents-list">
                                {scheme.documents.map((doc, idx) => (
                                    <span key={idx} className="document-tag">{doc}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {isEligible && (
                    <div className="scheme-actions">
                        <a href={scheme.application_link} target="_blank" rel="noopener noreferrer" className="btn-apply">
                            Apply Now →
                        </a>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <nav>
                <div className="logo">
                    🇮🇳 SevaSahayak
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        fontSize: '0.85rem',
                        padding: '0.4rem 1rem',
                        borderRadius: '20px',
                        background: backendStatus === 'connected' ? '#D4EDDA' : '#F8D7DA',
                        color: backendStatus === 'connected' ? '#155724' : '#721C24'
                    }}>
                        {backendStatus === 'connected' ? '● ONLINE' : '● OFFLINE'}
                    </div>
                </div>
            </nav>

            <div className="container">
                <div className="hero-section">
                    <div className="hero-tag">🚀 AI-Powered Welfare Intelligence</div>
                    <h1>
                        From Awareness to<br />
                        <span className="gradient-text">Entitlement</span>
                    </h1>
                    <p className="hero-description">
                        Discover government welfare schemes you're eligible for.
                        Get personalized recommendations based on your profile and life situation.
                    </p>
                </div>

                <div className="form-section">
                    <div className="form-header">
                        <div className="form-icon">🎯</div>
                        <div>
                            <h2 className="form-title">Check Your Eligibility</h2>
                            <p style={{ color: 'var(--text-light)' }}>Fill in your details to find schemes you qualify for</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="input-group">
                                <label>👤 Age</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleInputChange}
                                    placeholder="Enter your age"
                                    required
                                    min="1"
                                    max="100"
                                />
                            </div>

                            <div className="input-group">
                                <label>⚧ Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label>💰 Annual Income (₹)</label>
                                <input
                                    type="number"
                                    name="annual_income"
                                    value={formData.annual_income}
                                    onChange={handleInputChange}
                                    placeholder="Enter annual income"
                                    required
                                    min="0"
                                />
                            </div>

                            <div className="input-group">
                                <label>📍 State</label>
                                <select
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select State</option>
                                    <option value="Gujarat">Gujarat</option>
                                    <option value="Maharashtra">Maharashtra</option>
                                    <option value="Rajasthan">Rajasthan</option>
                                    <option value="Delhi">Delhi</option>
                                    <option value="Karnataka">Karnataka</option>
                                    <option value="Tamil Nadu">Tamil Nadu</option>
                                    <option value="Kerala">Kerala</option>
                                    <option value="Bihar">Bihar</option>
                                    <option value="West Bengal">West Bengal</option>
                                    <option value="Punjab">Punjab</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label>💼 Occupation</label>
                                <select
                                    name="occupation"
                                    value={formData.occupation}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Occupation</option>
                                    <option value="farmer">Farmer</option>
                                    <option value="agriculture">Agriculture Worker</option>
                                    <option value="unemployed">Unemployed</option>
                                    <option value="student">Student</option>
                                    <option value="self-employed">Self Employed</option>
                                    <option value="salaried">Salaried</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label>📊 Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="general">General</option>
                                    <option value="obc">OBC</option>
                                    <option value="sc">SC</option>
                                    <option value="st">ST</option>
                                    <option value="bpl">BPL</option>
                                </select>
                            </div>

                            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                                <label>🎭 Life Event (Optional)</label>
                                <select
                                    name="life_event"
                                    value={formData.life_event}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select if applicable</option>
                                    <option value="job_loss">Lost my job recently</option>
                                    <option value="daughter_marriage">Daughter getting married</option>
                                    <option value="12th_failure">Failed in 12th standard</option>
                                    <option value="crop_failure">Crop failure this season</option>
                                    <option value="pregnancy">Expecting a child</option>
                                    <option value="medical_emergency">Medical emergency</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? (
                                <>
                                    <span>Analyzing Eligibility...</span>
                                </>
                            ) : (
                                <>
                                    🔍 Check Eligibility
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {loading && (
                    <div className="loading">
                        <div className="spinner"></div>
                        <p style={{ color: 'var(--text-light)' }}>
                            Analyzing your profile against 1000+ schemes...
                        </p>
                    </div>
                )}

                {results && (
                    <div className="results-section" id="results">
                        <div className="results-header">
                            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                                Your Personalized Results
                            </h2>
                            <div className="results-stats">
                                <div className="stat">
                                    <div className="stat-number">{results.eligible_count}</div>
                                    <div className="stat-label">Eligible Schemes</div>
                                </div>
                                <div className="stat">
                                    <div className="stat-number">{results.ineligible_count}</div>
                                    <div className="stat-label">Not Eligible</div>
                                </div>
                            </div>
                        </div>

                        <div className="schemes-container">
                            <div className="schemes-tabs">
                                <button
                                    className={`tab ${activeTab === 'eligible' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('eligible')}
                                >
                                    ✓ Eligible Schemes ({results.eligible_count})
                                </button>
                                <button
                                    className={`tab ${activeTab === 'ineligible' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('ineligible')}
                                >
                                    ✗ Not Eligible ({results.ineligible_count})
                                </button>
                            </div>

                            {activeTab === 'eligible' && (
                                <div>
                                    {results.eligible_schemes.length > 0 ? (
                                        results.eligible_schemes.map(scheme => (
                                            <SchemeCard key={scheme.id} scheme={scheme} isEligible={true} />
                                        ))
                                    ) : (
                                        <div className="empty-state">
                                            <div className="empty-icon">😔</div>
                                            <h3>No Eligible Schemes Found</h3>
                                            <p>Try adjusting your profile details or check back later</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'ineligible' && (
                                <div>
                                    {results.ineligible_schemes.length > 0 ? (
                                        results.ineligible_schemes.map(scheme => (
                                            <SchemeCard key={scheme.id} scheme={scheme} isEligible={false} />
                                        ))
                                    ) : (
                                        <div className="empty-state">
                                            <div className="empty-icon">🎉</div>
                                            <h3>Great News!</h3>
                                            <p>You're eligible for all available schemes</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
