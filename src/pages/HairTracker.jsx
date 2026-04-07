import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

// Using Vite env variable naming convention with fallback
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const HairTracker = () => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [warning, setWarning] = useState("");
    const imgRef = useRef(null);

    // Color Palette
    const colors = {
        background: "#0d1117",
        cardBg: "rgba(22, 27, 34, 0.8)",
        accent: "#00f2ea",
        highlights: "#FFD700",
        text: "#ffffff",
        textMuted: "#8b949e",
        border: "rgba(48, 54, 61, 0.8)",
        success: "#22c55e",
        error: "#f85149",
        warning: "#ff9800"
    };

    // Load face-api models with TinyFaceDetector for performance/reliability
    useEffect(() => {
        const loadModels = async () => {
            if (!window.faceapi) return;
            try {
                const modelPath = '/models';
                await Promise.all([
                    window.faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
                    window.faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
                    window.faceapi.nets.ageGenderNet.loadFromUri(modelPath)
                ]);
                console.log("✅ AI Detection Models Ready");
                setModelsLoaded(true);
            } catch (err) {
                console.error("❌ Model Loading Error:", err);
            }
        };
        loadModels();
    }, []);
    
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation: File type and size
        if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
            setError("Please upload a valid image (JPG or PNG).");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("File size must be under 5MB.");
            return;
        }

        setImage(file);
        setResult(null);
        setError("");
        setWarning("");
        const reader = new FileReader();
        reader.onload = (event) => setPreview(event.target.result);
        reader.readAsDataURL(file);
    };

    const detectFace = async () => {
        if (!modelsLoaded || !imgRef.current) {
            console.log("Models not loaded or imgRef missing.");
            return false;
        }
        try {
            // Use TinyFaceDetector with a lowered threshold (0.3) to avoid false negatives
            const options = new window.faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.3 });
            const detection = await window.faceapi.detectSingleFace(imgRef.current, options);
            
            console.log("Face detection result:", detection);
            return !!detection;
        } catch (err) {
            console.error("Detection Error:", err);
            return false;
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;
        setLoading(true);
        setError("");
        setWarning("");
        
        try {
            // Step 1: Run Face Detection
            const faceFound = await detectFace();
            
            if (!faceFound) {
                console.warn("⚠️ Face detection uncertain, continuing analysis...");
                setWarning("Face detection uncertain, continuing analysis...");
            }

            const formData = new FormData();
            formData.append("image", image);
            formData.append("requestId", `req_${Date.now()}`); 
            
            const response = await axios.post(
                `${API_URL}/api/hairtracker/analyze-hair`,
                formData,
                { 
                    headers: { "Content-Type": "multipart/form-data" },
                    timeout: 45000 
                }
            );

            if (response.data.success) {
                setResult(response.data);
            } else {
                setError(response.data.error || "Analysis failed");
            }
        } catch (err) {
            console.error("Analysis Error:", err);
            const msg = err.response?.data?.error || "AI is currently busy. Showing best matching styles for you.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            background: "transparent", minHeight: "100vh", 
            padding: "clamp(100px, 12vh, 140px) 20px 60px 20px",
            color: colors.text, fontFamily: "'Outfit', sans-serif" 
        }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: "50px" }}>
                    <h1 style={{ 
                        color: colors.accent, fontSize: "clamp(2.5rem, 6vw, 4rem)", 
                        fontWeight: "950", margin: 0, textTransform: "uppercase",
                        letterSpacing: "-2px", textShadow: "0 4px 20px rgba(0, 0, 0, 0.4)"
                    }}>AI Hair Tracker</h1>
                    <div style={{ width: "80px", height: "4px", background: colors.highlights, margin: "15px auto", borderRadius: "10px" }}></div>
                </div>

                <div style={{ 
                    background: colors.cardBg, borderRadius: "24px", 
                    padding: "40px", marginBottom: "40px", textAlign: "center",
                    border: `1px solid ${colors.border}`, boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
                }}>
                    {!preview ? (
                        <div style={{ padding: "40px", border: `2px dashed ${colors.border}`, borderRadius: "20px" }}>
                            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} id="upload-input" />
                            <label htmlFor="upload-input" style={{
                                display: "inline-block", padding: "18px 40px",
                                background: colors.accent, color: colors.background, borderRadius: "12px",
                                cursor: "pointer", fontWeight: "800", fontSize: "1.1rem", textTransform: "uppercase"
                            }}>📁 SELECT PORTRAIT</label>
                            <p style={{ color: colors.textMuted, marginTop: "20px" }}>PORTRAIT PHOTO (JPG/PNG, Max 5MB)</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{ position: "relative", marginBottom: "30px" }}>
                                <img ref={imgRef} src={preview} alt="Preview" 
                                    style={{ width: "250px", height: "250px", objectFit: "cover", borderRadius: "20px", border: `4px solid ${colors.accent}` }} />
                                <button onClick={() => {setPreview(null); setImage(null); setResult(null);}}
                                    style={{ position: "absolute", top: "-10px", right: "-10px", background: colors.error, color: "white", borderRadius: "10px", width: "35px", height: "35px", border: "none", cursor: "pointer" }}>✕</button>
                            </div>
                            <button onClick={handleAnalyze} disabled={loading} style={{
                                padding: "20px 60px", background: `linear-gradient(45deg, ${colors.accent}, #00b8b2)`,
                                color: colors.background, borderRadius: "15px", cursor: loading ? "wait" : "pointer",
                                fontWeight: "900", fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "10px", border: "none"
                            }}>
                                {loading && <Loader2 className="animate-spin" size={24} />}
                                {loading ? "ANALYSING FACE..." : "START ANALYSIS"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Status Bar: Face Shape, Hair Type, Hair Density */}
                {result && result.features && (
                    <div style={{ 
                        background: colors.cardBg, padding: "20px", borderRadius: "20px", 
                        border: `1px dotted ${colors.accent}`, marginBottom: "40px",
                        display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "20px"
                    }}>
                        <div style={{ fontSize: "1.1rem" }}>Face Shape: <b style={{ color: colors.accent }}>{result.features.faceShape}</b></div>
                        <div style={{ fontSize: "1.1rem" }}>Hair Type: <b style={{ color: colors.accent }}>{result.features.hairType}</b></div>
                        <div style={{ fontSize: "1.1rem" }}>Hair Density: <b style={{ color: colors.accent }}>{result.features.hairDensity}</b></div>
                    </div>
                )}

                {warning && !error && (
                    <div style={{ 
                        background: "rgba(255, 152, 0, 0.1)", border: `1px solid ${colors.warning}`, 
                        borderRadius: "12px", padding: "15px", color: colors.warning, 
                        textAlign: "center", marginBottom: "30px", fontSize: "0.9rem" 
                    }}>
                        ⚠️ {warning}
                    </div>
                )}

                {error && (
                    <div style={{ background: "rgba(248, 81, 73, 0.1)", border: `1px solid ${colors.error}`, borderRadius: "12px", padding: "20px", color: colors.error, textAlign: "center", marginBottom: "30px" }}>
                        {error}
                    </div>
                )}

                {result && result.hairstyles && result.hairstyles.length > 0 ? (
                    <div>
                        <h2 style={{ fontSize: "2rem", margin: "60px 0 30px", textAlign: "center", color: colors.accent, textTransform: "uppercase" }}>Recommended Hairstyle Grid</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "25px" }}>
                            {result.hairstyles.map((style, idx) => (
                                <div key={idx} style={{ background: colors.cardBg, borderRadius: "24px", overflow: "hidden", border: `1px solid ${colors.border}`, transition: "transform 0.3s ease" }}>
                                    <div style={{ position: "relative", height: "350px" }}>
                                        <img src={style.image} alt={style.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)", padding: "20px" }}>
                                            <h3 style={{ margin: 0, color: colors.accent, fontSize: "1.4rem" }}>{style.name}</h3>
                                        </div>
                                    </div>
                                    <div style={{ padding: "24px" }}>
                                        <p style={{ color: colors.text, fontSize: "0.9rem", margin: "0 0 8px", lineHeight: "1.4" }}>{style.description}</p>
                                        <p style={{ color: colors.textMuted, fontSize: "0.8rem", marginBottom: "20px" }}>{style.suitability}</p>
                                        <button onClick={() => window.location.href = `/salons`} style={{ width: "100%", padding: "14px", background: colors.accent, color: colors.background, border: "none", borderRadius: "12px", fontWeight: "900", cursor: "pointer", textTransform: "uppercase" }}>Book Appointment</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : !loading && result && (
                     <div style={{ textAlign: "center", color: colors.textMuted }}>No hairstyles found. Please try a different photo.</div>
                )}
            </div>
            <style>{`.animate-spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default HairTracker;
