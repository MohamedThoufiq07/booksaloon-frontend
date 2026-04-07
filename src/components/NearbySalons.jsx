import { useEffect, useState } from "react";
import {
    MapContainer, TileLayer, Marker,
    Popup, Circle, useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../utils/api";

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

    const styles = {
        wrapper: { padding: "40px 24px", fontFamily: "inherit", width: "100%", position: "relative" },
        inner: { 
            maxWidth: "1100px", 
            margin: "0 auto",
            background: "rgba(15, 23, 42, 0.3)", // Much brighter/transparent
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRadius: "24px",
            padding: "40px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)"
        },
        header: { textAlign: "center", marginBottom: "28px" },
        title: { color: "var(--primary)", fontSize: "2.4rem", marginBottom: "8px", fontWeight: "900", letterSpacing: "-1px" },
        subtitle: { color: "var(--text-muted)", fontSize: "1rem" },
        detectBtn: {
            display: "block", margin: "0 auto 24px",
            padding: "12px 32px", background: "var(--primary)",
            color: "var(--background)", border: "none", borderRadius: "8px",
            fontWeight: "bold", fontSize: "0.95rem", cursor: "pointer",
            boxShadow: "0 4px 14px rgba(45, 212, 191, 0.25)",
            transition: "transform 0.2s"
        },
        mapWrap: {
            borderRadius: "12px", overflow: "hidden",
            border: "2px solid rgba(45, 212, 191, 0.25)",
            marginBottom: "28px", height: "450px"
        },
        loadingBox: { textAlign: "center", color: "var(--primary)", padding: "30px" },
        errorBox: {
            background: "rgba(220, 38, 38, 0.1)", border: "1px solid #ef4444",
            borderRadius: "8px", padding: "16px",
            color: "#ef4444", textAlign: "center", marginBottom: "20px"
        },
        retryBtn: {
            marginTop: "10px", padding: "8px 20px",
            background: "#ef4444", color: "#fff",
            border: "none", borderRadius: "6px", cursor: "pointer"
        },
        foundLabel: { color: "var(--primary)", fontWeight: "bold", fontSize: "1rem", marginBottom: "16px" },
        cardsGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "14px"
        },
        card: (isActive) => ({
            background: isActive ? "rgba(45, 212, 191, 0.08)" : "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(16px)",
            border: isActive ? "2px solid var(--primary)" : "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px", overflow: "hidden",
            cursor: "pointer", transition: "all 0.2s"
        }),
        cardImg: { width: "100%", height: "130px", objectFit: "cover", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" },
        cardBody: { padding: "12px" },
        cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" },
        cardName: { color: "var(--primary)", fontWeight: "bold", fontSize: "0.88rem" },
        verifiedBadge: { background: "var(--primary)", color: "var(--background)", padding: "2px 7px", borderRadius: "20px", fontSize: "0.65rem", fontWeight: "bold" },
        cardAddr: { color: "var(--text-muted)", fontSize: "0.78rem", marginBottom: "8px" },
        cardFooter: { display: "flex", justifyContent: "space-between" },
        rating: { color: "#fbbf24", fontSize: "0.8rem", fontWeight: "bold" },
        distance: { color: "var(--primary)", fontSize: "0.8rem", fontWeight: "bold" },
        noSalons: { textAlign: "center", color: "var(--text-muted)", padding: "40px", fontSize: "1rem" }
    };

    return (
        <div style={styles.wrapper} id="nearby-salons">
            <div style={styles.inner}>

                {/* Divider */}
                <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", marginBottom: "40px" }} />

                {/* Header */}
                <div style={styles.header}>
                    <h2 style={styles.title}>📍 Nearby Salons</h2>
                    <p style={styles.subtitle}>Find the best salons near your current location</p>
                </div>

                {/* Detect Button */}
                {status === "idle" && (
                    <button style={styles.detectBtn} onClick={detectLocation}>
                        📍 Detect My Location
                    </button>
                )}

                {/* Retry Button */}
                {status === "denied" && (
                    <button style={styles.detectBtn} onClick={detectLocation}>
                        🔄 Try Again
                    </button>
                )}

                {/* Loading */}
                {loading && (
                    <div style={styles.loadingBox}>
                        <div style={{ fontSize: "1.8rem", marginBottom: "10px" }}>⏳</div>
                        <p>{status === "detecting" ? "📍 Detecting your location..." : "🔍 Finding nearby salons..."}</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div style={styles.errorBox}>
                        ❌ {error}
                        <br />
                        <button style={styles.retryBtn} onClick={detectLocation}>
                            Try Again
                        </button>
                    </div>
                )}

                {/* Map */}
                {userLocation && (
                    <div style={styles.mapWrap}>
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

                            {/* User marker */}
                            <Marker position={userLocation} icon={userIcon}>
                                <Popup><strong>📍 You are here</strong></Popup>
                            </Marker>

                            {/* Radius circle */}
                            <Circle
                                center={userLocation}
                                radius={10000}
                                pathOptions={{ color: "#2dd4bf", fillColor: "#2dd4bf", fillOpacity: 0.05, dashArray: "6" }}
                            />

                            {/* Salon markers */}
                            {salons.map((salon, i) =>
                                salon.location?.coordinates && (
                                    <Marker
                                        key={i}
                                        position={[salon.location.coordinates[1], salon.location.coordinates[0]]}
                                        icon={salonIcon}
                                        eventHandlers={{ click: () => setSelectedSalon(salon) }}
                                    >
                                        <Popup>
                                            <div style={{ minWidth: "160px" }}>
                                                <strong>✂️ {salon.name}</strong><br />
                                                <span style={{ color: "#666", fontSize: "12px" }}>📍 {salon.address}</span><br />
                                                <span style={{ color: "#f4a700", fontSize: "12px" }}>⭐ {salon.rating || "N/A"}</span><br />
                                                <span style={{ color: "#4CAF50", fontSize: "12px", fontWeight: "bold" }}>
                                                    📏 {calcDistance(userLocation, salon.location.coordinates)} km away
                                                </span>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )
                            )}
                        </MapContainer>
                    </div>
                )}

                {/* Salon Cards */}
                {salons.length > 0 && (
                    <div>
                        <p style={styles.foundLabel}>✂️ {salons.length} Salons Found Near You</p>
                        <div style={styles.cardsGrid}>
                            {salons.map((salon, i) => (
                                <div
                                    key={i}
                                    style={styles.card(selectedSalon?._id === salon._id)}
                                    onClick={() => setSelectedSalon(salon)}
                                >
                                    {salon.img || salon.image
                                        ? <img src={salon.img || salon.image} alt={salon.name} style={styles.cardImg} />
                                        : <div style={{ ...styles.cardImg }}>✂️</div>
                                    }
                                    <div style={styles.cardBody}>
                                        <div style={styles.cardTop}>
                                            <span style={styles.cardName}>{salon.name}</span>
                                            {salon.isApproved && <span style={styles.verifiedBadge}>✓ Verified</span>}
                                        </div>
                                        <div style={styles.cardAddr}>📍 {salon.address}</div>
                                        <div style={styles.cardFooter}>
                                            <span style={styles.rating}>⭐ {salon.rating || "N/A"}</span>
                                            <span style={styles.distance}>
                                                📏 {calcDistance(userLocation, salon.location?.coordinates)} km
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No salons */}
                {userLocation && !loading && salons.length === 0 && (
                    <div style={styles.noSalons}>
                        😕 No salons found nearby.
                    </div>
                )}
            </div>
        </div>
    );
};

export default NearbySalons;
