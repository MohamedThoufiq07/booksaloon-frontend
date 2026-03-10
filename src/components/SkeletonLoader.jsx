import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
    const renderSkeleton = () => {
        if (type === 'card') {
            return (
                <div className="skeleton-card">
                    <div className="skeleton-img"></div>
                    <div className="skeleton-info">
                        <div className="skeleton-text title"></div>
                        <div className="skeleton-text sub"></div>
                        <div className="skeleton-flex">
                            <div className="skeleton-text small"></div>
                            <div className="skeleton-btn"></div>
                        </div>
                    </div>
                </div>
            );
        }
        if (type === 'list') {
            return (
                <div className="skeleton-list-item">
                    <div className="skeleton-circle"></div>
                    <div className="skeleton-list-content">
                        <div className="skeleton-text title"></div>
                        <div className="skeleton-text sub"></div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className={`skeleton-container ${type}-grid`}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="skeleton-wrapper">
                    {renderSkeleton()}
                </div>
            ))}
        </div>
    );
};

export default SkeletonLoader;
