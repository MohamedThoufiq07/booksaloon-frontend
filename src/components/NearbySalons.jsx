import { useEffect, useState } from "react";
import {
    MapContainer, TileLayer, Marker,
    Popup, Circle, useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../utils/api";
import "./NearbySalons.css";
import { Star, MapPin, Navigation, Info } from 'lucide-react';

// Fix leaflet icon bug
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Gold marker for salons
const salonIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

// Blue marker for user
const userIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

// Auto center map
const MapCenter = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) map.setView(position, 13);
    }, [position, map]);
    return null;
};

// Haversine distance calculator
const calcDistance = (userPos, coords) => {
    if (!userPos || !coords) return null;
    const R = 6371;
    const dLat = (coords[1] - userPos[0]) * Math.PI / 180;
    const dLon = (coords[0] - userPos[1]) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(userPos[0] * Math.PI / 180) *
        Math.cos(coords[1] * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
};

const NearbySalons = () => {
    const [userLocation, setUserLocation] = useState(null);
    const [salons, setSalons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [status, setStatus] = useState("idle");
    const [selectedSalon, setSelectedSalon] = useState(null);

    useEffect(() => {
        if (window.location.hash === "#nearby-salons") {
            const el = document.getElementById("nearby-salons");
            if (el) {
                setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 300);
            }
        }
    }, []);

    const detectLocation = () => {
        setLoading(true);
        setError("");
        setStatus("detecting");

        if (!navigator.geolocation) {
            setError("Geolocation not supported by your browser.");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async ({ coords: { latitude, longitude } }) => {
                setUserLocation([latitude, longitude]);
                setStatus("found");
                try {
                    const res = await api.get('/salons/nearby', {
                        params: { lat: latitude, lng: longitude, radius: 10000 }
                    });
                    const repairedSalons = (res.data.salons || []).map(salon => {
                        if (salon.location && salon.location.coordinates[0] === 0 && salon.location.coordinates[1] === 0) {
                            return {
                                ...salon,
                                location: { ...salon.location, coordinates: [77.7567, 8.7139] }
                            };
                        }
                        return salon;
                    });
                    setSalons(repairedSalons);
                } catch {
                    setError("Failed to fetch nearby salons. Please try again.");
                } finally {
                    setLoading(false);
                }
            },
            () => {
                setError("Location access denied. Please allow location and try again.");
                setStatus("denied");
                setLoading(false);
            }
        );
    };

    return (
        <div className="nearby-salons-wrapper" id="nearby-salons">
            <div className="nearby-salons-inner">

                <div className="nearby-header">
                    <h2 className="nearby-title">📍 Nearby Salons</h2>
                    <p className="nearby-subtitle">Discover premium grooming spots just around the corner</p>
                </div>

                {/* Status-based buttons */}
                {(status === "idle" || status === "denied") && (
                    <button className="detect-btn pulse-glow" onClick={detectLocation}>
                        {status === "idle" ? <Navigation size={20} /> : "🔄"} 
                        {status === "idle" ? "Detect My Location" : "Try Again"}
                    </button>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-10">
                        <div className="spin" style={{ fontSize: "2rem", marginBottom: "12px" }}>⏳</div>
                        <p className="text-primary-glow">
                            {status === "detecting" ? "Locating you..." : "Searching for nearby salons..."}
                        </p>
                    </div>
                )}

                {/* Error Box */}
                {error && (
                    <div className="glass-effect" style={{ padding: '24px', borderRadius: '16px', textAlign: 'center', border: '1px solid #f43f5e', marginBottom: '24px' }}>
                        <p style={{ color: '#f43f5e', fontWeight: '700' }}>❌ {error}</p>
                        <button className="detect-btn mt-4" onClick={detectLocation}>Retry Detection</button>
                    </div>
                )}

                {/* Interactive Map */}
                {userLocation && (
                    <div className="map-outer-wrapper">
                        <MapContainer
                            center={userLocation}
                            zoom={13}
                            style={{ height: "100%", width: "100%", zIndex: 1 }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; OpenStreetMap contributors'
                            />
                            <MapCenter position={userLocation} />

                            <Marker position={userLocation} icon={userIcon}>
                                <Popup><strong>📍 Your Location</strong></Popup>
                            </Marker>

                            <Circle
                                center={userLocation}
                                radius={5000}
                                pathOptions={{ color: "var(--primary)", fillColor: "var(--primary)", fillOpacity: 0.05, dashArray: "5, 10" }}
                            />

                            {salons.map((salon, i) =>
                                salon.location?.coordinates && (
                                    <Marker
                                        key={i}
                                        position={[salon.location.coordinates[1], salon.location.coordinates[0]]}
                                        icon={salonIcon}
                                        eventHandlers={{ click: () => setSelectedSalon(salon) }}
                                    >
                                        <Popup>
                                            <div style={{ minWidth: "160px", padding: '5px' }}>
                                                <strong style={{ display: 'block', marginBottom: '4px' }}>✂️ {salon.name}</strong>
                                                <span style={{ color: "var(--secondary)", fontSize: "12px", display: 'block', marginBottom: '4px' }}>📍 {salon.address}</span>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ color: "#fbbf24", fontSize: "12px", fontWeight: 'bold' }}>⭐ {salon.rating || "N/A"}</span>
                                                    <span style={{ color: "var(--primary)", fontSize: "12px", fontWeight: "bold" }}>
                                                        {calcDistance(userLocation, salon.location.coordinates)} km
                                                    </span>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )
                            )}
                        </MapContainer>
                    </div>
                )}

                {/* Salon Results Grid */}
                {salons.length > 0 && (
                    <div className="results-container">
                        <p className="found-label" style={{ color: 'var(--primary)', fontWeight: '850', marginBottom: '20px', fontSize: '1.1rem' }}>
                            <Star size={18} /> {salons.length} Premium Salons Discovered Near You
                        </p>
                        <div className="nearby-grid">
                            {salons.map((salon, i) => (
                                <div
                                    key={i}
                                    className={`nearby-card ${selectedSalon?._id === salon._id ? 'active' : ''}`}
                                    onClick={() => setSelectedSalon(salon)}
                                >
                                    <img 
                                        src={salon.img || salon.image || "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=400&q=60"} 
                                        alt={salon.name} 
                                        className="nearby-card-img" 
                                    />
                                    <div className="nearby-card-body">
                                        <div className="nearby-card-top">
                                            <span className="nearby-card-name">{salon.name}</span>
                                            {salon.isApproved && <span className="verified-badge" style={{ background: 'var(--primary)', color: '#000', padding: '2px 8px', borderRadius: '50px', fontSize: '0.65rem', fontWeight: '900' }}>✓ VERIFIED</span>}
                                        </div>
                                        <div className="nearby-card-addr"><MapPin size={12} /> {salon.address}</div>
                                        <div className="nearby-card-footer">
                                            <span className="nearby-rating"><Star size={12} fill="#fbbf24" /> {salon.rating || "4.5"}</span>
                                            <span className="nearby-dist">📏 {calcDistance(userLocation, salon.location?.coordinates)} km</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {userLocation && !loading && salons.length === 0 && (
                    <div className="text-center py-20 glass-effect" style={{ borderRadius: '24px' }}>
                         <Info size={48} style={{ color: 'rgba(255,255,255,0.1)', marginBottom: '16px' }} />
                        <h3 style={{ color: '#fff' }}>No salons found in your immediate area.</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Try expanding your search or checking another location.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NearbySalons;
