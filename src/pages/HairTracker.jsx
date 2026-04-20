import React, { useState, useRef } from "react";
import { Loader2, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { analyzeImage } from "../utils/faceDetection";
import api from "../utils/api";

const HairTracker = () => {
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [error, setError] = useState("");
    const [detectedFeatures, setDetectedFeatures] = useState(null);
    
    // User selection states
    const [hairType, setHairType] = useState("Wavy");
    const [hairDensity, setHairDensity] = useState("Medium");
    
    const imgRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
            setError("Please upload a valid image (JPG or PNG).");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("File size must be under 5MB.");
            return;
        }

        setImage(file);
        setResults([]);
        setError("");
        setDetectedFeatures(null);
        
        const reader = new FileReader();
        reader.onload = (event) => setPreview(event.target.result);
        reader.readAsDataURL(file);
    };

    const handleAnalysis = async () => {
        if (!image) {
            setError("Please upload a photo first");
            return;
        }

        setLoading(true);
        setError("");
        setResults([]);
        setDetectedFeatures(null);

        try {
            const imgElement = imgRef.current;
            const features = await analyzeImage(imgElement);

            if (!features) {
                setError("Upload a clear front-facing photo");
                setLoading(false);
                return;
            }

            // Combine detected features with user selections
            const profile = {
                ...features,
                hairType: hairType.toLowerCase(),
                hairDensity: hairDensity.toLowerCase()
            };

            setDetectedFeatures(profile);

            const response = await api.post(
                '/ai/hair-analysis',
                profile,
                { timeout: 30000 } // Extended timeout for Pexels fetching
            );

            if (response.data.success) {
                setResults(response.data.hairstyles);
            } else {
                setError("Failed to get recommendations. Please try again.");
            }

        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const SelectorGroup = ({ label, options, value, onChange }) => (
        <div style={{ marginBottom: '20px', width: '100%' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#8b949e', textAlign: 'left' }}>{label}</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-start' }}>
                {options.map(opt => (
                    <button
                        key={opt}
                        onClick={() => onChange(opt)}
                        style={{
                            padding: '8px 16px',
                            background: value === opt ? '#00f2ea' : 'transparent',
                            color: value === opt ? '#0d1117' : '#00f2ea',
                            border: '1px solid #00f2ea',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            flex: 1,
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="ai-tool-container" style={{ minHeight: '100vh', background: 'transparent', padding: '60px 20px', color: 'white', fontFamily: "'Outfit', sans-serif" }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                <h1 style={{ color: '#00f2ea', fontSize: '3rem', fontWeight: '900', marginBottom: '40px', textTransform: 'uppercase' }}>AI Hair Tracker</h1>

                <div style={{ background: 'rgba(22, 27, 34, 0.8)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(48, 54, 61, 0.8)', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
                    {!preview ? (
                        <div style={{ border: '2px dashed #30363d', borderRadius: '20px', padding: '40px' }}>
                            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} id="upload-input" />
                            <label htmlFor="upload-input" style={{ background: '#00f2ea', color: '#0d1117', padding: '15px 30px', borderRadius: '10px', cursor: 'pointer', fontWeight: '800' }}>📁 SELECT PHOTO</label>
                            <p style={{ marginTop: '20px', color: '#8b949e' }}>Upload a front-facing portrait (Max 5MB)</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <img ref={imgRef} id="uploaded-img" src={preview} alt="Preview" style={{ width: '250px', height: '250px', objectFit: 'cover', borderRadius: '20px', border: '3px solid #00f2ea', marginBottom: '30px' }} />
                            
                            {/* User Input Selectors */}
                            <div style={{ width: '100%', maxWidth: '400px', marginBottom: '20px' }}>
                                <SelectorGroup 
                                    label="Select your hair type:" 
                                    options={["Straight", "Wavy", "Curly"]} 
                                    value={hairType} 
                                    onChange={setHairType} 
                                />
                                <SelectorGroup 
                                    label="Hair density:" 
                                    options={["Thin", "Medium", "Thick"]} 
                                    value={hairDensity} 
                                    onChange={setHairDensity} 
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '15px', width: '100%', maxWidth: '400px' }}>
                                <button onClick={() => { setPreview(null); setImage(null); setResults([]); setDetectedFeatures(null); setError(""); }} style={{ flex: 1, padding: '15px', background: 'rgba(248, 81, 73, 0.15)', color: '#f85149', border: '1px solid #f85149', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>REMOVE</button>
                                <button onClick={handleAnalysis} disabled={loading} style={{ flex: 2, padding: '15px', background: '#00f2ea', color: '#0d1117', border: 'none', borderRadius: '10px', cursor: loading ? 'wait' : 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                    {loading ? <><Loader2 className="animate-spin" size={20} /> ANALYSING...</> : "START ANALYSIS"}
                                </button>
                            </div>
                        </div>
                    )}
                    {error && <p style={{ color: '#f85149', marginTop: '20px', fontWeight: '600' }}>{error}</p>}
                </div>

                {/* Your Hair Profile Card */}
                {detectedFeatures && (
                    <div className="detected-features-card" style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid #00f2ea', borderRadius: '16px', padding: '24px', margin: '20px auto', maxWidth: '450px', textAlign: 'left', animation: 'fadeIn 0.5s ease-out', boxShadow: '0 10px 30px rgba(0,242,234,0.1)' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.4rem', color: '#00f2ea', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px' }}>
                           Your Hair Profile
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(48,54,61,0.5)', paddingBottom: '8px' }}>
                                <span style={{ color: '#8b949e' }}>Gender:</span>
                                <span style={{ color: '#00f2ea', fontWeight: '700', textTransform: 'capitalize' }}>{detectedFeatures.gender}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(48,54,61,0.5)', paddingBottom: '8px' }}>
                                <span style={{ color: '#8b949e' }}>Face Shape:</span>
                                <span style={{ color: '#00f2ea', fontWeight: '700', textTransform: 'capitalize' }}>{detectedFeatures.faceShape}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(48,54,61,0.5)', paddingBottom: '8px' }}>
                                <span style={{ color: '#8b949e' }}>Hair Type:</span>
                                <span style={{ color: '#00f2ea', fontWeight: '700', textTransform: 'capitalize' }}>{hairType}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#8b949e' }}>Hair Density:</span>
                                <span style={{ color: '#00f2ea', fontWeight: '700', textTransform: 'capitalize' }}>{hairDensity}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hairstyle Cards Grid */}
                {results.length > 0 && (
                    <div style={{ marginTop: '60px' }}>
                        <h2 style={{ fontSize: '2.5rem', color: '#00f2ea', marginBottom: '40px', textTransform: 'uppercase', fontWeight: '900' }}>Recommended Styles</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', paddingBottom: '60px' }}>
                            {results.map((style, idx) => (
                                <div key={idx} className="hairstyle-card" style={{ background: 'rgba(13, 17, 23, 0.9)', border: '1px solid rgba(0,242,234,0.2)', borderRadius: '20px', overflow: 'hidden', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', textAlign: 'left' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#00f2ea'; e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,242,234,0.15)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0,242,234,0.2)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    <div style={{ position: 'relative', height: '280px', overflow: 'hidden' }}>
                                        <img 
                                            src={style.image}
                                            alt={style.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            loading="lazy"
                                        />
                                        <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', height: '80px' }}></div>
                                    </div>
                                    <div style={{ padding: '24px' }}>
                                        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.6rem', color: '#00f2ea', fontWeight: '800' }}>{style.name}</h3>
                                        <p style={{ fontSize: '0.95rem', color: '#8b949e', marginBottom: '15px', lineHeight: '1.6' }}>{style.description}</p>
                                        <div style={{ fontSize: '0.85rem', color: '#2dd4bf', marginBottom: '25px', padding: '10px 15px', background: 'rgba(45,212,191,0.1)', borderRadius: '8px', borderLeft: '3px solid #00f2ea' }}>
                                            <span style={{ fontWeight: '700' }}>Why it suits you:</span> {style.suitability}
                                        </div>
                                        <button onClick={() => navigate('/salons')} style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #00f2ea, #14b8a6)', color: '#0d1117', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.3s ease' }}>Book This Style</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .hairstyle-card img { transition: transform 0.6s ease; }
                .hairstyle-card:hover img { transform: scale(1.05); }
            `}</style>
        </div>
    );
};

export default HairTracker;
