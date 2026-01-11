// src/pages/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  DollarSign,
  Package,
  Tags,
  Plus,
  Trash2,
  Edit2,
  Edit2,
  Database,
  Menu,
  X,
} from 'lucide-react';

import './AdminDashboard.css';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

// Import Data for Seeding
import womenProducts from '../data/WomenProducts';
import readyProducts from '../data/ReadyToWearProducts';
import accessories from '../data/AccessoriesProducts';
import menProducts from '../data/MenProducts';

import AdminSettings from '../components/admin/AdminSettings';
import AddProductForm from '../components/admin/AddProductForm';

// ✅ DEFAULT 6 BRANDS (auto add if missing)
const DEFAULT_BRANDS = [
  { name: 'Khaadi', logo: '/images/brands/khaadi.png', category: 'women' },
  { name: 'Sapphire', logo: '/images/brands/sapphire.png', category: 'women' },
  { name: 'Alkaram', logo: '/images/brands/alkaram.png', category: 'women' },
  { name: 'Nishat', logo: '/images/brands/nishat.png', category: 'women' },
  { name: 'J.', logo: '/images/brands/j.png', category: 'all' },
  { name: 'Satrangi', logo: '/images/brands/satrangi.png', category: 'women' },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // ✅ Mobile Sidebar State

  // ✅ EDIT MODAL STATE
  const [editModal, setEditModal] = useState({
    open: false,
    table: null,
    row: null,
  });

  // --- BRAND STATE ---
  const [brands, setBrands] = useState([]);
  const [newBrand, setNewBrand] = useState({
    name: '',
    logo: '',
    category: 'women',
  });
  const [loadingBrands, setLoadingBrands] = useState(false);

  // --- DISCOUNT STATE ---
  const [discountBrand, setDiscountBrand] = useState('');
  const [discountValue, setDiscountValue] = useState(0);
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  // --- STATS + LISTS ---
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
    customers: 0,
  });

  const [products, setProducts] = useState([]);
  const [productCategory, setProductCategory] = useState('unstitched_products');
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // ------------------------
  // Effects
  // ------------------------
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
      fetchOrders(5);
    }

    if (activeTab === 'brands') {
      fetchBrands();
      seedDefaultBrands(); // ✅ auto insert 6 brands if missing
    }

    if (activeTab === 'products') fetchProducts();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'customers') fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, productCategory]);

  // ------------------------
  // Auth / Logout
  // ------------------------
  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      navigate('/login', { replace: true });
    }
  };

  // ------------------------
  // Brands
  // ------------------------
  const fetchBrands = async () => {
    setLoadingBrands(true);
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setBrands(data || []);
    setLoadingBrands(false);
  };

  // ✅ Auto insert default brands (if missing)
  const seedDefaultBrands = async () => {
    try {
      const { data: existing, error: exErr } = await supabase
        .from('brands')
        .select('name');

      if (exErr) throw exErr;

      const existingNames = new Set(
        (existing || []).map((b) => String(b.name || '').toLowerCase())
      );

      const missing = DEFAULT_BRANDS.filter(
        (b) => !existingNames.has(b.name.toLowerCase())
      );

      if (missing.length === 0) return;

      const { error: insErr } = await supabase.from('brands').insert(missing);
      if (insErr) throw insErr;

      fetchBrands();
    } catch (err) {
      console.error('seedDefaultBrands error:', err);
    }
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();

    if (!newBrand.name || !newBrand.logo) {
      alert('Please provide both Name and Logo URL');
      return;
    }

    const { data, error } = await supabase
      .from('brands')
      .insert([
        {
          name: newBrand.name,
          logo: newBrand.logo,
          category: newBrand.category,
        },
      ])
      .select();

    if (error) {
      alert('Error adding brand: ' + error.message);
      return;
    }

    setBrands([data[0], ...brands]);
    setNewBrand({ name: '', logo: '', category: 'women' });
    alert('Brand added successfully!');
  };

  const handleDeleteBrand = async (id) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;

    const { error } = await supabase.from('brands').delete().eq('id', id);
    if (error) {
      alert('Error deleting brand: ' + error.message);
      return;
    }

    setBrands(brands.filter((b) => b.id !== id));
  };

  // ------------------------
  // Discounts
  // ------------------------
  const handleApplyDiscount = async (e) => {
    e.preventDefault();

    if (!discountBrand) {
      alert('Please select a brand');
      return;
    }

    if (discountValue < 0 || discountValue > 100) {
      alert('Discount must be between 0 and 100');
      return;
    }

    if (
      !confirm(
        `Are you sure you want to apply ${discountValue}% discount to ALL products of ${discountBrand}?`
      )
    ) {
      return;
    }

    setApplyingDiscount(true);
    try {
      const tables = [
        'unstitched_products',
        'ready_to_wear_products',
        'accessories_products',
        'men_products',
      ];

      const results = await Promise.all(
        tables.map((table) =>
          supabase
            .from(table)
            .update({ sale_percent: discountValue, on_sale: discountValue > 0 })
            .eq('brand', discountBrand)
        )
      );

      const errors = results.filter((r) => r.error).map((r) => r.error);
      if (errors.length > 0)
        throw new Error(errors.map((e) => e.message).join(', '));

      alert(
        `Discount of ${discountValue}% applied to ${discountBrand} successfully!`
      );
      setDiscountValue(0);
      setDiscountBrand('');

      // refresh products if user is on products tab
      if (activeTab === 'products') fetchProducts();
      fetchStats();
    } catch (error) {
      console.error('Error applying discount:', error);
      alert('Failed to apply discount: ' + error.message);
    } finally {
      setApplyingDiscount(false);
    }
  };

  // ------------------------
  // Stats
  // ------------------------
  const fetchStats = async () => {
    try {
      const { count: c1 } = await supabase
        .from('unstitched_products')
        .select('*', { count: 'exact', head: true });
      const { count: c2 } = await supabase
        .from('ready_to_wear_products')
        .select('*', { count: 'exact', head: true });
      const { count: c3 } = await supabase
        .from('accessories_products')
        .select('*', { count: 'exact', head: true });
      const { count: c4 } = await supabase
        .from('men_products')
        .select('*', { count: 'exact', head: true });

      const totalProducts = (c1 || 0) + (c2 || 0) + (c3 || 0) + (c4 || 0);

      const { count: cCust } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      let totalOrders = 0;
      let totalRevenue = 0;
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('total_amount');

      if (!orderError && orderData) {
        totalOrders = orderData.length;
        totalRevenue = orderData.reduce(
          (sum, order) => sum + (Number(order.total_amount) || 0),
          0
        );
      }

      setStats({
        revenue: totalRevenue,
        orders: totalOrders,
        products: totalProducts,
        customers: cCust || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // ------------------------
  // Products
  // ------------------------
  const fetchProducts = async () => {
    setLoadingProducts(true);
    const { data, error } = await supabase
      .from(productCategory)
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setProducts(data || []);
    setLoadingProducts(false);
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const { error } = await supabase
      .from(productCategory)
      .delete()
      .eq('id', id);
    if (error) {
      alert('Error deleting product: ' + error.message);
      return;
    }

    setProducts(products.filter((p) => p.id !== id));
    fetchStats();
  };

  const openEdit = (row) => {
    setEditModal({ open: true, table: productCategory, row });
  };

  // ------------------------
  // Orders
  // ------------------------
  const fetchOrders = async (limit = null) => {
    setLoadingOrders(true);

    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;

    if (error) setOrders([]);
    else setOrders(data || []);

    setLoadingOrders(false);
  };

  // ------------------------
  // Customers
  // ------------------------
  const fetchCustomers = async () => {
    setLoadingCustomers(true);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setCustomers(data || []);
    setLoadingCustomers(false);
  };

  // ------------------------
  // Seed Database (Products)
  // ------------------------
  const handleSeedDatabase = async () => {
    if (!supabase) {
      alert('Supabase is not configured.');
      return;
    }

    if (!confirm('Are you sure you want to seed the database?')) return;

    setUploading(true);
    try {
      // 1) Unstitched
      const unstitchedData = (womenProducts || []).map((p) => ({
        id: String(p.id),
        title: p.title || p.name || 'Untitled',
        brand: p.brand || '',
        price: Number(p.price || 0),
        original_price: Number(p.originalPrice || 0) || null,
        sale_percent: Number(p.salePercent || 0),
        on_sale: Boolean(p.onSale ?? false),
        is_new: Boolean(p.isNew ?? false),
        is_best_seller: Boolean(p.isBestSeller ?? false),
        in_stock: Boolean(p.inStock ?? true),
        stock_quantity: Number(p.stockQuantity || 0),
        popularity: Number(p.popularity || 0),
        tag: p.tag || null,
        color: p.color || null,
        fabric: p.fabric || null,
        description: p.description || null,
        details: p.details || null,
        image: p.image || (Array.isArray(p.images) ? p.images[0] : null),
        images: [
          p.image || (Array.isArray(p.images) ? p.images[0] : null),
        ].filter(Boolean),
        main_category: 'UNSTITCHED',
        sub_category: 'UNSTITCHED',
        unstitched_type: p.unstitchedType || null,
        style: p.style || null,
        pieces: p.pieces || null,
      }));

      const { error: err1 } = await supabase
        .from('unstitched_products')
        .upsert(unstitchedData, { onConflict: 'id' });

      if (err1) throw new Error('Unstitched seed failed: ' + err1.message);

      // 2) Ready to Wear
      const rtwData = (readyProducts || []).map((p) => ({
        id: String(p.id),
        title: p.title || p.name || 'Untitled',
        brand: p.brand || '',
        price: Number(p.price || 0),
        original_price: Number(p.originalPrice || 0) || null,
        sale_percent: Number(p.salePercent || 0),
        on_sale: Boolean(p.onSale ?? false),
        is_new: Boolean(p.isNew ?? false),
        is_best_seller: Boolean(p.isBestSeller ?? false),
        in_stock: Boolean(p.inStock ?? true),
        stock_quantity: Number(p.stockQuantity || 0),
        popularity: Number(p.popularity || 0),
        tag: p.tag || null,
        color: p.color || null,
        fabric: p.fabric || null,
        size: p.size || null,
        description: p.description || null,
        details: p.details || null,
        image: p.image || (Array.isArray(p.images) ? p.images[0] : null),
        images: [
          p.image || (Array.isArray(p.images) ? p.images[0] : null),
        ].filter(Boolean),
        main_category: 'READY_TO_WEAR',
        sub_category: 'READY_TO_WEAR',
        rtw_type: p.rtwType || null,
        rtw_sub_type: p.rtwSubType || null,
      }));

      const { error: err2 } = await supabase
        .from('ready_to_wear_products')
        .upsert(rtwData, { onConflict: 'id' });

      if (err2) throw new Error('RTW seed failed: ' + err2.message);

      // 3) Accessories
      const accData = (accessories || []).map((p) => ({
        id: String(p.id),
        title: p.title || p.name || 'Untitled',
        brand: p.brand || '',
        price: Number(p.price || 0),
        original_price: Number(p.originalPrice || 0) || null,
        sale_percent: Number(p.salePercent || 0),
        on_sale: Boolean(p.onSale ?? false),
        is_new: Boolean(p.isNew ?? false),
        is_best_seller: Boolean(p.isBestSeller ?? false),
        in_stock: Boolean(p.inStock ?? true),
        stock_quantity: Number(p.stockQuantity || 0),
        popularity: Number(p.popularity || 0),
        tag: p.tag || null,
        color: p.color || null,
        fabric: p.fabric || p.material || null,
        material: p.material || null,
        size: p.size || null,
        description: p.description || null,
        details: p.details || null,
        image: p.image || (Array.isArray(p.images) ? p.images[0] : null),
        images: [
          p.image || (Array.isArray(p.images) ? p.images[0] : null),
        ].filter(Boolean),
        main_category: 'ACCESSORIES',
        sub_category: String(
          p.mainCategory || p.subCategory || ''
        ).toUpperCase(),
      }));

      const { error: err3 } = await supabase
        .from('accessories_products')
        .upsert(accData, { onConflict: 'id' });

      if (err3) throw new Error('Accessories seed failed: ' + err3.message);

      // 4) Men
      const menData = (menProducts || []).map((p) => ({
        id: String(p.id),
        title: p.title || p.name || 'Untitled',
        brand: p.brand || '',
        price: Number(p.price || 0),
        original_price: Number(p.originalPrice || 0) || null,
        sale_percent: Number(p.salePercent || 0),
        on_sale: Boolean(p.onSale ?? false),
        is_new: Boolean(p.isNew ?? false),
        is_best_seller: Boolean(p.isBestSeller ?? false),
        in_stock: Boolean(p.inStock ?? true),
        stock_quantity: Number(p.stockQuantity || 0),
        popularity: Number(p.popularity || 0),
        tag: p.tag || null,
        color: p.color || null,
        fabric: p.fabric || null,
        size: p.size || null,
        description: p.description || null,
        details: p.details || null,
        image: p.image || (Array.isArray(p.images) ? p.images[0] : null),
        images: [
          p.image || (Array.isArray(p.images) ? p.images[0] : null),
        ].filter(Boolean),
        main_category: 'MENSWEAR',
        sub_category: String(p.subCategory || '').toUpperCase(),
      }));

      const { error: err4 } = await supabase
        .from('men_products')
        .upsert(menData, { onConflict: 'id' });

      if (err4) throw new Error('Men seed failed: ' + err4.message);

      alert('✅ Database seeded successfully!');
      fetchStats();

      if (activeTab === 'products') fetchProducts();
    } catch (error) {
      console.error('Error seeding database:', error);
      alert('Failed to seed database: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // ------------------------
  // Access Check
  // ------------------------
  if (!user || user.role !== 'admin') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', marginTop: '50px' }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
        <button
          onClick={() => navigate('/login')}
          style={{ marginRight: '10px' }}
        >
          Go to Login
        </button>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  // ------------------------
  // UI Helpers
  // ------------------------
  const categoryButtons = useMemo(
    () => [
      'unstitched_products',
      'ready_to_wear_products',
      'accessories_products',
      'men_products',
    ],
    []
  );

  return (
    <div className="admin-container">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">MyStore</div>
          <button
            className="hamburger-btn"
            onClick={() => setIsSidebarOpen(false)}
            style={{ color: 'white', marginLeft: 'auto' }}
          >
            <X size={24} />
          </button>
        </div>

        <ul className="sidebar-menu">
          <li className="sidebar-item">
            <a
              href="#"
              className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''
                }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('dashboard');
                setIsSidebarOpen(false);
              }}
            >
              <LayoutDashboard size={20} /> Dashboard
            </a>
          </li>

          <li className="sidebar-item">
            <a
              href="#"
              className={`sidebar-link ${activeTab === 'brands' ? 'active' : ''
                }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('brands');
              }}
            >
              <Tags size={20} /> Brands
            </a>
          </li>

          <li className="sidebar-item">
            <a
              href="#"
              className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''
                }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('orders');
              }}
            >
              <ShoppingBag size={20} /> Orders
            </a>
          </li>

          <li className="sidebar-item">
            <a
              href="#"
              className={`sidebar-link ${activeTab === 'products' ? 'active' : ''
                }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('products');
              }}
            >
              <Package size={20} /> Products
            </a>
          </li>

          <li className="sidebar-item">
            <a
              href="#"
              className={`sidebar-link ${activeTab === 'customers' ? 'active' : ''
                }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('customers');
              }}
            >
              <Users size={20} /> Customers
            </a>
          </li>

          <li className="sidebar-item">
            <a
              href="#"
              className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''
                }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('settings');
              }}
            >
              <Settings size={20} /> Settings
            </a>
          </li>
        </ul>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="hamburger-btn"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="admin-title">
              {activeTab === 'dashboard'
                ? 'Dashboard Overview'
                : activeTab === 'brands'
                  ? 'Manage Brands'
                  : activeTab === 'orders'
                    ? 'Manage Orders'
                    : activeTab === 'products'
                      ? 'Manage Products'
                      : activeTab === 'customers'
                        ? 'Customer List'
                        : 'Settings'}
            </h1>
          </div>

          <div className="admin-user-profile">
            <div className="admin-avatar">A</div>
            <span>{user.name || 'Admin'}</span>
          </div>
        </header>

        {/* ✅ DASHBOARD */}
        {activeTab === 'dashboard' && (
          <>
            {/* Seed Button */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: 12,
              }}
            >
              <button
                onClick={handleSeedDatabase}
                disabled={uploading}
                style={{
                  padding: '10px 16px',
                  background: '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 10px 25px rgba(22,163,74,0.18)',
                }}
              >
                <Database size={18} />
                {uploading ? 'Seeding...' : 'Seed Database'}
              </button>
            </div>

            <div className="stats-grid">
              <div
                className="stat-card"
                onClick={() => setActiveTab('orders')}
                style={{ cursor: 'pointer' }}
              >
                <div className="stat-info">
                  <h5>Total Revenue</h5>
                  <p>PKR {stats.revenue.toLocaleString()}</p>
                </div>
                <div className="stat-icon bg-yellow-light">
                  <DollarSign size={24} />
                </div>
              </div>

              <div
                className="stat-card"
                onClick={() => setActiveTab('orders')}
                style={{ cursor: 'pointer' }}
              >
                <div className="stat-info">
                  <h5>Total Orders</h5>
                  <p>{stats.orders}</p>
                </div>
                <div className="stat-icon bg-blue-light">
                  <ShoppingBag size={24} />
                </div>
              </div>

              <div
                className="stat-card"
                onClick={() => setActiveTab('products')}
                style={{ cursor: 'pointer' }}
              >
                <div className="stat-info">
                  <h5>Total Products</h5>
                  <p>{stats.products}</p>
                </div>
                <div className="stat-icon bg-purple-light">
                  <Package size={24} />
                </div>
              </div>

              <div
                className="stat-card"
                onClick={() => setActiveTab('customers')}
                style={{ cursor: 'pointer' }}
              >
                <div className="stat-info">
                  <h5>Total Customers</h5>
                  <p>{stats.customers}</p>
                </div>
                <div className="stat-icon bg-green-light">
                  <Users size={24} />
                </div>
              </div>
            </div>

            <div className="recent-orders">
              <div className="table-header">
                <h3>
                  {orders.length > 0
                    ? 'Recent Orders'
                    : 'Recent Orders (No Data)'}
                </h3>
                <a
                  href="#"
                  className="view-all-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('orders');
                  }}
                >
                  View All
                </a>
              </div>

              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          style={{ textAlign: 'center', padding: '2rem' }}
                        >
                          No orders found.
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.id}>
                          <td>
                            #{order.id ? String(order.id).slice(0, 8) : 'N/A'}
                          </td>
                          <td>
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td>PKR {order.total_amount}</td>
                          <td>
                            <span
                              className={`status-badge status-${order.status?.toLowerCase() || 'processing'
                                }`}
                            >
                              {order.status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ✅ BRANDS */}
        {activeTab === 'brands' && (
          <div className="brands-manager">
            {/* Add Brand Form */}
            <div
              className="add-brand-form bordered-box"
              style={{
                padding: '1.5rem',
                marginBottom: '2rem',
                backgroundColor: '#fff',
                borderRadius: 8,
              }}
            >
              <h3>Add New Brand</h3>
              <form
                onSubmit={handleAddBrand}
                style={{
                  display: 'grid',
                  gap: '1rem',
                  gridTemplateColumns: '1fr 1fr 1fr auto',
                  alignItems: 'end',
                  marginTop: '1rem',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: 5,
                      fontSize: '0.9rem',
                    }}
                  >
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={newBrand.name}
                    onChange={(e) =>
                      setNewBrand({ ...newBrand, name: e.target.value })
                    }
                    placeholder="e.g. Khaadi"
                    style={{
                      width: '100%',
                      padding: 8,
                      border: '1px solid #ddd',
                      borderRadius: 4,
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: 5,
                      fontSize: '0.9rem',
                    }}
                  >
                    Logo URL
                  </label>
                  <input
                    type="text"
                    value={newBrand.logo}
                    onChange={(e) =>
                      setNewBrand({ ...newBrand, logo: e.target.value })
                    }
                    placeholder="e.g. /images/logo.png"
                    style={{
                      width: '100%',
                      padding: 8,
                      border: '1px solid #ddd',
                      borderRadius: 4,
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: 5,
                      fontSize: '0.9rem',
                    }}
                  >
                    Category
                  </label>
                  <select
                    value={newBrand.category}
                    onChange={(e) =>
                      setNewBrand({ ...newBrand, category: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: 8,
                      border: '1px solid #ddd',
                      borderRadius: 4,
                    }}
                  >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="accessories">Accessories</option>
                    <option value="all">All</option>
                  </select>
                </div>

                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: 5,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <Plus size={18} /> Add
                </button>
              </form>

              {/* ✅ Quick info */}
              <p style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>
                Note: Default brands (Khaadi, Sapphire, Alkaram, Nishat, J.,
                Satrangi) are automatically added if missing.
              </p>
            </div>

            {/* Discount Form */}
            <div
              className="discount-form bordered-box"
              style={{
                padding: '1.5rem',
                marginBottom: '2rem',
                backgroundColor: '#fff',
                borderRadius: 8,
                borderLeft: '4px solid #f59e0b',
              }}
            >
              <h3>Apply Brand Discount</h3>
              <form
                onSubmit={handleApplyDiscount}
                style={{
                  display: 'grid',
                  gap: '1rem',
                  gridTemplateColumns: '1fr 1fr auto',
                  alignItems: 'end',
                  marginTop: '1rem',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: 5,
                      fontSize: '0.9rem',
                    }}
                  >
                    Select Brand
                  </label>
                  <select
                    value={discountBrand}
                    onChange={(e) => setDiscountBrand(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 8,
                      border: '1px solid #ddd',
                      borderRadius: 4,
                    }}
                  >
                    <option value="">-- Select a Brand --</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: 5,
                      fontSize: '0.9rem',
                    }}
                  >
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: 8,
                      border: '1px solid #ddd',
                      borderRadius: 4,
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={applyingDiscount}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: 5,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  {applyingDiscount ? (
                    'Applying...'
                  ) : (
                    <>
                      <Tags size={18} /> Apply Discount
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Brands List */}
            <div
              className="brands-list bordered-box"
              style={{
                padding: '1.5rem',
                backgroundColor: '#fff',
                borderRadius: 8,
              }}
            >
              <h3>Existing Brands</h3>

              {loadingBrands ? (
                <p>Loading...</p>
              ) : brands.length === 0 ? (
                <p>No brands.</p>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '1.5rem',
                    marginTop: '1rem',
                  }}
                >
                  {brands.map((brand) => (
                    <div
                      key={brand.id}
                      style={{
                        border: '1px solid #eee',
                        padding: '1rem',
                        borderRadius: 8,
                        textAlign: 'center',
                        position: 'relative',
                      }}
                    >
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        style={{
                          height: 60,
                          objectFit: 'contain',
                          marginBottom: 10,
                        }}
                      />
                      <h4 style={{ marginBottom: 4 }}>{brand.name}</h4>
                      <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>
                        {brand.category}
                      </p>

                      <button
                        onClick={() => handleDeleteBrand(brand.id)}
                        style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                        }}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ✅ PRODUCTS */}
        {activeTab === 'products' && (
          <div
            className="products-manager"
            style={{ background: 'white', borderRadius: 8, padding: '1rem' }}
          >
            <div
              className="admin-section-header"
              style={{
                marginBottom: 20,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3>Product Management</h3>
              <button
                className="add-btn"
                onClick={() => setShowAddProduct(true)}
                style={{
                  padding: '10px 20px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <Plus size={18} /> Add New Product
              </button>
            </div>

            {showAddProduct && (
              <div className="modal-overlay">
                <AddProductForm
                  onClose={() => setShowAddProduct(false)}
                  onProductAdded={() => {
                    fetchProducts();
                    fetchStats();
                  }}
                />
              </div>
            )}

            {editModal.open && (
              <div className="modal-overlay">
                <AddProductForm
                  mode="edit"
                  initialData={{ table: editModal.table, row: editModal.row }}
                  onClose={() =>
                    setEditModal({ open: false, table: null, row: null })
                  }
                  onProductAdded={() => {
                    fetchProducts();
                    fetchStats();
                  }}
                />
              </div>
            )}

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #eee',
                paddingBottom: '1rem',
              }}
            >
              {categoryButtons.map((cat) => (
                <button
                  key={cat}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 20,
                    border: 'none',
                    cursor: 'pointer',
                    background: productCategory === cat ? '#2F3E2F' : '#eee',
                    color: productCategory === cat ? 'white' : '#333',
                  }}
                  onClick={() => setProductCategory(cat)}
                >
                  {cat
                    .replace('_products', '')
                    .replace(/_/g, ' ')
                    .toUpperCase()}
                </button>
              ))}
            </div>

            {loadingProducts ? (
              <p>Loading...</p>
            ) : (
              <div className="products-table-scroll">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Brand</th>
                      <th>Color</th>
                      <th>Tag</th>
                      <th>Price</th>
                      <th>Original</th>
                      <th>Sale%</th>
                      <th>In Stock</th>
                      <th>Stock Qty</th>
                      <th>Popularity</th>
                      <th>Main Cat</th>
                      <th>Sub Cat</th>
                      <th>Unstitched Type</th>
                      <th>Style</th>
                      <th>Pieces</th>
                      <th>RTW Type</th>
                      <th>RTW SubType</th>
                      <th>Size</th>
                      <th>Fabric</th>
                      <th>New</th>
                      <th>Best</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="24" style={{ textAlign: 'center' }}>
                          No products.
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <img
                              src={p.image}
                              alt={p.title || 'product'}
                              style={{
                                width: 40,
                                height: 40,
                                objectFit: 'cover',
                                borderRadius: 6,
                              }}
                            />
                          </td>
                          <td>{p.title || p.name}</td>
                          <td>{p.brand}</td>
                          <td>{p.color || '-'}</td>
                          <td>{p.tag || '-'}</td>
                          <td>{p.price}</td>
                          <td>{p.original_price ?? '-'}</td>
                          <td>{p.sale_percent ?? 0}</td>
                          <td>{String(p.in_stock ?? true)}</td>
                          <td>{p.stock_quantity ?? 0}</td>
                          <td>{p.popularity ?? 0}</td>
                          <td>{p.main_category || '-'}</td>
                          <td>{p.sub_category || '-'}</td>
                          <td>{p.unstitched_type || '-'}</td>
                          <td>{p.style || '-'}</td>
                          <td>{p.pieces || '-'}</td>
                          <td>{p.rtw_type || '-'}</td>
                          <td>{p.rtw_sub_type || '-'}</td>
                          <td>{p.size || '-'}</td>
                          <td>{p.fabric || '-'}</td>
                          <td>{String(!!p.is_new)}</td>
                          <td>{String(!!p.is_best_seller)}</td>
                          <td>
                            {p.created_at
                              ? new Date(p.created_at).toLocaleDateString()
                              : '-'}
                          </td>

                          <td style={{ whiteSpace: 'nowrap' }}>
                            <button
                              onClick={() => openEdit(p)}
                              style={{
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                marginRight: 10,
                                color: '#111827',
                              }}
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>

                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              style={{
                                color: 'red',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                              }}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ✅ ORDERS */}
        {activeTab === 'orders' && (
          <div
            className="recent-orders"
            style={{
              background: 'white',
              borderRadius: 8,
              paddingBottom: '1rem',
            }}
          >
            <div className="table-header">
              <h3>All Orders</h3>
            </div>

            {loadingOrders ? (
              <p>Loading...</p>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center' }}>
                          No orders found.
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td>PKR {order.total_amount}</td>
                          <td>
                            <span
                              className={`status-badge status-${order.status?.toLowerCase() || 'processing'
                                }`}
                            >
                              {order.status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ✅ CUSTOMERS */}
        {activeTab === 'customers' && (
          <div
            className="customers-manager"
            style={{ background: 'white', borderRadius: 8, padding: '1rem' }}
          >
            <h3>Registered Customers</h3>
            {loadingCustomers ? (
              <p>Loading...</p>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td>{c.full_name}</td>
                        <td>{c.email}</td>
                        <td>{c.role}</td>
                        <td>{new Date(c.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ✅ SETTINGS */}
        {activeTab === 'settings' && <AdminSettings user={user} />}
      </main>
    </div>
  );
}
