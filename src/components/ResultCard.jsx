import React from 'react';
import {
    Sparkles, AlertCircle
} from 'lucide-react';

const ResultCard = ({ result }) => {
    if (!result) return null;

    const {
        faceShape,
        hairDensity,
        hairTexture,
        transformedImageURL
    } = result;

    return (
        <div className="result-card-container fade-in relative">
            {/* Analysis Data Points */}
            <div className="analysis-floating-stats">
                <div className="space-y-1 font-bold text-sm tracking-tight">
                    <p className="text-white">Face Shape: <span className="text-primary-glow">{faceShape}</span></p>
                    <p className="text-white">Hair Density: <span className="text-primary-glow">{hairDensity}</span></p>
                    <p className="text-white">Hair Texture: <span className="text-primary-glow">{hairTexture}</span></p>
                </div>
            </div>

            <div className="pt-16">
                {/* AI Generated 3x3 Grid Image — User's Own Face */}
                {transformedImageURL ? (
                    <div className="ai-transformation-box">
                        <div className="transformation-header">
                            <Sparkles size={24} className="text-primary-glow" />
                            <h3>AI Style Grid (Your Face)</h3>
                            <span className="badge-new">9 Styles</span>
                        </div>
                        
                        <div className="grid-image-wrapper">
                            <img
                                src={transformedImageURL}
                                alt="AI Hairstyle Grid"
                                className="hairstyle-grid-img"
                            />
                            <div className="grid-badge">GENUINE FACE LOCK</div>
                        </div>

                        <div className="stat-explanation mt-4">
                            <p>Gemini AI has processed your face structure and applied 9 unique hairstyles while preserving your identity.</p>
                        </div>
                    </div>
                ) : (
                    <div className="empty-results animate-pulse">
                        <AlertCircle size={64} className="text-amber-500 mb-4" />
                        <h2 className="text-xl font-bold">No Image Generated</h2>
                        <p className="text-slate-400">The AI could not generate the hairstyle grid. Please try again with a clearer photo.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultCard;
