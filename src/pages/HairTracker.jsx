import React, { useState, useRef } from "react";
import { Loader2 } from "lucide-react";
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
        // 1. Check photo uploaded
        if (!image) {
            setError("Please upload a photo first");
            return;
        }

        // 2. Start loading
        setLoading(true);
        setError("");
        setResults([]);
        setDetectedFeatures(null);

        try {
            // 3. Detect face
            const imgElement = imgRef.current;
            const features = await analyzeImage(imgElement);

            if (!features) {
                setError("Upload a clear front-facing photo");
                setLoading(false);
                return;
            }

            // 4. Show detected features
            console.log("Detected Features:", features);
            setDetectedFeatures(features);

            // 5. Call backend using the centralized api utility
            const response = await api.post(
                '/ai/hair-analysis',
                {
                    gender: features.gender,
                    faceShape: features.faceShape,
                    hairType: features.hairType,
                    hairDensity: features.hairDensity
                },
                { timeout: 15000 }
            );

            // 6. Show results
            if (response.data.success) {
                setResults(response.data.hairstyles);
            } else {
                setError("Failed to get recommendations. Please try again.");
            }

        } catch (err) {
            console.error(err);
            // 7. Even on error show something
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-tool-container" style={{ minHeight: '100vh', background: 'transparent', padding: '60px 20px', color: 'white', fontFamily: "'Outfit', sans-serif" }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                <h1 style={{ color: '#00f2ea', fontSize: '3rem', fontWeight: '900', marginBottom: '40px', textTransform: 'uppercase' }}>AI Hair Tracker</h1>

                <div style={{ background: 'rgba(22, 27, 34, 0.8)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(48, 54, 61, 0.8)', marginBottom: '40px' }}>
                    {!preview ? (
                        <div style={{ border: '2px dashed #30363d', borderRadius: '20px', padding: '40px' }}>
                            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} id="upload-input" />
                            <label htmlFor="upload-input" style={{ background: '#00f2ea', color: '#0d1117', padding: '15px 30px', borderRadius: '10px', cursor: 'pointer', fontWeight: '800' }}>📁 SELECT PHOTO</label>
                            <p style={{ marginTop: '20px', color: '#8b949e' }}>Upload a front-facing portrait (Max 5MB)</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <img ref={imgRef} id="uploaded-img" src={preview} alt="Preview" style={{ width: '250px', height: '250px', objectFit: 'cover', borderRadius: '20px', border: '3px solid #00f2ea', marginBottom: '20px' }} />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => { setPreview(null); setImage(null); setResults([]); setDetectedFeatures(null); setError(""); }} style={{ padding: '15px 30px', background: '#f85149', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>REMOVE</button>
                                <button onClick={handleAnalysis} disabled={loading} style={{ padding: '15px 30px', background: '#00f2ea', color: '#0d1117', border: 'none', borderRadius: '10px', cursor: loading ? 'wait' : 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {loading ? <><Loader2 className="animate-spin" size={20} /> ANALYSING...</> : "START ANALYSIS"}
                                </button>
                            </div>
                        </div>
                    )}
                    {error && <p style={{ color: '#f85149', marginTop: '15px', fontWeight: '600' }}>{error}</p>}
                </div>

                {/* Detected Features Card */}
                {detectedFeatures && (
                    <div className="detected-features-card" style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid #00f2ea', borderRadius: '12px', padding: '16px 20px', margin: '20px auto', maxWidth: '400px', textAlign: 'left', animation: 'fadeIn 0.5s ease-out' }}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', color: '#00f2ea', textTransform: 'uppercase' }}>Detected Features</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: '#8b949e' }}>Gender:</span>
                            <span style={{ color: '#00f2ea', fontWeight: '700', textTransform: 'capitalize' }}>{detectedFeatures.gender}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: '#8b949e' }}>Face Shape:</span>
                            <span style={{ color: '#00f2ea', fontWeight: '700', textTransform: 'capitalize' }}>{detectedFeatures.faceShape}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: '#8b949e' }}>Hair Type:</span>
                            <span style={{ color: '#00f2ea', fontWeight: '700', textTransform: 'capitalize' }}>{detectedFeatures.hairType}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#8b949e' }}>Hair Density:</span>
                            <span style={{ color: '#00f2ea', fontWeight: '700', textTransform: 'capitalize' }}>{detectedFeatures.hairDensity}</span>
                        </div>
                    </div>
                )}

                {/* Hairstyle Cards Grid */}
                {results.length > 0 && (
                    <div style={{ marginTop: '60px' }}>
                        <h2 style={{ fontSize: '2rem', color: '#00f2ea', marginBottom: '30px', textTransform: 'uppercase' }}>Recommended Styles</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', paddingBottom: '40px' }}>
                            {results.map((style, idx) => (
                                <div key={idx} className="hairstyle-card" style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(0,255,209,0.3)', borderRadius: '12px', overflow: 'hidden', transition: 'all 0.3s ease', textAlign: 'left' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#00f2ea'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0,255,209,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                                        <img 
                                            src={(() => {
                                                const maleIds = [
                                                    '1595476108010-b4d1fbee02b1',
                                                    '1622286342621-4bd786c2447c',
                                                    '1503951914875-452162b0f3f1',
                                                    '1552332386-f8dd00dc2f85',
                                                    '1492562080023-ab3db95bfbce'
                                                ];
                                                const femaleIds = [
                                                    '1562322140-8baeececf3df',
                                                    '1508218469311-ad9c10486dec',
                                                    '1522333323059-591dc6617e4d',
                                                    '1494790108377-be9c29b29330',
                                                    '1516756208402-31c22d9c5df0'
                                                ];
                                                const idList = detectedFeatures?.gender === 'female' ? femaleIds : maleIds;
                                                const photoId = idList[idx % idList.length];
                                                return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=400&h=400&q=80`;
                                            })()}
                                            alt={style.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => {
                                                e.target.src = `https://loremflickr.com/400/400/hairstyle?lock=${idx}`
                                            }}
                                        />
                                    </div>
                                    <div style={{ padding: '20px' }}>
                                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem', color: '#00f2ea' }}>{style.name}</h3>
                                        <p style={{ fontSize: '0.9rem', color: '#e2e8f0', marginBottom: '10px', lineHeight: '1.4' }}>{style.description}</p>
                                        <div style={{ fontSize: '0.8rem', color: '#FFD700', marginBottom: '20px', fontStyle: 'italic' }}>✨ {style.suitability}</div>
                                        <button onClick={() => navigate('/salons')} style={{ width: '100%', padding: '12px', background: '#00f2ea', color: '#0d1117', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase' }}>Book This Style</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default HairTracker;
