import React, { useState, useRef } from 'react';
import {
    Upload, Search, History, Sparkles,
    Trash2, AlertCircle, Camera, Loader2
} from 'lucide-react';
import { analyzeFaceAndHair } from '../services/aiService';
import ResultCard from './ResultCard';

const AIHairTracker = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("File size too large. Max 5MB allowed.");
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedFile) return;

        setIsAnalyzing(true);
        setError(null);

        try {
            const data = await analyzeFaceAndHair(selectedFile);
            if (data.success) {
                const finalResult = {
                    ...data.report,
                    treatmentSuggestions: data.treatmentSuggestions,
                    productRecommendations: data.productRecommendations
                };
                setResult(finalResult);
            } else {
                setError(data.message || "Analysis failed.");
            }
        } catch (err) {
            setError(err.message || "An error occurred during analysis.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resetTracker = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setResult(null);
        setError(null);
    };

    return (
        <div className="ai-glass-card">
            <div className="ai-left-panel">
                <div className="tool-header">
                    <h1>AI Pro <span className="highlight">Analyzer</span></h1>
                    <p>Advanced Face Landmark & Hair Health Detection</p>
                </div>

                {!previewUrl ? (
                    <div
                        className="upload-box"
                        onClick={() => fileInputRef.current.click()}
                    >
                        <Upload size={48} className="text-secondary" />
                        <div className="text-center">
                            <p className="font-semibold">Drop your photo here</p>
                            <p className="text-sm text-muted">Supports JPG, PNG, WebP (Max 5MB)</p>
                        </div>
                        <button className="text-sm text-primary underline">Browse Files</button>
                    </div>
                ) : (
                    <div className="preview-container">
                        <img src={previewUrl} alt="Preview" className="preview-img" />
                        {isAnalyzing && <div className="scanning-overlay" />}
                        <button
                            className="absolute top-4 right-4 p-2 bg-red-500/80 rounded-full hover:bg-red-500 transition-colors"
                            onClick={resetTracker}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />

                {error && (
                    <div className="error-msg">
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                <button
                    className="analyze-btn"
                    onClick={handleAnalyze}
                    disabled={!selectedFile || isAnalyzing}
                >
                    {isAnalyzing ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Analyzing structure...
                        </>
                    ) : (
                        <>
                            <Search size={20} />
                            Start Full Analysis
                        </>
                    )}
                </button>

                <div className="tips-card mt-6 p-4 bg-white/5 rounded-xl">
                    <h3 className="flex items-center gap-2 text-sm font-semibold mb-2">
                        <Sparkles size={14} className="text-primary-glow" /> Analysis Tips
                    </h3>
                    <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                        <li>Ensure good lighting on your face</li>
                        <li>Look directly at the camera</li>
                        <li>Keep hair pulled back for best results</li>
                    </ul>
                </div>
            </div>

            <div className="ai-right-panel">
                {result ? (
                    <ResultCard result={result} />
                ) : isAnalyzing ? (
                    <div className="empty-results animate-pulse">
                        <Loader2 size={64} className="text-primary-glow animate-spin" />
                        <h2 className="text-xl font-bold mt-4">Processing Landmarks...</h2>
                        <p className="text-slate-400">Calculating facial symmetry and hair density</p>
                    </div>
                ) : (
                    <div className="empty-results py-20">
                        <Camera size={64} className="text-slate-700 mb-4" />
                        <h2 className="text-xl font-bold">Ready for Analysis</h2>
                        <p className="text-slate-400 max-w-xs">Upload a clear photo to reveal your face shape and health report.</p>
                        {/* Removed default face shape badges to keep section empty as requested */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIHairTracker;
