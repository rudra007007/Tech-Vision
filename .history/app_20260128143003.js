const { useState, useEffect } = React;

const API_BASE = 'http://localhost:5000';
const API_URL = `${API_BASE}/api`;

// UI Translation dictionary
const UI_TRANSLATIONS = {
    eng_Latn: {
        logo: 'SevaSahayak',
        hero_tag: 'Personalized Welfare Eligibility & Guidance Portal',
        hero_title1: 'Har adhikaar',
        hero_title2: 'Sahi haqdaar tak.',
        hero_desc: 'A smart AI platform that simplifies government welfare by identifying eligible schemes, explaining them in local language, and guiding citizens till application.',
        form_title: 'Check Your Eligibility',
        form_subtitle: 'Fill in your details to find schemes you qualify for',
        age_label: 'Age',
        age_placeholder: 'Enter your age',
        gender_label: 'Gender',
        gender_select: 'Select Gender',
        male: 'Male',
        female: 'Female',
        other: 'Other',
        income_label: 'Annual Income (₹)',
        income_placeholder: 'Enter annual income',
        state_label: 'State',
        state_select: 'Select State',
        occupation_label: 'Occupation',
        occupation_select: 'Select Occupation',
        farmer: 'Farmer',
        agriculture: 'Agriculture Worker',
        unemployed: 'Unemployed',
        student: 'Student',
        self_employed: 'Self Employed',
        salaried: 'Salaried',
        category_label: 'Category',
        category_select: 'Select Category',
        general: 'General',
        obc: 'OBC',
        sc: 'SC',
        st: 'ST',
        bpl: 'BPL',
        life_event_label: 'Life Event (Optional)',
        life_event_select: 'Select if applicable',
        job_loss: 'Lost my job recently',
        daughter_marriage: 'Daughter getting married',
        twelfth_failure: 'Failed in 12th standard',
        crop_failure: 'Crop failure this season',
        pregnancy: 'Expecting a child',
        medical_emergency: 'Medical emergency',
        check_btn: 'Check Eligibility',
        checking: 'Analyzing Eligibility...',
        analyzing: 'Analyzing your profile against 1000+ schemes...',
        translating: 'Translating results to',
        results_title: 'Your Personalized Results',
        eligible_count: 'Eligible Schemes',
        ineligible_count: 'Not Eligible',
        eligible_tab: 'Eligible Schemes',
        ineligible_tab: 'Not Eligible',
        category: 'Category',
        eligibility_status: 'Eligibility Status',
        documents: 'Required Documents',
        apply_now: 'Apply Now →',
        no_eligible: 'No Eligible Schemes Found',
        no_eligible_desc: 'Try adjusting your profile details or check back later',
        great_news: 'Great News!',
        all_eligible: 'You\'re eligible for all available schemes',
    },
    hin_Deva: {
        logo: 'सेवा सहायक',
        hero_tag: 'व्यक्तिगत कल्याण पात्रता और मार्गदर्शन पोर्टल',
        hero_title1: 'हर अधिकार',
        hero_title2: 'सही हकदार तक।',
        hero_desc: 'एक स्मार्ट एआई प्लेटफॉर्म जो सरकारी कल्याण को सरल बनाता है।',
        form_title: 'अपनी पात्रता जांचें',
        form_subtitle: 'योजनाएं खोजने के लिए अपना विवरण भरें',
        age_label: 'आयु',
        age_placeholder: 'अपनी आयु दर्ज करें',
        gender_label: 'लिंग',
        gender_select: 'लिंग चुनें',
        male: 'पुरुष',
        female: 'महिला',
        other: 'अन्य',
        income_label: 'वार्षिक आय (₹)',
        income_placeholder: 'वार्षिक आय दर्ज करें',
        state_label: 'राज्य',
        state_select: 'राज्य चुनें',
        occupation_label: 'व्यवसाय',
        occupation_select: 'व्यवसाय चुनें',
        farmer: 'किसान',
        agriculture: 'कृषि श्रमिक',
        unemployed: 'बेरोजगार',
        student: 'छात्र',
        self_employed: 'स्व-नियोजित',
        salaried: 'सैलरीड',
        category_label: 'श्रेणी',
        category_select: 'श्रेणी चुनें',
        general: 'सामान्य',
        obc: 'ओबीसी',
        sc: 'अनुसूचित जाति',
        st: 'अनुसूचित जनजाति',
        bpl: 'बीपीएल',
        life_event_label: 'जीवन घटना (वैकल्पिक)',
        life_event_select: 'यदि लागू हो तो चुनें',
        job_loss: 'हाल ही में नौकरी खोई',
        daughter_marriage: 'बेटी की शादी हो रही है',
        twelfth_failure: '12वीं में फेल',
        crop_failure: 'इस मौसम में फसल की विफलता',
        pregnancy: 'बच्चे की प्रत्याशा',
        medical_emergency: 'चिकित्सा आपातकाल',
        check_btn: 'पात्रता जांचें',
        checking: 'पात्रता का विश्लेषण जारी है...',
        analyzing: 'आपकी प्रोफाइल को 1000+ योजनाओं के विरुद्ध विश्लेषण किया जा रहा है...',
        translating: 'परिणामों का अनुवाद',
        results_title: 'आपके व्यक्तिगत परिणाम',
        eligible_count: 'पात्र योजनाएं',
        ineligible_count: 'अपात्र',
        eligible_tab: 'पात्र योजनाएं',
        ineligible_tab: 'अपात्र',
        category: 'श्रेणी',
        eligibility_status: 'पात्रता स्थिति',
        documents: 'आवश्यक दस्तावेज',
        apply_now: 'अभी आवेदन करें →',
        no_eligible: 'कोई पात्र योजना नहीं मिली',
        no_eligible_desc: 'अपने प्रोफाइल विवरण को समायोजित करने का प्रयास करें',
        great_news: 'बहुत बढ़िया!',
        all_eligible: 'आप सभी उपलब्ध योजनाओं के लिए पात्र हैं',
    },
    guj_Gujr: {
        logo: 'સેવા સહાયક',
        hero_tag: 'વ્યક્તિગત કલ્યાણ પાત્રતા અને માર્ગદર્શન પોર્ટલ',
        hero_title1: 'હર અધિકાર',
        hero_title2: 'સાચો હક્ક દાર સુધી।',
        hero_desc: 'સરકારી કલ્યાણને સરળ બનાવતું સ્માર્ટ એઆઈ પ્લેટફોર્મ।',
        form_title: 'તમારી પાત્રતા તપાસો',
        form_subtitle: 'યોજનાઓ શોધવા માટે તમારી વિગતો ભરો',
        age_label: 'વય',
        age_placeholder: 'તમારી વય દાખલ કરો',
        gender_label: 'લિંગ',
        gender_select: 'લિંગ પસંદ કરો',
        male: 'પુરુષ',
        female: 'મહિલા',
        other: 'અન્ય',
        income_label: 'વાર્ષિક આવક (₹)',
        income_placeholder: 'વાર્ષિક આવક દાખલ કરો',
        state_label: 'રાજ્ય',
        state_select: 'રાજ્ય પસંદ કરો',
        occupation_label: 'વ્યવસાય',
        occupation_select: 'વ્યવસાય પસંદ કરો',
        farmer: 'ખેતર',
        agriculture: 'કૃષિ કામદાર',
        unemployed: 'બેરોજગાર',
        student: 'વિદ્યાર્થી',
        self_employed: 'સ્વ-નિયુક્ત',
        salaried: 'સેલેરીવાળો',
        category_label: 'કેટેગરી',
        category_select: 'કેટેગરી પસંદ કરો',
        general: 'સામાન્ય',
        obc: 'ઓબીસી',
        sc: 'અનુસૂચિત જાતિ',
        st: 'અનુસૂચિત જનજાતિ',
        bpl: 'બીપીએલ',
        life_event_label: 'જીવન ઘટના (વૈકલ્પિક)',
        life_event_select: 'જો લાગુ હોય તો પસંદ કરો',
        job_loss: 'તાજેતરમાં નોકરી ગુમાવી',
        daughter_marriage: 'કણ્યા વિવાહ',
        twelfth_failure: '12મીમાં નિષ્ફળતા',
        crop_failure: 'આ મौસમે પાક નિષ્ફળતા',
        pregnancy: 'બાળક આશા',
        medical_emergency: 'તબીબી કટોકટી',
        check_btn: 'પાત્રતા તપાસો',
        checking: 'પાત્રતાનું વિશ્લેષણ...',
        analyzing: 'તમારી પ્રોફાઇલ 1000+ યોજનાઓ વિરુદ્ધ વિશ્લેષણ કરવામાં આવી રહી છે...',
        translating: 'પરિણામોનું અનુવાદ',
        results_title: 'તમારા વ્યક્તિગત પરિણામો',
        eligible_count: 'પાત્ર યોજનાઓ',
        ineligible_count: 'અપાત્ર',
        eligible_tab: 'પાત્ર યોજનાઓ',
        ineligible_tab: 'અપાત્ર',
        category: 'કેટેગરી',
        eligibility_status: 'પાત્રતા સ્થિતિ',
        documents: 'જરૂરી દસ્તાવેજો',
        apply_now: 'હવે અરજી કરો →',
        no_eligible: 'કોઈ પાત્ર યોજના મળી નહીં',
        no_eligible_desc: 'તમારી પ્રોફાઇલ વિગતો સમાયોજિત કરવાનો પ્રયાસ કરો',
        great_news: 'શાબાશ!',
        all_eligible: 'તમે તમામ ઉપલબ્ધ યોજનાઓ માટે પાત્ર છો',
    }
};

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
    const [selectedLanguage, setSelectedLanguage] = useState('eng_Latn');
    const [translating, setTranslating] = useState(false);
    const [translatedResults, setTranslatedResults] = useState(null);

    const languages = [
        { code: 'eng_Latn', name: 'English', flag: '🇬🇧' },
        { code: 'hin_Deva', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
        { code: 'guj_Gujr', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
        { code: 'pan_Guru', name: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳' },
        { code: 'ben_Beng', name: 'বাংলা (Bengali)', flag: '🇮🇳' },
        { code: 'mar_Deva', name: 'मराठी (Marathi)', flag: '🇮🇳' },
        { code: 'tam_Taml', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
        { code: 'tel_Telu', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
        { code: 'kan_Knda', name: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
        { code: 'mal_Mlym', name: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
        { code: 'ory_Orya', name: 'ଓଡ଼ିଆ (Odia)', flag: '🇮🇳' },
    ];

    // Get translated text
    const t = (key) => {
        const translations = UI_TRANSLATIONS[selectedLanguage] || UI_TRANSLATIONS['eng_Latn'];
        return translations[key] || key;
    };

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

    const translateScheme = async (scheme) => {
        if (selectedLanguage === 'eng_Latn') return scheme;

        try {
            const textsToTranslate = [
                scheme.name,
                scheme.benefit,
                scheme.category,
                scheme.scheme_type || 'Central Government',
                ...scheme.eligibility_status.reasons,
                ...scheme.documents
            ];

            console.log('Translating', textsToTranslate.length, 'texts for scheme:', scheme.id);

            // Try local backend first
            try {
                const response = await fetch(`${API_URL}/translate/batch`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        texts: textsToTranslate,
                        target_lang: selectedLanguage
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    if (!data.error) {
                        const translations = data.translations.map(t => t.translated);

                        let idx = 0;
                        const translatedScheme = {
                            ...scheme,
                            name: translations[idx++],
                            benefit: translations[idx++],
                            category: translations[idx++],
                            scheme_type: translations[idx++],
                            eligibility_status: {
                                ...scheme.eligibility_status,
                                reasons: scheme.eligibility_status.reasons.map(() => translations[idx++])
                            },
                            documents: scheme.documents.map(() => translations[idx++])
                        };

                        console.log('Local translation successful for:', scheme.id);
                        return translatedScheme;
                    }
                }
            } catch (error) {
                console.log('Local translation failed, trying Google Translate:', error.message);
            }

            // Fallback to Google Translate
            console.log('Using Google Translate API...');
            const googleTranslationMap = {
                'hin_Deva': 'hi',
                'guj_Gujr': 'gu',
                'pan_Guru': 'pa',
                'ben_Beng': 'bn',
                'mar_Deva': 'mr',
                'tam_Taml': 'ta',
                'tel_Telu': 'te',
                'kan_Knda': 'kn',
                'mal_Mlym': 'ml',
                'ory_Orya': 'or'
            };

            const targetLangCode = googleTranslationMap[selectedLanguage] || 'hi';
            const translations = [];

            for (const text of textsToTranslate) {
                try {
                    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLangCode}`;
                    const response = await fetch(url);
                    const data = await response.json();
                    
                    if (data.responseStatus === 200 && data.responseData.translatedText) {
                        translations.push(data.responseData.translatedText);
                    } else {
                        translations.push(text); // Fallback to original text
                    }
                } catch (error) {
                    console.error('Error translating text:', text, error);
                    translations.push(text); // Use original text if translation fails
                }
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            let idx = 0;
            const translatedScheme = {
                ...scheme,
                name: translations[idx++],
                benefit: translations[idx++],
                category: translations[idx++],
                scheme_type: translations[idx++],
                eligibility_status: {
                    ...scheme.eligibility_status,
                    reasons: scheme.eligibility_status.reasons.map(() => translations[idx++])
                },
                documents: scheme.documents.map(() => translations[idx++])
            };

            console.log('Google Translate successful for:', scheme.id);
            return translatedScheme;

        } catch (error) {
            console.error('Translation error for scheme', scheme.id, ':', error);
            return scheme;
        }
    };

    const handleLanguageChange = async (langCode) => {
        setSelectedLanguage(langCode);
        if (results && langCode !== 'eng_Latn') {
            setTranslating(true);
            try {
                console.log('Starting translation to:', langCode);
                const translatedEligible = await Promise.all(
                    results.eligible_schemes.map(scheme => translateScheme(scheme))
                );
                const translatedIneligible = await Promise.all(
                    results.ineligible_schemes.map(scheme => translateScheme(scheme))
                );
                
                console.log('Translation completed');
                setTranslatedResults({
                    ...results,
                    eligible_schemes: translatedEligible,
                    ineligible_schemes: translatedIneligible
                });
            } catch (error) {
                console.error('Translation failed:', error);
                alert('Translation failed: ' + error.message);
            } finally {
                setTranslating(false);
            }
        } else {
            setTranslatedResults(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResults(null);
        setTranslatedResults(null);

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
                            <div className="detail-label">{t('category')}</div>
                            <div className="detail-text">{scheme.category}</div>
                        </div>
                    </div>

                    {scheme.eligibility_status && (
                        <div className="detail-item">
                            <span className="detail-icon">{isEligible ? '✓' : '✗'}</span>
                            <div className="detail-content">
                                <div className="detail-label">{t('eligibility_status')}</div>
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
                            <div className="detail-label">{t('documents')}</div>
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
                            {t('apply_now')}
                        </a>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <nav className="navbar">
                <div className="logo">{t('logo')}</div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <select 
                        value={selectedLanguage}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            border: '2px solid var(--primary)',
                            background: 'white',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        {languages.map(lang => (
                            <option key={lang.code} value={lang.code}>
                                {lang.flag} {lang.name}
                            </option>
                        ))}
                    </select>
                </div>
            </nav>

            <div className="container">
                <div className="hero-section">
                    <div className="hero-tag">{t('hero_tag')}</div>
                    <h1>
                        {t('hero_title1')}<br />
                        <span className="gradient-text">{t('hero_title2')}</span>
                    </h1>
                    <p className="hero-description">
                        {t('hero_desc')}
                    </p>
                </div>

                <div className="form-section">
                    <div className="form-header">
                        <div>
                            <h2 className="form-title">{t('form_title')}</h2>
                            <p style={{ color: 'var(--text-light)' }}>{t('form_subtitle')}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="input-group">
                                <label>{t('age_label')}</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleInputChange}
                                    placeholder={t('age_placeholder')}
                                    required
                                    min="1"
                                    max="100"
                                />
                            </div>

                            <div className="input-group">
                                <label>{t('gender_label')}</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">{t('gender_select')}</option>
                                    <option value="male">{t('male')}</option>
                                    <option value="female">{t('female')}</option>
                                    <option value="other">{t('other')}</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label>{t('income_label')}</label>
                                <input
                                    type="number"
                                    name="annual_income"
                                    value={formData.annual_income}
                                    onChange={handleInputChange}
                                    placeholder={t('income_placeholder')}
                                    required
                                    min="0"
                                />
                            </div>

                            <div className="input-group">
                                <label>{t('state_label')}</label>
                                <select
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">{t('state_select')}</option>
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
                                <label>{t('occupation_label')}</label>
                                <select
                                    name="occupation"
                                    value={formData.occupation}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">{t('occupation_select')}</option>
                                    <option value="farmer">{t('farmer')}</option>
                                    <option value="agriculture">{t('agriculture')}</option>
                                    <option value="unemployed">{t('unemployed')}</option>
                                    <option value="student">{t('student')}</option>
                                    <option value="self-employed">{t('self_employed')}</option>
                                    <option value="salaried">{t('salaried')}</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label>{t('category_label')}</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">{t('category_select')}</option>
                                    <option value="general">{t('general')}</option>
                                    <option value="obc">{t('obc')}</option>
                                    <option value="sc">{t('sc')}</option>
                                    <option value="st">{t('st')}</option>
                                    <option value="bpl">{t('bpl')}</option>
                                </select>
                            </div>

                            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                                <label>{t('life_event_label')}</label>
                                <select
                                    name="life_event"
                                    value={formData.life_event}
                                    onChange={handleInputChange}
                                >
                                    <option value="">{t('life_event_select')}</option>
                                    <option value="job_loss">{t('job_loss')}</option>
                                    <option value="daughter_marriage">{t('daughter_marriage')}</option>
                                    <option value="12th_failure">{t('twelfth_failure')}</option>
                                    <option value="crop_failure">{t('crop_failure')}</option>
                                    <option value="pregnancy">{t('pregnancy')}</option>
                                    <option value="medical_emergency">{t('medical_emergency')}</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? (
                                <>
                                    <span>{t('checking')}</span>
                                </>
                            ) : (
                                <>
                                    {t('check_btn')}
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {loading && (
                    <div className="loading">
                        <div className="spinner"></div>
                        <p style={{ color: 'var(--text-light)' }}>
                            {t('analyzing')}
                        </p>
                    </div>
                )}

                {translating && (
                    <div className="loading">
                        <div className="spinner"></div>
                        <p style={{ color: 'var(--text-light)' }}>
                            {t('translating')} {languages.find(l => l.code === selectedLanguage)?.name}...
                        </p>
                    </div>
                )}

                {results && (
                    <div className="results-section" id="results">
                        <div className="results-header">
                            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                                {selectedLanguage === 'eng_Latn' || !translatedResults ? t('results_title') : t('results_title')}
                            </h2>
                            <div className="results-stats">
                                <div className="stat">
                                    <div className="stat-number">{results.eligible_count}</div>
                                    <div className="stat-label">{t('eligible_count')}</div>
                                </div>
                                <div className="stat">
                                    <div className="stat-number">{results.ineligible_count}</div>
                                    <div className="stat-label">{t('ineligible_count')}</div>
                                </div>
                            </div>
                        </div>

                        <div className="schemes-container">
                            <div className="schemes-tabs">
                                <button
                                    className={`tab ${activeTab === 'eligible' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('eligible')}
                                >
                                    ✓ {t('eligible_tab')} ({results.eligible_count})
                                </button>
                                <button
                                    className={`tab ${activeTab === 'ineligible' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('ineligible')}
                                >
                                    ✗ {t('ineligible_tab')} ({results.ineligible_count})
                                </button>
                            </div>

                            {activeTab === 'eligible' && (
                                <div>
                                    {(translatedResults?.eligible_schemes || results.eligible_schemes).length > 0 ? (
                                        (translatedResults?.eligible_schemes || results.eligible_schemes).map(scheme => (
                                            <SchemeCard key={scheme.id} scheme={scheme} isEligible={true} />
                                        ))
                                    ) : (
                                        <div className="empty-state">
                                            <div className="empty-icon">😔</div>
                                            <h3>{t('no_eligible')}</h3>
                                            <p>{t('no_eligible_desc')}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'ineligible' && (
                                <div>
                                    {(translatedResults?.ineligible_schemes || results.ineligible_schemes).length > 0 ? (
                                        (translatedResults?.ineligible_schemes || results.ineligible_schemes).map(scheme => (
                                            <SchemeCard key={scheme.id} scheme={scheme} isEligible={false} />
                                        ))
                                    ) : (
                                        <div className="empty-state">
                                            <div className="empty-icon">🎉</div>
                                            <h3>{t('great_news')}</h3>
                                            <p>{t('all_eligible')}</p>
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
