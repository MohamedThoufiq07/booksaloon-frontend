import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Upload, Camera, X, Sparkles, RotateCcw, Scissors,
    ChevronRight, AlertTriangle, CheckCircle, Loader2,
    ImagePlus, Zap, Diamond, Heart, Circle, Square, Hexagon
} from 'lucide-react';
import axios from 'axios';
import './HairStyleAI.css';

const API_BASE = 'http://127.0.0.1:5000/api/hairstyle';

const faceShapeIcons = {
    Oval: <Hexagon size={22} />,
    Round: <Circle size={22} />,
    Square: <Square size={22} />,
    Heart: <Heart size={22} />,
    Diamond: <Diamond size={22} />
};

const faceShapeDescriptions = {
    Oval: "Balanced proportions with a gently rounded jawline — the most versatile face shape.",
    Round: "Equal width and length with soft, curved edges and full cheeks.",
    Square: "Strong, angular jawline with a wide forehead — bold and defined features.",
    Heart: "Wider forehead narrowing to a pointed chin — elegant and striking.",
    Diamond: "Narrow forehead and chin with prominent cheekbones — rare and distinctive."
};

const HairStyleAI = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [image, setImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [analysisStep, setAnalysisStep] = useState('');

    // Handle file selection
    const handleFileSelect = useCallback((file) => {
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Please upload a JPEG, PNG, or WebP image.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('Image size must be under 10MB.');
            return;
        }

        setError(null);
        setResult(null);
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setImage(e.target.result);
        reader.readAsDataURL(file);
    }, []);

    // Drag & Drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    const handleInputChange = (e) => {
        handleFileSelect(e.target.files[0]);
    };

    // Camera functions
    const openCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 640, height: 480 }
            });
            setCameraStream(stream);
            setIsCameraOpen(true);
            setError(null);
            setResult(null);

            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (err) {
            setError('Camera access denied. Please allow camera permissions and try again.');
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            setImageFile(file);
            setImage(canvas.toDataURL('image/jpeg'));
            closeCamera();
        }, 'image/jpeg', 0.9);
    };

    const closeCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setIsCameraOpen(false);
    };

    // Analyze face
    const analyzeFace = async () => {
        if (!imageFile) {
            setError('Please upload or capture a photo first.');
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setResult(null);

        const steps = [
            'Detecting face...',
            'Mapping facial landmarks...',
            'Calculating facial ratios...',
            'Classifying face shape...',
            'Finding best hairstyles...'
        ];

        // Simulate progressive steps
        for (let i = 0; i < steps.length; i++) {
            setAnalysisStep(steps[i]);
            await new Promise(r => setTimeout(r, 600));
        }

        try {
            const formData = new FormData();
            formData.append('faceImage', imageFile);

            const response = await axios.post(`${API_BASE}/analyze`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 120000
            });

            if (response.data.success) {
                setResult(response.data);
            } else {
                setError(response.data.message || 'Analysis failed. Please try again.');
            }
        } catch (err) {
            if (err.response?.data?.error === 'NO_FACE_DETECTED') {
                setError('No face detected in the image. Please upload a clear front-facing photo.');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.code === 'ECONNABORTED') {
                setError('Analysis timed out. Please try again with a smaller image.');
            } else {
                setError('Could not connect to the analysis server. Please ensure the backend is running.');
            }
        } finally {
            setIsAnalyzing(false);
            setAnalysisStep('');
        }
    };

    // Reset
    const resetAnalysis = () => {
        setImage(null);
        setImageFile(null);
        setResult(null);
        setError(null);
        closeCamera();
    };

    // Book this style
    const handleBookStyle = (styleName) => {
        navigate(`/salons?style=${encodeURIComponent(styleName)}`);
    };

    return (
        <div className="hairstyle-ai-page">
            {/* Hero Section */}
            <section className="hsai-hero">
                <motion.div
                    className="hsai-hero-content"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="hsai-badge">
                        <Sparkles size={16} />
                        <span>AI-Powered Analysis</span>
                    </div>
                    <h1>
                        Find Your Perfect <span className="hsai-highlight">Hairstyle</span>
                    </h1>
                    <p className="hsai-subtitle">
                        Upload a photo or use your camera — our AI detects your face shape
                        and recommends hairstyles that suit you best.
                    </p>
                </motion.div>

                {/* Animated background orbs */}
                <div className="hsai-orb hsai-orb-1"></div>
                <div className="hsai-orb hsai-orb-2"></div>
                <div className="hsai-orb hsai-orb-3"></div>
            </section>

            {/* Upload Section */}
            <section className="hsai-upload-section">
                <motion.div
                    className="hsai-upload-wrapper"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    {!image && !isCameraOpen && (
                        <div
                            className={`hsai-dropzone ${isDragging ? 'hsai-dropzone-active' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleInputChange}
                                className="hsai-file-input"
                            />
                            <motion.div
                                className="hsai-dropzone-content"
                                animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
                            >
                                <div className="hsai-upload-icon-wrap">
                                    <ImagePlus size={48} />
                                </div>
                                <h3>Drop your photo here</h3>
                                <p>or click to browse files</p>
                                <span className="hsai-upload-hint">
                                    JPEG, PNG, WebP · Max 10MB · Front-facing photo recommended
                                </span>
                            </motion.div>
                        </div>
                    )}

                    {/* Camera View */}
                    <AnimatePresence>
                        {isCameraOpen && (
                            <motion.div
                                className="hsai-camera-view"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="hsai-camera-feed"
                                />
                                <canvas ref={canvasRef} style={{ display: 'none' }} />
                                <div className="hsai-camera-overlay">
                                    <div className="hsai-face-guide"></div>
                                </div>
                                <div className="hsai-camera-controls">
                                    <button className="hsai-capture-btn" onClick={capturePhoto}>
                                        <div className="hsai-capture-ring">
                                            <Camera size={24} />
                                        </div>
                                    </button>
                                    <button className="hsai-close-camera" onClick={closeCamera}>
                                        <X size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Image Preview */}
                    <AnimatePresence>
                        {image && (
                            <motion.div
                                className="hsai-preview-container"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <div className="hsai-preview-image-wrap">
                                    <img src={image} alt="Preview" className="hsai-preview-image" />
                                    {result && (
                                        <div className="hsai-face-badge">
                                            <CheckCircle size={16} />
                                            <span>Face Detected</span>
                                        </div>
                                    )}
                                </div>
                                <button className="hsai-remove-image" onClick={resetAnalysis}>
                                    <X size={18} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Action Buttons */}
                    {!isCameraOpen && (
                        <div className="hsai-action-row">
                            {!image && (
                                <button className="hsai-camera-btn" onClick={openCamera}>
                                    <Camera size={20} />
                                    <span>Use Camera</span>
                                </button>
                            )}
                            {image && !isAnalyzing && (
                                <>
                                    <button className="hsai-analyze-btn" onClick={analyzeFace}>
                                        <Zap size={20} />
                                        <span>Analyze Face</span>
                                    </button>
                                    <button className="hsai-reset-btn" onClick={resetAnalysis}>
                                        <RotateCcw size={18} />
                                        <span>Reset</span>
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </motion.div>
            </section>

            {/* Loading Animation */}
            <AnimatePresence>
                {isAnalyzing && (
                    <motion.section
                        className="hsai-loading-section"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="hsai-loading-card">
                            <div className="hsai-loader-ring">
                                <Loader2 size={40} className="hsai-spinner" />
                            </div>
                            <h3>Analyzing Your Face</h3>
                            <motion.p
                                key={analysisStep}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="hsai-analysis-step"
                            >
                                {analysisStep}
                            </motion.p>
                            <div className="hsai-progress-bar">
                                <motion.div
                                    className="hsai-progress-fill"
                                    initial={{ width: '0%' }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 3.5, ease: 'easeInOut' }}
                                />
                            </div>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Error Section */}
            <AnimatePresence>
                {error && (
                    <motion.section
                        className="hsai-error-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="hsai-error-card">
                            <AlertTriangle size={32} />
                            <div>
                                <h4>Analysis Error</h4>
                                <p>{error}</p>
                            </div>
                            <button onClick={() => setError(null)}>
                                <X size={18} />
                            </button>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Results Section */}
            <AnimatePresence>
                {result && (
                    <motion.section
                        className="hsai-results-section"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Analysis Card */}
                        <div className="hsai-analysis-header-new">
                            <Sparkles size={28} className="text-primary-glow" />
                            <h2>AI Style Analysis Result</h2>
                        </div>

                        <div className="hsai-stats-grid-new">
                            <div className="hsai-stat-card-new">
                                <span className="hsai-stat-label-new">Face Shape</span>
                                <div className="hsai-stat-value-new">{result.faceShape}</div>
                                <span className="hsai-stat-badge-new">{result.confidence}% Match</span>
                            </div>
                            <div className="hsai-stat-card-new">
                                <span className="hsai-stat-label-new">Hair Density</span>
                                <div className="hsai-stat-value-new">{result.hairDensity || 'Medium'}</div>
                            </div>
                            <div className="hsai-stat-card-new">
                                <span className="hsai-stat-label-new">Hair Texture</span>
                                <div className="hsai-stat-value-new">{result.hairTexture || 'Analyzed'}</div>
                            </div>
                        </div>

                        {/* Hairstyle Grid Result (Gemini or Fallback) */}
                        {!result.fallbackSearchUsed && result.transformedImageURL && (
                            <div className="hsai-grid-result-wrapper mt-12">
                                <h3 className="hsai-grid-title">Recommended Hairstyle Grid (3×3)</h3>
                                <div className="hsai-main-grid-container">
                                    <img
                                        src={result.transformedImageURL}
                                        alt="AI Hairstyle Grid"
                                        className="hsai-grid-image-main"
                                    />
                                    <div className="hsai-grid-overlay-tag">STRICT IDENTITY LOCK</div>
                                </div>
                            </div>
                        )}

                        {result.fallbackSearchUsed && result.fallbackImages && (
                            <div className="hsai-grid-result-wrapper mt-12">
                                <h3 className="hsai-grid-title flex items-center justify-center gap-2 text-amber-400">
                                    <AlertTriangle size={20} />
                                    Web Recommendation Fallback
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6">
                                    {result.fallbackImages.map((item, idx) => (
                                        <div key={idx} className="search-result-item group relative overflow-hidden rounded-2xl border border-white/10 hover:border-primary-glow">
                                            <img
                                                src={item.url}
                                                alt={item.name}
                                                className="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                                                <span className="text-sm font-bold text-white text-center">{item.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Try Again Button */}
                        <div className="hsai-try-again mt-12">
                            <button className="hsai-retry-btn" onClick={resetAnalysis}>
                                <RotateCcw size={18} />
                                <span>Analyze Another Photo</span>
                            </button>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HairStyleAI;
