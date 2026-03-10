import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    LogOut,
    Plus,
    Settings,
    TrendingUp,
    Calendar,
    Users,
    BarChart3,
    CheckCircle2,
    XCircle,
    Store,
    ChevronRight,
    ClipboardList,
    Package,
    Mail,
    Phone,
    MapPin,
    Save,
    Trash2,
    Edit3,
    ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/api';
import './PartnerDashboard.css';

const PartnerDashboard = () => {
    const { logout, isLoggedIn, user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && (!isLoggedIn || user?.role !== 'salonOwner')) {
            navigate('/partner-login');
        }
    }, [isLoggedIn, user, navigate, loading]);

    const [searchParams, setSearchParams] = useSearchParams();
    const [currentView, setCurrentView] = useState(searchParams.get('view') || 'dashboard');
    const [notification, setNotification] = useState(null);

    // Real data states
    const [partnerBookings, setPartnerBookings] = useState([]);
    const [dashboardStats, setDashboardStats] = useState({
        totalRevenue: 0,
        totalBookings: 0,
        activeCustomers: 0,
        averageRating: 0
    });
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectBookingId, setRejectBookingId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    // Salon Info State (from backend)
    const [salonInfo, setSalonInfo] = useState({
        name: user?.salonName || "My Salon",
        email: user?.email || "",
        phone: "",
        address: "",
        price: "",
        category: "unisex",
        banner: "",
        services: [],
        inventory: []
    });

    // Products derived from salon inventory
    const [products, setProducts] = useState([]);
    const [services, setServices] = useState([]);

    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', category: 'Shampoo', price: '', stock: '', img: '' });
    const [productOrders, setProductOrders] = useState([]);

    // Fetch partner bookings and stats on mount
    useEffect(() => {
        fetchPartnerBookings();
        fetchSalonProfile();
    }, []);

    const fetchSalonProfile = async () => {
        try {
            const res = await api.get('/salons/my/profile');
            if (res.data.success) {
                const salon = res.data.data;
                setSalonInfo(salon);
                setProducts(salon.inventory || []);
                setServices(salon.services || []);
            }
        } catch (err) {
            console.error('Error fetching salon profile:', err);
        }
    };

    useEffect(() => {
        if (currentView === 'orders') {
            fetchProductOrders();
        }
    }, [currentView]);

    const fetchPartnerBookings = async () => {
        try {
            const res = await api.get('/bookings/partner');
            if (res.data.success) {
                setPartnerBookings(res.data.bookings);
                setDashboardStats(res.data.stats);
            }
        } catch (err) {
            console.error('Error fetching partner bookings:', err);
        }
    };

    const fetchProductOrders = async () => {
        try {
            const res = await api.get('/orders/partner');
            if (res.data.success) {
                setProductOrders(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching partner orders:', err);
        }
    };

    const handleAcceptBooking = async (bookingId) => {
        try {
            const res = await api.put(`/bookings/${bookingId}/accept`);
            if (res.data.success) {
                showNotify("Booking accepted! Confirmation sent to customer.");
                fetchPartnerBookings();
            }
        } catch (err) {
            showNotify("Failed to accept booking");
        }
    };

    const handleRejectBooking = async () => {
        if (!rejectBookingId) return;
        try {
            const res = await api.put(`/bookings/${rejectBookingId}/reject`, { reason: rejectReason });
            if (res.data.success) {
                showNotify("Booking moved to waiting list.");
                setRejectModalOpen(false);
                setRejectReason('');
                setRejectBookingId(null);
                fetchPartnerBookings();
            }
        } catch (err) {
            showNotify("Failed to reject booking");
        }
    };

    const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
    const [newService, setNewService] = useState({ name: '', price: '', duration: 30, category: 'general' });

    const handleAddService = async (e) => {
        e.preventDefault();
        const updatedServices = [...services, newService];
        try {
            const res = await api.put(`/salons/${salonInfo._id}`, { services: updatedServices });
            if (res.data.success) {
                setServices(res.data.data.services);
                setIsAddServiceModalOpen(false);
                setNewService({ name: '', price: '', duration: 30, category: 'general' });
                showNotify("Service added successfully!");
            }
        } catch (err) {
            showNotify("Failed to add service");
        }
    };

    const handleDeleteService = async (index) => {
        const updatedServices = services.filter((_, i) => i !== index);
        try {
            const res = await api.put(`/salons/${salonInfo._id}`, { services: updatedServices });
            if (res.data.success) {
                setServices(res.data.data.services);
                showNotify("Service removed.");
            }
        } catch (err) {
            showNotify("Failed to remove service");
        }
    };

    const openRejectModal = (bookingId) => {
        setRejectBookingId(bookingId);
        setRejectReason('');
        setRejectModalOpen(true);
    };

    const handleAcceptOrder = async (orderId) => {
        try {
            const res = await api.put(`/orders/${orderId}/accept`);
            if (res.data.success) {
                showNotify("Order accepted! Contact the customer for delivery.");
                fetchProductOrders();
            }
        } catch (err) {
            showNotify("Failed to accept order");
        }
    };

    useEffect(() => {
        const view = searchParams.get('view');
        setCurrentView(view || 'dashboard');
    }, [searchParams]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleViewChange = (view) => {
        setSearchParams({ view });
        setCurrentView(view);
    };

    const showNotify = (msg) => setNotification(msg);

    const handleSaveSalon = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/salons/${salonInfo._id}`, salonInfo);
            if (res.data.success) {
                showNotify("Salon information updated successfully!");
                fetchSalonProfile();
            }
        } catch (err) {
            showNotify("Failed to update salon");
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!newProduct.name || !newProduct.price) return;

        const updatedInventory = [...products, { ...newProduct }];
        try {
            const res = await api.put(`/salons/${salonInfo._id}`, { inventory: updatedInventory });
            if (res.data.success) {
                setProducts(res.data.data.inventory);
                setNewProduct({ name: '', category: 'Shampoo', price: '', stock: '', img: '' });
                setIsAddProductModalOpen(false);
                showNotify("New product added to inventory!");
            }
        } catch (err) {
            showNotify("Failed to add product");
        }
    };

    const handleDeleteProduct = async (index) => {
        const updatedInventory = products.filter((_, i) => i !== index);
        try {
            const res = await api.put(`/salons/${salonInfo._id}`, { inventory: updatedInventory });
            if (res.data.success) {
                setProducts(res.data.data.inventory);
                showNotify("Product removed from inventory.");
            }
        } catch (err) {
            showNotify("Failed to remove product");
        }
    };

    const handleContactAgent = (type) => {
        const subject = encodeURIComponent(`Inquiry from ${salonInfo.name}`);
        const body = encodeURIComponent(`Hello, I am the owner of ${salonInfo.name} and I need assistance with...`);
        if (type === 'email') {
            window.location.href = `mailto:support@booksaloonz.com?subject=${subject}&body=${body}`;
        } else {
            window.location.href = `tel:+919876543210`;
        }
        showNotify(`Initiating ${type} contact...`);
    };

    // Real Dashboard Stats
    const stats = [
        { label: 'TOTAL REVENUE', value: `₹${dashboardStats.totalRevenue.toLocaleString()}`, icon: <TrendingUp size={24} />, color: 'green' },
        { label: 'TOTAL BOOKINGS', value: String(dashboardStats.totalBookings), icon: <Calendar size={24} />, color: 'blue' },
        { label: 'ACTIVE CUSTOMERS', value: String(dashboardStats.activeCustomers), icon: <Users size={24} />, color: 'purple' },
        { label: 'AVERAGE RATING', value: dashboardStats.averageRating > 0 ? String(dashboardStats.averageRating) : '—', icon: <BarChart3 size={24} />, color: 'yellow' }
    ];

    // Pending bookings (real data, not hardcoded)
    const pendingBookings = partnerBookings.filter(b => b.status === 'pending');

    const renderOverview = () => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="overview-container"
        >
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        className="stat-card"
                        whileHover={{ y: -8 }}
                    >
                        <div className="stat-info">
                            <span className="stat-label">{stat.label}</span>
                            <h2 className="stat-value">{stat.value}</h2>
                        </div>
                        <div className={`stat-icon-container ${stat.color}`}>
                            {stat.icon}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="dashboard-content full-width">
                <div className="main-section">
                    <div className="section-header">
                        <h3>Upcoming Bookings</h3>
                        <button className="view-all-link" onClick={() => handleViewChange('bookings')}>View All <ChevronRight size={16} /></button>
                    </div>
                    <div className="bookings-list">
                        {pendingBookings.length === 0 ? (
                            <div className="empty-state" style={{ padding: '40px 20px' }}>
                                <Calendar size={48} className="empty-icon" />
                                <h3>No Pending Bookings</h3>
                                <p>New bookings from users will appear here.</p>
                            </div>
                        ) : (
                            pendingBookings.slice(0, 5).map((booking) => (
                                <div key={booking._id} className="booking-item">
                                    <div className="booking-info">
                                        <div className="user-avatar">{booking.user?.name?.charAt(0) || '?'}</div>
                                        <div className="booking-details">
                                            <h4>{booking.user?.name || 'Unknown User'}</h4>
                                            <p>{booking.service} • <span>{booking.time}</span> • {booking.date}</p>
                                        </div>
                                    </div>
                                    <div className="booking-actions">
                                        <button className="approve-btn" title="Accept" onClick={() => handleAcceptBooking(booking._id)}><CheckCircle2 size={22} /></button>
                                        <button className="reject-btn" title="Reject" onClick={() => openRejectModal(booking._id)}><XCircle size={22} /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const renderSalonDetails = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="dashboard-view-container"
        >
            <form onSubmit={handleSaveSalon}>
                <div className="view-header">
                    <h2>Salon Profile Information</h2>
                    <button type="submit" className="save-btn">
                        <Save size={18} style={{ marginRight: '8px' }} /> Save Changes
                    </button>
                </div>
                <div className="view-content scroll-themed">
                    <div className="partner-form-grid">
                        <div className="form-group">
                            <label>Salon Name</label>
                            <input
                                type="text"
                                value={salonInfo.name}
                                onChange={(e) => setSalonInfo({ ...salonInfo, name: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Business Email</label>
                            <input
                                type="email"
                                value={salonInfo.email}
                                onChange={(e) => setSalonInfo({ ...salonInfo, email: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Contact Phone</label>
                            <input
                                type="text"
                                value={salonInfo.phone}
                                onChange={(e) => setSalonInfo({ ...salonInfo, phone: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Starting Price (₹)</label>
                            <input
                                type="number"
                                value={salonInfo.price}
                                onChange={(e) => setSalonInfo({ ...salonInfo, price: e.target.value })}
                            />
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Full Address</label>
                            <textarea
                                className="styled-textarea"
                                value={salonInfo.address}
                                onChange={(e) => setSalonInfo({ ...salonInfo, address: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Salon Category</label>
                            <select
                                value={salonInfo.category}
                                onChange={(e) => setSalonInfo({ ...salonInfo, category: e.target.value })}
                            >
                                <option value="men">Men's Salon</option>
                                <option value="women">Women's Salon</option>
                                <option value="unisex">Unisex Salon</option>
                                <option value="spa">Luxury Spa</option>
                                <option value="bridal">Bridal Makeup</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Profile Banner Image URL</label>
                            <input
                                type="text"
                                value={salonInfo.banner}
                                onChange={(e) => setSalonInfo({ ...salonInfo, banner: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </motion.div>
    );

    const renderProducts = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="dashboard-view-container"
        >
            <div className="view-header">
                <div>
                    <h2>Salon Inventory</h2>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>Manage grooming products available at your salon</p>
                </div>
                <button className="add-service-btn" onClick={() => setIsAddProductModalOpen(true)}>
                    <Plus size={18} /> Add New Product
                </button>
            </div>

            <div className="view-content">
                {products.length === 0 ? (
                    <div className="empty-state">
                        <Package size={64} className="empty-icon" />
                        <h3>No Products Found</h3>
                        <p>Begin adding products to build your salon's digital catalog.</p>
                        <button className="add-service-btn" style={{ marginTop: '20px' }} onClick={() => setIsAddProductModalOpen(true)}>
                            Add First Product
                        </button>
                    </div>
                ) : (
                    <div className="inventory-list">
                        <div className="inventory-header">
                            <span>PRODUCT</span>
                            <span>CATEGORY</span>
                            <span>PRICE</span>
                            <span>STOCK</span>
                            <span>ACTIONS</span>
                        </div>
                        {products.map((product, index) => (
                            <div key={index} className="inventory-item">
                                <div className="product-cell">
                                    <img src={product.img || "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=40&q=80"} alt="" />
                                    <span>{product.name}</span>
                                </div>
                                <div className="category-cell">
                                    <span className="badge-lite">{product.category}</span>
                                </div>
                                <div className="price-cell">₹{product.price}</div>
                                <div className="stock-cell">{product.stock} units</div>
                                <div className="actions-cell">
                                    <button className="icon-btn edit"><Edit3 size={18} /></button>
                                    <button className="icon-btn delete" onClick={() => handleDeleteProduct(index)}><Trash2 size={18} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Product Modal */}
            <AnimatePresence>
                {isAddProductModalOpen && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="modal-content glass-effect"
                        >
                            <h3>Add New Product</h3>
                            <form onSubmit={handleAddProduct} className="modal-form">
                                <div className="form-group">
                                    <label>Product Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                        placeholder="e.g. Matte Hair Wax"
                                    />
                                </div>
                                <div className="row-group">
                                    <div className="form-group">
                                        <label>Price (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            value={newProduct.price}
                                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Stock</label>
                                        <input
                                            type="number"
                                            value={newProduct.stock}
                                            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={newProduct.category}
                                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                    >
                                        <option>Shampoo</option>
                                        <option>Conditioner</option>
                                        <option>Styling</option>
                                        <option>Serum</option>
                                        <option>Oil</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Product Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setNewProduct({ ...newProduct, img: reader.result });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        style={{ fontSize: '12px', padding: '8px' }}
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="cancel-btn" onClick={() => setIsAddProductModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="save-btn">Add Product</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );

    const renderOrders = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="dashboard-view-container"
        >
            <div className="view-header">
                <div>
                    <h2>Incoming Product Orders</h2>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>Near your salon location ({salonInfo.address ? salonInfo.address.split(',').pop().trim() : 'N/A'})</p>
                </div>
                <button className="refresh-btn" onClick={fetchProductOrders}><BarChart3 size={18} /> Refresh</button>
            </div>

            <div className="view-content">
                {productOrders.length === 0 ? (
                    <div className="empty-state">
                        <ShoppingBag size={64} className="empty-icon" />
                        <h3>No New Orders</h3>
                        <p>Orders from your city will appear here once they are placed.</p>
                    </div>
                ) : (
                    <div className="orders-grid-partner">
                        {productOrders.map(order => (
                            <div key={order._id} className="order-card-partner glass-effect">
                                <div className="order-header-row">
                                    <span className="order-id">ORD-{order._id.slice(-6).toUpperCase()}</span>
                                    <span className="order-status-badge">PAID</span>
                                </div>
                                <div className="order-main-info">
                                    <h4>{order.items?.[0]?.name || 'Product'}</h4>
                                    <p className="order-qty">Quantity: {order.items?.[0]?.quantity || 1} • Total: ₹{order.totalAmount}</p>
                                </div>
                                <div className="order-shipping-lite">
                                    <MapPin size={14} />
                                    <span>{order.shippingAddress?.street}, {order.shippingAddress?.zipCode}</span>
                                </div>
                                <div className="order-customer-lite">
                                    <Users size={14} />
                                    <span>{order.user?.name} ({order.user?.phone})</span>
                                </div>
                                <button className="btn-primary w-full mt-6" onClick={() => handleAcceptOrder(order._id)}>
                                    ACCEPT & SHIP
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );

    const renderServices = () => (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="dashboard-view-container"
        >
            <div className="view-header">
                <div>
                    <h2>Service Menu</h2>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>Edit your salon's service offerings and pricing</p>
                </div>
                <button className="add-service-btn" onClick={() => setIsAddServiceModalOpen(true)}>
                    <Plus size={18} /> Add New Service
                </button>
            </div>

            <div className="view-content">
                {services.length === 0 ? (
                    <div className="empty-state">
                        <ClipboardList size={64} className="empty-icon" />
                        <h3>No Services Listed</h3>
                        <p>Create your first service to start accepting bookings.</p>
                    </div>
                ) : (
                    <div className="inventory-list">
                        <div className="inventory-header">
                            <span>SERVICE NAME</span>
                            <span>CATEGORY</span>
                            <span>DURATION</span>
                            <span>PRICE</span>
                            <span>ACTIONS</span>
                        </div>
                        {services.map((service, index) => (
                            <div key={index} className="inventory-item">
                                <div className="product-cell">
                                    <CheckCircle2 size={18} className="text-primary-glow" />
                                    <span>{service.name}</span>
                                </div>
                                <div className="category-cell">
                                    <span className="badge-lite">{service.category}</span>
                                </div>
                                <div className="duration-cell">{service.duration} mins</div>
                                <div className="price-cell">₹{service.price}</div>
                                <div className="actions-cell">
                                    <button className="icon-btn delete" onClick={() => handleDeleteService(index)}><Trash2 size={18} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Service Modal */}
            <AnimatePresence>
                {isAddServiceModalOpen && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="modal-content glass-effect"
                        >
                            <h3>Add New Service</h3>
                            <form onSubmit={handleAddService} className="modal-form">
                                <div className="form-group">
                                    <label>Service Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newService.name}
                                        onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                        placeholder="e.g. Premium Haircut"
                                    />
                                </div>
                                <div className="row-group">
                                    <div className="form-group">
                                        <label>Price (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            value={newService.price}
                                            onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Duration (mins)</label>
                                        <input
                                            type="number"
                                            required
                                            value={newService.duration}
                                            onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={newService.category}
                                        onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                                    >
                                        <option value="Haircut">Haircut</option>
                                        <option value="Shaving">Shaving</option>
                                        <option value="Styling">Styling</option>
                                        <option value="Massage">Massage</option>
                                        <option value="Facial">Facial</option>
                                    </select>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="cancel-btn" onClick={() => setIsAddServiceModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="save-btn">Add Service</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );

    const renderBookings = () => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="dashboard-view-container"
        >
            <div className="view-header">
                <h2>All Bookings</h2>
                <button className="refresh-btn" onClick={fetchPartnerBookings}><BarChart3 size={18} /> Refresh</button>
            </div>
            <div className="view-content">
                {partnerBookings.length === 0 ? (
                    <div className="empty-state">
                        <Calendar size={64} className="empty-icon" />
                        <h3>No Bookings Yet</h3>
                        <p>Bookings from users will appear here once they are made.</p>
                    </div>
                ) : (
                    <div className="bookings-list">
                        {partnerBookings.map((booking) => (
                            <div key={booking._id} className="booking-item">
                                <div className="booking-info">
                                    <div className="user-avatar">{booking.user?.name?.charAt(0) || '?'}</div>
                                    <div className="booking-details">
                                        <h4>{booking.user?.name || 'Unknown User'} {booking.user?.email && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({booking.user.email})</span>}</h4>
                                        <p>{booking.service} • <span>{booking.time}</span> • {booking.date}</p>
                                        <span className={`badge-lite ${booking.status === 'confirmed' ? 'badge-green' : booking.status === 'pending' ? 'badge-yellow' : booking.status === 'waiting' ? 'badge-orange' : ''}`}>
                                            {booking.status?.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                {booking.status === 'pending' && (
                                    <div className="booking-actions">
                                        <button className="approve-btn" title="Accept" onClick={() => handleAcceptBooking(booking._id)}><CheckCircle2 size={22} /></button>
                                        <button className="reject-btn" title="Reject" onClick={() => openRejectModal(booking._id)}><XCircle size={22} /></button>
                                    </div>
                                )}
                                {booking.status === 'confirmed' && (
                                    <div className="booking-actions">
                                        <span style={{ color: '#22c55e', fontWeight: 800, fontSize: '0.85rem' }}>✓ CONFIRMED</span>
                                    </div>
                                )}
                                {booking.status === 'waiting' && (
                                    <div className="booking-actions">
                                        <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '0.85rem' }}>⏳ WAITING LIST</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );

    if (loading) return null;

    return (
        <>
            <Navbar
                isDashboard={true}
                partnerPills={{
                    currentView,
                    onViewChange: handleViewChange
                }}
            />
            <div className="partner-dashboard page-fade-in">
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 30 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="notification-toast"
                        >
                            <CheckCircle2 size={20} />
                            <span>{notification}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Reject Reason Modal */}
                <AnimatePresence>
                    {rejectModalOpen && (
                        <div className="modal-overlay">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="modal-content glass-effect"
                            >
                                <h3>Rejection Reason</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Please provide a reason for rejecting this booking. The user will be moved to the waiting list.</p>
                                <div className="form-group">
                                    <textarea
                                        className="styled-textarea"
                                        placeholder="Enter reason for rejection..."
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="cancel-btn" onClick={() => setRejectModalOpen(false)}>Cancel</button>
                                    <button type="button" className="save-btn" onClick={handleRejectBooking}>Reject & Move to Waiting List</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <main className="dashboard-main-content">
                    {currentView === 'dashboard' && renderOverview()}
                    {currentView === 'salon' && renderSalonDetails()}
                    {currentView === 'products' && renderProducts()}
                    {currentView === 'services' && renderServices()}
                    {currentView === 'orders' && renderOrders()}
                    {currentView === 'bookings' && renderBookings()}
                </main>
            </div>
            <Footer />
        </>
    );
};

export default PartnerDashboard;
