import React, { useState } from "react";
import axios from "axios";

// Using Vite env variable naming convention with fallback
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const HairTracker = () => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setResult(null);
            setError("");
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;
        setLoading(true);
        setError("");
        setResult(null);

        try {
            const formData = new FormData();
            formData.append("image", image);

            const response = await axios.post(
                `${API_URL}/api/hairtracker/analyze-hair`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" }, timeout: 120000 }
            );

            if (response.data.success) {
                setResult(response.data);
            } else {
                setError(response.data.error || "Analysis failed");
            }
        } catch (err) {
            setError(err.response?.data?.error || "Connection error. Please ensure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const badgeColor = (level) => {
        if (level === "Low") return "#00f2ea"; // Primary Teal
        if (level === "Medium") return "#FF9800"; // Warm Orange
        return "#f44336"; // Red
    };

    // UI Theme - Matching your website's search button and dark theme
    const colors = {
        background: "#0d1117", // GitHub Dark / Your Website Dark
        cardBg: "rgba(22, 27, 34, 0.8)", // Semi-transparent dark
        accent: "#00f2ea", // YOUR SEARCH BUTTON TEAL
        highlights: "#FFD700", // Gold highlights
        text: "#ffffff",
        textMuted: "#8b949e",
        border: "rgba(48, 54, 61, 0.8)"
    };

    return (
        <div style={{ 
            background: colors.background, 
            minHeight: "100vh", 
            padding: "100px 20px 60px 20px", // Pushed down to clear Navbar
            color: colors.text, 
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif" 
        }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

                {/* Main Header */}
                <div style={{ textAlign: "center", marginBottom: "50px" }}>
                    <h1 style={{ 
                        color: colors.accent, 
                        fontSize: "clamp(2.5rem, 6vw, 4rem)", 
                        fontWeight: "800", 
                        margin: 0,
                        textTransform: "uppercase",
                        letterSpacing: "-1px"
                    }}>
                        AI Hair Tracker
                    </h1>
                    <div style={{ 
                        width: "80px", 
                        height: "4px", 
                        background: colors.highlights, 
                        margin: "15px auto", 
                        borderRadius: "10px" 
                    }}></div>
                    <p style={{ color: colors.textMuted, fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto" }}>
                        Precision AI analysis for your unique features
                    </p>
                </div>

                {/* Tool Selection Section */}
                <div style={{ 
                    background: colors.cardBg, 
                    borderRadius: "24px", 
                    padding: "40px", 
                    marginBottom: "40px", 
                    textAlign: "center",
                    border: `1px solid ${colors.border}`,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
                }}>
                    {!preview ? (
                        <div style={{ padding: "40px", border: `2px dashed ${colors.border}`, borderRadius: "20px" }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: "none" }}
                                id="upload-input"
                            />
                            <label htmlFor="upload-input" style={{
                                display: "inline-block", padding: "18px 40px",
                                background: colors.accent, color: colors.background, borderRadius: "12px",
                                cursor: "pointer", fontWeight: "800", fontSize: "1.1rem",
                                transition: "all 0.3s ease",
                                textTransform: "uppercase"
                            }}>
                                📁 SELECT PORTRAIT
                            </label>
                            <p style={{ color: colors.textMuted, marginTop: "20px" }}>PNG, JPG or JPEG (Max 5MB)</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{ position: "relative", marginBottom: "30px" }}>
                                <img src={preview} alt="Preview"
                                    style={{ 
                                        width: "250px", 
                                        height: "250px", 
                                        objectFit: "cover", 
                                        borderRadius: "20px", 
                                        border: `4px solid ${colors.accent}`,
                                        boxShadow: `0 0 25px ${colors.accent}44`
                                    }}
                                />
                                <button 
                                    onClick={() => {setPreview(null); setImage(null); setResult(null);}}
                                    style={{ 
                                        position: "absolute", top: "-10px", right: "-10px", 
                                        background: "#f44336", color: "white", border: "none", 
                                        borderRadius: "10px", width: "35px", height: "35px", cursor: "pointer" 
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <button onClick={handleAnalyze} disabled={loading}
                                style={{
                                    padding: "20px 60px",
                                    background: loading ? "#222" : `linear-gradient(45deg, ${colors.accent}, #00b8b2)`,
                                    color: colors.background, border: "none", borderRadius: "15px",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    fontWeight: "900", fontSize: "1.3rem",
                                    boxShadow: loading ? "none" : `0 6px 20px ${colors.accent}66`,
                                    transition: "all 0.3s"
                                }}>
                                {loading ? "⏳ ANALYZING..." : "⚡ START ANALYSIS"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div style={{ textAlign: "center", padding: "60px" }}>
                        <div className="custom-loader"></div>
                        <h3 style={{ color: colors.accent, marginTop: "25px", fontSize: "1.5rem" }}>Generating Style Report</h3>
                        <p style={{ color: colors.textMuted }}>Processing face biometrics and 9 custom renders...</p>
                    </div>
                )}

                {/* Error Box */}
                {error && (
                    <div style={{ background: "#3d1b1b", border: `1px solid #f85149`, borderRadius: "12px", padding: "20px", color: "#f85149", textAlign: "center", marginBottom: "30px" }}>
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {/* RESULTS */}
                {result && (
                    <div className="results-animate">
                        
                        {/* 1. Profile Summary */}
                        <div style={{ 
                            background: colors.cardBg, borderRadius: "24px", padding: "40px", marginBottom: "40px", 
                            border: `1px solid ${colors.border}` 
                        }}>
                             <h3 style={{ color: colors.highlights, fontSize: "1.8rem", marginBottom: "30px", borderLeft: `5px solid ${colors.accent}`, paddingLeft: "20px" }}>
                                BIOMETRIC PROFILE
                             </h3>
                             <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "25px" }}>
                                {[
                                    { label: "GENDER", val: result.features.gender, icon: "👤" },
                                    { label: "FACE SHAPE", val: result.features.faceShape, icon: "📐" },
                                    { label: "TEXTURE", val: result.features.hairTexture, icon: "🧪" },
                                    { label: "DENSITY", val: result.features.hairDensity, icon: "📊" },
                                ].map((item, i) => (
                                    <div key={i} style={{ 
                                        padding: "25px", background: "rgba(0,0,0,0.2)", borderRadius: "16px", 
                                        border: "1px solid rgba(255,255,255,0.05)" 
                                    }}>
                                        <div style={{ fontSize: "1.5rem", marginBottom: "10px" }}>{item.icon}</div>
                                        <div style={{ color: colors.textMuted, fontSize: "0.8rem", fontWeight: "bold" }}>{item.label}</div>
                                        <div style={{ color: colors.accent, fontSize: "1.3rem", fontWeight: "800" }}>{item.val}</div>
                                    </div>
                                ))}
                             </div>
                             <p style={{ marginTop: "30px", padding: "20px", background: "rgba(255,235,59,0.05)", borderRadius: "12px", color: colors.highlights, fontStyle: "italic", border: `1px solid ${colors.highlights}22` }}>
                                " {result.features.reason} "
                             </p>
                        </div>

                        {/* 2. Gallery Grid */}
                        <h2 style={{ fontSize: "2rem", margin: "60px 0 30px", textAlign: "center", color: colors.accent }}>RECOMMENDED STYLES</h2>
                        {result.hairstyles && result.hairstyles.length > 0 ? (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px", marginBottom: "60px" }}>
                                {result.hairstyles.map((style, idx) => (
                                    <div key={idx} style={{ 
                                        background: colors.cardBg, borderRadius: "24px", overflow: "hidden", border: `1px solid ${colors.border}`, transition: "transform 0.3s"
                                    }} className="style-card">
                                        <div style={{ position: "relative", height: "300px" }}>
                                            <img src={style.imageBase64} alt={style.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            <div style={{ 
                                                position: "absolute", bottom: 0, left: 0, right: 0, 
                                                background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)", 
                                                padding: "30px 20px 20px" 
                                            }}>
                                                <h3 style={{ margin: 0, color: colors.accent, fontSize: "1.5rem" }}>{style.name}</h3>
                                            </div>
                                        </div>
                                        <div style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontSize: "0.9rem", color: colors.textMuted }}>🎯 {style.occasion}</span>
                                            <span style={{ 
                                                background: badgeColor(style.maintenanceLevel) + "22", 
                                                color: badgeColor(style.maintenanceLevel), 
                                                padding: "6px 14px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: "800", border: `1px solid ${badgeColor(style.maintenanceLevel)}44`
                                            }}>
                                                {style.maintenanceLevel.toUpperCase()} MAINT
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ 
                                textAlign: "center", padding: "40px", background: "rgba(255,255,255,0.05)", 
                                borderRadius: "20px", marginBottom: "60px", border: "1px dashed rgba(255,255,255,0.1)" 
                            }}>
                                <p style={{ color: colors.textMuted, margin: 0 }}>
                                    ⚠️ AI Image Generation is currently under high load. <br/>
                                    Please try again in a moment to see your style visualizations.
                                </p>
                            </div>
                        )}

                        {/* 3. Care Plan */}
                        <div style={{ background: colors.cardBg, borderRadius: "24px", padding: "40px", border: `1px solid ${colors.border}` }}>
                             <h3 style={{ color: colors.accent, fontSize: "1.8rem", textAlign: "center", marginBottom: "40px" }}>PERSONALIZED CARE PLAN</h3>
                             <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "40px" }}>
                                 {[
                                     { title: "Salon Services", items: result.hairCare.salonServices, accent: "#00f2ea" },
                                     { title: "Home Rituals", items: result.hairCare.homeCareTips, accent: "#FF9800" },
                                     { title: "Products", items: result.hairCare.recommendedProducts, accent: "#4CAF50" },
                                     { title: "Avoid", items: result.hairCare.avoidTips, accent: "#f44336" },
                                 ].map((sec, i) => (
                                     <div key={i}>
                                         <h5 style={{ color: sec.accent, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "20px" }}>{sec.title}</h5>
                                         <ul style={{ listStyle: "none", padding: 0 }}>
                                             {sec.items.map((it, j) => (
                                                 <li key={j} style={{ color: colors.textMuted, marginBottom: "12px", fontSize: "0.95rem" }}>• {it}</li>
                                             ))}
                                         </ul>
                                     </div>
                                 ))}
                             </div>
                             <div style={{ marginTop: "50px", textAlign: "center", padding: "30px", background: `linear-gradient(to right, transparent, ${colors.accent}11, transparent)`, borderRadius: "20px" }}>
                                <p style={{ color: colors.accent, fontSize: "1.4rem", fontWeight: "700", margin: 0 }}>" {result.hairCare.overallMessage} "</p>
                             </div>
                        </div>
                    </div>
                )}
            </div>

            <style>
                {`
                .custom-loader {
                    width: 60px;
                    height: 60px;
                    border: 4px solid ${colors.border};
                    border-top-color: ${colors.accent};
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                .results-animate { animation: fadeInUp 0.8s ease-out; }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                `}
            </style>
        </div>
    );
};

export default HairTracker;
