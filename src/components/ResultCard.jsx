import React from 'react';
import {
    CheckCircle, AlertTriangle, Info,
    Sparkles, ShieldCheck, ShoppingBag
} from 'lucide-react';

const ResultCard = ({ result }) => {
    if (!result) return null;

    const {
        faceShape,
        hairDensity,
        hairTexture,
        transformedImageURL,
        fallbackImages,
        fallbackSearchUsed
    } = result;

    return (
        <div className="result-card-container fade-in relative">
            {/* Analysis Data Points - TOP RIGHT REQUIREMENT */}
            <div className="absolute top-0 right-0 text-right p-4 analysis-floating-stats">
                <div className="space-y-1 font-bold text-sm tracking-tight">
                    <p className="text-white">Face Shape: <span className="text-primary-glow">{faceShape}</span></p>
                    <p className="text-white">Hair Density: <span className="text-primary-glow">{hairDensity}</span></p>
                    <p className="text-white">Hair Texture: <span className="text-primary-glow">{hairTexture}</span></p>
                </div>
            </div>

            <div className="pt-16">
                {/* Mode 1: Gemini 3x3 Grid */}
                {!fallbackSearchUsed && transformedImageURL && (
                    <div className="ai-grid-display-section">
                        <h4 className="section-subtitle mb-4 flex items-center gap-2">
                            <Sparkles size={18} className="text-primary-glow" />
                            Premium Hairstyle Grid (Gemini AI)
                        </h4>
                        <div className="grid-image-wrapper">
                            <img
                                src={transformedImageURL}
                                alt="AI Generated Grid"
                                className="hairstyle-grid-img"
                            />
                            <div className="grid-badge">STRICT IDENTITY LOCK</div>
                        </div>
                    </div>
                )}

                {/* Mode 2: Web Search Fallback Grid */}
                {fallbackSearchUsed && fallbackImages && fallbackImages.length > 0 && (
                    <div className="fallback-gallery-section">
                        <h4 className="section-subtitle mb-4 flex items-center gap-2 text-amber-400">
                            <AlertTriangle size={18} />
                            Web Recommendation Fallback
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {fallbackImages.map((item, idx) => (
                                <div key={idx} className="search-result-item group">
                                    <img
                                        src={item.url || item}
                                        alt={item.name || `Hairstyle ${idx + 1}`}
                                        className="search-img-fallback"
                                    />
                                    <div className="search-img-overlay">
                                        {item.name || `Ref #${idx + 1}`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultCard;
