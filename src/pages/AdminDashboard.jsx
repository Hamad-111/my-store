// ✅ src/pages/AdminDashboard.jsx
// FULL REWRITE (only meaningful changes applied):
// ✅ Order Modal redesigned
// ✅ Order Summary: Subtotal + COD + Grand Total + Items Summary (image + brand + product)
// ✅ Order Items table styling improved + Brand column added
// ✅ Safe calculations + fallbacks (works even if DB doesn't have cod/subtotal)

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
  Database,
  Menu,
  MessageSquare,
  Eye,
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
import { useProducts } from '../context/ProductContext';

import AdminSettings from '../components/admin/AdminSettings';
import AddProductForm from '../components/admin/AddProductForm';
import { sendOrderConfirmationEmail } from '../utils/emailService';

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
  const { refreshProducts } = useProducts();

  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipping', label: 'Shipping' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'confirmed', label: 'Confirmed' },
  ];

  const statusLabel = (v) => {
    const key = String(v || '')
      .toLowerCase()
      .trim();
    return STATUS_OPTIONS.find((s) => s.value === key)?.label || 'Pending';
  };

  const statusValue = (v) => {
    const key = String(v || '')
      .toLowerCase()
      .trim();
    return STATUS_OPTIONS.find((s) => s.value === key)?.value || 'pending';
  };

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

  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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
      seedDefaultBrands();
    }
    if (activeTab === 'products') fetchProducts();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'customers') fetchCustomers();
    if (activeTab === 'complaints') fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, productCategory]);

  // ------------------------
  // Auth / Logout
  // ------------------------
  const handleLogout = () => {
    // ✅ UI instantly redirect
    navigate('/login', { replace: true });

    // ✅ then logout (no UI wait)
    logout().catch((e) => console.error('Logout error:', e));
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
        .select('total_amount,status');

      if (!orderError && orderData) {
        const valid = (orderData || []).filter((o) => {
          const s = String(o.status || '')
            .toLowerCase()
            .trim();
          return s !== 'cancelled' && s !== 'canceled'; // ✅ both spellings
        });

        totalOrders = valid.length;
        totalRevenue = valid.reduce(
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
    if (error) console.error('fetchProducts error:', error);

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
    refreshProducts?.();
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

    const finalData = error ? [] : data || [];
    setOrders(finalData);

    setLoadingOrders(false);
    return finalData; // ✅ IMPORTANT
  };

  const handleUpdateOrderStatus = async (id, newStatusValue) => {
    const chosen = String(newStatusValue || '')
      .toLowerCase()
      .trim();
    if (!chosen) return;

    if (
      !confirm(
        `Are you sure you want to mark this order as ${statusLabel(chosen)}?`
      )
    ) {
      return;
    }

    setUpdatingStatus(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status: chosen })
        .eq('id', id)
        .select('*');
      // .single(); // ❌ REMOVED to prevent "Cannot coerce" error if RLS or other issues returns 0/multiple

      if (error) throw error;

      const updatedOrder = data?.[0]; // ✅ Manually get first item
      if (!updatedOrder) throw new Error('No row returned after update (check RLS policies).');

      // ✅ UI update instantly
      setOrders((prev) =>
        (prev || []).map((o) => (o.id === id ? { ...o, ...updatedOrder } : o))
      );
      setSelectedOrder((prev) =>
        prev?.id === id ? { ...prev, ...updatedOrder } : prev
      );

      await fetchStats();

      if (chosen === 'confirmed') {
        await sendOrderConfirmationEmail(updatedOrder);
      }

      alert('✅ Order status updated!');
    } catch (e) {
      console.error('Order update error:', e);

      // ✅ MOST helpful message
      alert(
        '❌ Status update failed:\n' +
        (e?.message || e?.error_description || 'Unknown') +
        '\n\n(If error mentions RLS, policy fix needed in Supabase)'
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (
      !confirm(
        '⚠️ ARE YOU SURE? This will PERMANENTLY delete this order from the database. This action cannot be undone.'
      )
    )
      return;

    setUpdatingStatus(true);
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;

      // Update UI
      setOrders((prev) => prev.filter((o) => o.id !== id));
      if (selectedOrder?.id === id) setSelectedOrder(null);

      await fetchStats(); // Refresh stats
      alert('✅ Order deleted permanently!');
    } catch (e) {
      console.error('Delete order error:', e);
      alert('❌ Failed to delete order: ' + e.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSendConfirmation = async (order) => {
    const email = getCustomerEmail(order);
    if (!email) return alert('❌ Customer email not found in order.');

    if (!confirm(`Send confirmation email to ${email}?`)) return;

    setUpdatingStatus(true);
    try {
      const ok = await sendOrderConfirmationEmail({ ...order, email });
      if (ok) alert('✅ Confirmation email sent!');
      else alert('❌ Email sending failed!');
    } catch (e) {
      console.error('send email error:', e);
      alert('❌ Email error: ' + (e.message || 'Unknown'));
    } finally {
      setUpdatingStatus(false);
    }
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

    if (error) {
      console.error('fetchCustomers error:', error);
      setCustomers([]);
    } else {
      setCustomers(data || []);
    }

    setLoadingCustomers(false);
  };

  // ------------------------
  // Complaints
  // ------------------------
  const fetchComplaints = async () => {
    setLoadingComplaints(true);
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setComplaints(data || []);
    setLoadingComplaints(false);
  };

  const handleUpdateComplaintStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('complaints')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert('Error updating status: ' + error.message);
      return;
    }

    setComplaints(
      complaints.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

  // ------------------------
  // Seed Database (Products)
  // ------------------------
  const handleSeedDatabase = async () => {
    if (!supabase) {
      alert('Supabase is not configured.');
      return;
    }

    // ✅ GUARD: prevent re-adding demo products
    setUploading(true);
    try {
      const [c1, c2, c3, c4] = await Promise.all([
        supabase
          .from('unstitched_products')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('ready_to_wear_products')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('accessories_products')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('men_products')
          .select('*', { count: 'exact', head: true }),
      ]);

      const total =
        (c1.count || 0) + (c2.count || 0) + (c3.count || 0) + (c4.count || 0);
      // ✅ Allow seeding even if DB already has products (safe because upsert uses onConflict:id)
      if (total > 0) {
        alert(
          `✅ DB already has ${total} products.\n\nSeed skipped to prevent old demo 38 products.\nIf you want demo seed, first Delete ALL products then seed.`
        );
        await fetchStats();
        if (activeTab === 'products') await fetchProducts();
        refreshProducts?.(); // ✅ refresh website context
        return;
      }

      const ok = confirm('DB is empty. Seed demo products now?');
      if (!ok) return;

      // ✅ ---- NOW PASTE YOUR EXISTING SEEDING CODE BELOW ----
      // (Unstitched/RTW/Accessories/Men mapping + upserts)
      // ✅ IMPORTANT: keep same code you already have after confirm

      // ----------------- YOUR EXISTING SEED CODE STARTS -----------------
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
      // ----------------- YOUR EXISTING SEED CODE ENDS -----------------

      alert('✅ Database seeded successfully!');
      await fetchStats();
      if (activeTab === 'products') await fetchProducts();
      refreshProducts?.(); // ✅ refresh website context
    } catch (error) {
      console.error('Error seeding database:', error);
      alert('Failed to seed database: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // ✅ DANGER: DELETE ALL PRODUCTS FROM ALL TABLES
  const handleDeleteAllProducts = async () => {
    if (
      !confirm(
        '⚠️ This will delete ALL products from ALL tables (Women + Men + Accessories + RTW). Continue?'
      )
    )
      return;

    try {
      setUploading(true);

      const tables = [
        'unstitched_products',
        'ready_to_wear_products',
        'accessories_products',
        'men_products',
      ];

      // ✅ delete all rows (requires delete permission / RLS policy)
      const results = await Promise.all(
        tables.map((t) => supabase.from(t).delete().neq('id', '___never___'))
      );

      const errors = results.filter((r) => r.error).map((r) => r.error);
      if (errors.length)
        throw new Error(errors.map((e) => e.message).join(', '));

      alert('✅ All products deleted from DB!');
      await fetchStats();
      refreshProducts?.();
      if (activeTab === 'products') await fetchProducts();
    } catch (e) {
      alert('❌ Failed: ' + (e.message || 'Unknown'));
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

  // ✅ COD charges default (ONLY ONCE)
  // ✅ COD charges default
  const COD_CHARGES_DEFAULT = 200;

  // ✅ safe JSON parse (for shipping_address too)
  const safeJson = (v) => {
    if (!v) return null;
    if (typeof v === 'object') return v;
    if (typeof v === 'string') {
      try {
        return JSON.parse(v);
      } catch {
        return null;
      }
    }
    return null;
  };

  // ✅ parse items (array, string, object {items:[]}, object {data:[]})
  const parseOrderItems = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;

    // object case
    if (typeof raw === 'object') {
      if (Array.isArray(raw.items)) return raw.items;
      if (Array.isArray(raw.data)) return raw.data;
      return [];
    }

    // string case
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        return parseOrderItems(parsed);
      } catch {
        return [];
      }
    }

    return [];
  };

  // ✅ normalize item fields (because some orders store title not name etc.)
  const normalizeItem = (it = {}) => ({
    name: it.name ?? it.title ?? it.product_name ?? 'Unnamed',
    brand: it.brand ?? it.brand_name ?? '-',
    image: it.image ?? it.img ?? it.thumbnail ?? '',
    color: it.color ?? it.colour ?? null,
    size: it.size ?? it.selectedSize ?? null,
    qty: Number(it.qty ?? it.quantity ?? 1) || 1,
    price: Number(it.price ?? it.unit_price ?? 0) || 0,
  });
  const normalizeStatus = (s) => {
    const v = String(s || '')
      .toLowerCase()
      .trim();
    if (!v) return 'Pending';

    const map = {
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      canceled: 'Cancelled',
      confirmed: 'Confirmed',
    };

    return map[v] || 'Pending';
  };
  // ✅ get customer email (from shipping_address OR order columns)
  const getCustomerEmail = (order) => {
    const shipping = safeJson(order?.shipping_address) || {};
    return (
      shipping.email ||
      order?.email ||
      order?.customer_email ||
      order?.user_email ||
      ''
    );
  };

  // ✅ final: amounts + delivery logic
  const getOrderAmounts = (order) => {
    // items keys fallback
    const rawItems =
      order?.items ??
      order?.order_items ??
      order?.cart_items ??
      order?.products ??
      order?.orderItems ??
      [];

    const items = parseOrderItems(rawItems).map(normalizeItem);

    // compute subtotal from items
    const computedSubtotal = items.reduce(
      (sum, it) => sum + it.price * it.qty,
      0
    );

    const subtotal =
      Number(order?.subtotal ?? order?.sub_total ?? computedSubtotal) || 0;

    // delivery/cod
    const delivery =
      Number(
        order?.cod_charges ??
        order?.delivery_charges ??
        order?.cash_on_delivery ??
        COD_CHARGES_DEFAULT
      ) || 0;

    const baseTotal = Number(order?.total_amount || 0);

    /**
     * ✅ IMPORTANT FIX:
     * If total_amount exists and > 0 => it already includes delivery/cod
     * so Grand Total = total_amount
     * Otherwise fallback to subtotal + delivery
     */
    const grandTotal = baseTotal > 0 ? baseTotal : subtotal + delivery;

    // helpful flag
    const totalFromDB = baseTotal > 0;

    return {
      items,
      subtotal,
      delivery,
      grandTotal,
      totalFromDB,
    };
  };

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
              className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
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
              className={`sidebar-link ${activeTab === 'brands' ? 'active' : ''}`}
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
              className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setSelectedOrder(null);
                setActiveTab('orders');
              }}
            >
              <ShoppingBag size={20} /> Orders
            </a>
          </li>

          <li className="sidebar-item">
            <a
              href="#"
              className={`sidebar-link ${activeTab === 'products' ? 'active' : ''}`}
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
              className={`sidebar-link ${activeTab === 'customers' ? 'active' : ''}`}
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
              className={`sidebar-link ${activeTab === 'complaints' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('complaints');
              }}
            >
              <MessageSquare size={20} /> Complaints
            </a>
          </li>

          <li className="sidebar-item">
            <a
              href="#"
              className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`}
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
                        : activeTab === 'complaints'
                          ? 'User Complaints'
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
              <button
                onClick={handleDeleteAllProducts}
                disabled={uploading}
                style={{
                  padding: '10px 16px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 10px 25px rgba(239,68,68,0.18)',
                  marginRight: 10,
                }}
              >
                <Trash2 size={18} />
                {uploading ? 'Working...' : 'Delete ALL Products'}
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
                      <th>Actions</th>
                    </tr >
                  </thead >

                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
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
                          <td>
                            PKR{' '}
                            {Number(order.total_amount || 0).toLocaleString()}
                          </td>
                          <td>
                            <span
                              className={`status-badge status-${order.status?.toLowerCase() || 'processing'}`}
                            >
                              {statusLabel(order.status)}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setActiveTab('orders');
                              }}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                color: '#3b82f6',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                fontWeight: 600,
                              }}
                            >
                              <Eye size={18} /> View
                            </button>
                            {(order.status !== 'Cancelled' && order.status !== 'Delivered') && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'Cancelled')}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  cursor: 'pointer',
                                  color: '#ef4444',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 5,
                                  marginLeft: 10
                                }}
                                title="Cancel Order"
                              >
                                <X size={18} /> Cancel
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                color: '#ef4444',
                                display: 'flex',
                                alignItems: 'center',
                                marginLeft: 10
                              }}
                              title="Delete Order"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table >
              </div >
            </div >
          </>
        )
        }

        {/* ✅ BRANDS */}
        {
          activeTab === 'brands' && (
            <div className="brands-manager">
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

                <p style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>
                  Note: Default brands (Khaadi, Sapphire, Alkaram, Nishat, J.,
                  Satrangi) are automatically added if missing.
                </p>
              </div>

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
          )
        }

        {/* ✅ PRODUCTS */}
        {
          activeTab === 'products' && (
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

              {/* ✅ ADD PRODUCT MODAL */}
              {showAddProduct && (
                <div className="modal-overlay">
                  <AddProductForm
                    mode="create" // ✅ ADD
                    initialData={null} // ✅ ADD (VERY IMPORTANT)
                    onClose={() => setShowAddProduct(false)}
                    onProductAdded={async () => {
                      setShowAddProduct(false);
                      setTimeout(async () => {
                        await fetchProducts();
                        await fetchStats();
                        refreshProducts?.();
                      }, 0);
                    }}
                  />
                </div>
              )}

              {/* ✅ EDIT PRODUCT MODAL */}
              {editModal.open && (
                <div className="modal-overlay">
                  <AddProductForm
                    mode="edit"
                    initialData={{
                      table: editModal.table,
                      row: editModal.row,
                    }} // ✅ SAME BUT SAFE
                    onClose={() =>
                      setEditModal({ open: false, table: null, row: null })
                    }
                    onProductAdded={async () => {
                      setEditModal({ open: false, table: null, row: null });
                      setTimeout(async () => {
                        await fetchProducts();
                        await fetchStats();
                        refreshProducts?.();
                      }, 0);
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
          )
        }

        {
          activeTab === 'orders' && (
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
                <p style={{ padding: '0 1.5rem 1.5rem' }}>Loading...</p>
              ) : (
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center' }}>
                            No orders found.
                          </td>
                        </tr>
                      ) : (
                        orders.map((order) => (
                          <tr key={order.id}>
                            <td>#{String(order.id).slice(0, 8)}</td>
                            <td>
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
                            <td>
                              PKR{' '}
                              {Number(order.total_amount || 0).toLocaleString()}
                            </td>
                            <td>
                              <span
                                className={`status-badge status-${statusValue(order.status)}`}
                              >
                                {order.status || 'Pending'}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => setSelectedOrder(order)}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  cursor: 'pointer',
                                  color: '#3b82f6',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 5,
                                }}
                              >
                                <Eye size={18} /> View
                              </button>
                              {(order.status !== 'Cancelled' && order.status !== 'cancelled' && order.status !== 'Delivered' && order.status !== 'delivered') && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    color: '#ef4444',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    marginLeft: 10
                                  }}
                                  title="Cancel Order"
                                >
                                  <X size={18} /> Cancel
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  cursor: 'pointer',
                                  color: '#ef4444',
                                  display: 'flex',
                                  alignItems: 'center',
                                  marginLeft: 10
                                }}
                                title="Delete Order"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr >
                        ))
                      )
                      }
                    </tbody >
                  </table >
                </div >
              )}

              {/* ✅ ORDER DETAILS MODAL (FULL REWRITE) */}
              {selectedOrder &&
                (() => {
                  const { items, subtotal, delivery, grandTotal, totalFromDB } =
                    getOrderAmounts(selectedOrder);

                  const shipping =
                    safeJson(selectedOrder?.shipping_address) || {};

                  return (
                    <div className="modal-overlay">
                      <div
                        className="modal-content"
                        style={{
                          maxWidth: 900,
                          width: '92%',
                          maxHeight: '90vh',
                          overflowY: 'auto',
                        }}
                      >
                        {/* Header */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 18,
                            gap: 12,
                          }}
                        >
                          <div>
                            <h3 style={{ margin: 0 }}>
                              Order Details #
                              {String(selectedOrder.id).slice(0, 8)}
                            </h3>
                            <p
                              style={{
                                margin: '6px 0 0',
                                fontSize: 12,
                                color: '#6b7280',
                              }}
                            >
                              {selectedOrder.created_at
                                ? new Date(
                                  selectedOrder.created_at
                                ).toLocaleString()
                                : ''}
                            </p>
                          </div>

                          <button
                            onClick={() => setSelectedOrder(null)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                            aria-label="Close"
                          >
                            <X size={24} />
                          </button>
                        </div>

                        {/* Two Cards */}
                        <div
                          className="order-modal-grid"
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 16,
                            marginBottom: 18,
                          }}
                        >
                          {/* Customer Info */}
                          <div
                            style={{
                              background: '#f9fafb',
                              padding: 16,
                              borderRadius: 12,
                              border: '1px solid #e5e7eb',
                            }}
                          >
                            <h4
                              style={{
                                margin: 0,
                                marginBottom: 10,
                                paddingBottom: 8,
                                borderBottom: '1px solid #e5e7eb',
                              }}
                            >
                              Customer Info
                            </h4>

                            <div
                              style={{ display: 'grid', gap: 6, fontSize: 14 }}
                            >
                              <p style={{ margin: 0 }}>
                                <strong>Name:</strong>{' '}
                                {shipping.fullName || shipping.name || '-'}
                              </p>
                              <p style={{ margin: 0 }}>
                                <strong>Email:</strong> {shipping.email || '-'}
                              </p>
                              <p style={{ margin: 0 }}>
                                <strong>Phone:</strong> {shipping.phone || '-'}
                              </p>
                              <p style={{ margin: 0 }}>
                                <strong>City:</strong> {shipping.city || '-'}
                              </p>
                              <p style={{ margin: 0 }}>
                                <strong>Address:</strong>{' '}
                                {shipping.address || '-'}
                              </p>

                              {shipping.notes ? (
                                <p style={{ margin: 0 }}>
                                  <strong>Notes:</strong> {shipping.notes}
                                </p>
                              ) : null}
                            </div>
                          </div>

                          {/* Order Summary (COD + Items Summary) */}
                          <div
                            style={{
                              background: '#f9fafb',
                              padding: 16,
                              borderRadius: 12,
                              border: '1px solid #e5e7eb',
                            }}
                          >
                            <h4
                              style={{
                                margin: 0,
                                marginBottom: 10,
                                paddingBottom: 8,
                                borderBottom: '1px solid #e5e7eb',
                              }}
                            >
                              Order Summary
                            </h4>

                            {/* Amounts */}
                            <div
                              style={{ display: 'grid', gap: 8, fontSize: 14 }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <span>Subtotal</span>
                                <strong>PKR {subtotal.toLocaleString()}</strong>
                              </div>

                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <span>Delivery / COD</span>
                                <strong>PKR {delivery.toLocaleString()}</strong>
                              </div>

                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  paddingTop: 10,
                                  marginTop: 2,
                                  borderTop: '1px dashed #d1d5db',
                                  fontSize: 16,
                                }}
                              >
                                <span>
                                  <strong>Grand Total</strong>
                                </span>
                                <span>
                                  <strong>
                                    PKR {grandTotal.toLocaleString()}
                                  </strong>
                                </span>
                              </div>

                              {!totalFromDB && (
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: 12,
                                    color: '#6b7280',
                                  }}
                                >
                                  Grand Total = Subtotal + Delivery/COD
                                </p>
                              )}
                              {totalFromDB && (
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: 12,
                                    color: '#6b7280',
                                  }}
                                >
                                  Grand Total pulled from DB (total_amount)
                                </p>
                              )}
                            </div>

                            {/* Status Update */}
                            <div style={{ marginTop: 14 }}>
                              <label
                                style={{
                                  display: 'block',
                                  marginBottom: 6,
                                  fontSize: 13,
                                }}
                              >
                                Update Status
                              </label>
                              <select
                                value={statusValue(selectedOrder.status)} // returns: pending/processing...
                                onChange={
                                  (e) =>
                                    handleUpdateOrderStatus(
                                      selectedOrder.id,
                                      e.target.value
                                    ) // will send lowercase
                                }
                                disabled={updatingStatus}
                                style={{
                                  width: '100%',
                                  padding: 10,
                                  borderRadius: 8,
                                  border: '1px solid #d1d5db',
                                  background: 'white',
                                }}
                              >
                                {STATUS_OPTIONS.map((s) => (
                                  <option key={s.value} value={s.value}>
                                    {s.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Send Email */}
                            <div style={{ marginTop: 12 }}>
                              <button
                                onClick={() =>
                                  handleSendConfirmation(selectedOrder)
                                }
                                disabled={updatingStatus}
                                style={{
                                  width: '100%',
                                  padding: '10px',
                                  backgroundColor: '#16a34a',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: 10,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 8,
                                  fontWeight: 700,
                                }}
                              >
                                <MessageSquare size={18} /> Send Confirmation
                                Email
                              </button>

                              {/* ✅ CANCEL BUTTON ADDED HERE */}
                              {selectedOrder.status !== 'cancelled' && (
                                <button
                                  onClick={() =>
                                    handleUpdateOrderStatus(selectedOrder.id, 'cancelled')
                                  }
                                  disabled={updatingStatus}
                                  style={{
                                    width: '100%',
                                    marginTop: '10px',
                                    padding: '10px',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 10,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    fontWeight: 700,
                                  }}
                                >
                                  <X size={18} /> Cancel Order
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteOrder(selectedOrder.id)}
                                disabled={updatingStatus}
                                style={{
                                  width: '100%',
                                  marginTop: '10px',
                                  padding: '10px',
                                  backgroundColor: 'transparent', // Transparent to make it less primary but still visible
                                  color: '#ef4444',
                                  border: '2px solid #ef4444',
                                  borderRadius: 10,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 8,
                                  fontWeight: 700,
                                }}
                              >
                                <Trash2 size={18} /> Delete Order Permanently
                              </button>
                            </div>

                            {/* Items Summary (brand + product + image) */}
                            {/* Items Summary (inline list) */}
                            <div style={{ marginTop: 16 }}>
                              <h5
                                style={{
                                  margin: '0 0 10px',
                                  fontSize: 14,
                                  fontWeight: 800,
                                }}
                              >
                                Items ({items.length})
                              </h5>

                              {items.length === 0 ? (
                                <div style={{ fontSize: 13, color: '#6b7280' }}>
                                  No items
                                </div>
                              ) : (
                                <div style={{ display: 'grid', gap: 10 }}>
                                  {items.map((it, idx) => (
                                    <div
                                      key={idx}
                                      style={{
                                        display: 'flex',
                                        gap: 10,
                                        alignItems: 'center',
                                        padding: 10,
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 12,
                                        background: '#fff',
                                      }}
                                    >
                                      <img
                                        src={it.image}
                                        alt={it.name || 'item'}
                                        style={{
                                          width: 44,
                                          height: 44,
                                          borderRadius: 10,
                                          objectFit: 'cover',
                                          border: '1px solid #e5e7eb',
                                          background: '#f9fafb',
                                          flexShrink: 0,
                                        }}
                                      />

                                      <div style={{ minWidth: 0, flex: 1 }}>
                                        <div
                                          style={{
                                            fontWeight: 800,
                                            fontSize: 13,
                                            color: '#111827',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                          }}
                                        >
                                          {it.name || 'Unnamed'}
                                        </div>

                                        <div
                                          style={{
                                            fontSize: 12,
                                            color: '#6b7280',
                                            marginTop: 2,
                                          }}
                                        >
                                          {it.brand
                                            ? `Brand: ${it.brand}`
                                            : 'Brand: -'}
                                          {'  '}•{'  '}
                                          Qty: {Number(it.qty || 0)}
                                        </div>
                                      </div>

                                      <div
                                        style={{
                                          textAlign: 'right',
                                          flexShrink: 0,
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontSize: 12,
                                            color: '#6b7280',
                                          }}
                                        >
                                          PKR{' '}
                                          {Number(it.price || 0).toLocaleString()}
                                        </div>
                                        <div
                                          style={{
                                            fontWeight: 900,
                                            color: '#111827',
                                          }}
                                        >
                                          PKR{' '}
                                          {(
                                            Number(it.price || 0) *
                                            Number(it.qty || 0)
                                          ).toLocaleString()}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Order Items Table (Styled) */}
                      </div>
                    </div>
                  );
                })()}
            </div >
          )
        }
        {/* ✅ CUSTOMERS */}
        {
          activeTab === 'customers' && (
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
          )
        }

        {/* ✅ COMPLAINTS */}
        {
          activeTab === 'complaints' && (
            <div
              className="complaints-manager"
              style={{ background: 'white', borderRadius: 8, padding: '1rem' }}
            >
              <h3>User Complaints</h3>
              {loadingComplaints ? (
                <p>Loading...</p>
              ) : (
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Order ID</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center' }}>
                            No complaints found.
                          </td>
                        </tr>
                      ) : (
                        complaints.map((c) => (
                          <tr key={c.id}>
                            <td>{new Date(c.created_at).toLocaleDateString()}</td>
                            <td>{c.name}</td>
                            <td>{c.email}</td>
                            <td>{c.order_id || '-'}</td>
                            <td style={{ maxWidth: '300px' }}>{c.message}</td>
                            <td>
                              <span
                                className={`status-badge ${c.status === 'Resolved' ? 'status-completed' : 'status-pending'}`}
                              >
                                {c.status}
                              </span>
                            </td>
                            <td>
                              {c.status !== 'Resolved' && (
                                <button
                                  onClick={() =>
                                    handleUpdateComplaintStatus(c.id, 'Resolved')
                                  }
                                  style={{
                                    padding: '5px 10px',
                                    background: '#16a34a',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Mark Resolved
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        }

        {/* ✅ SETTINGS */}
        {activeTab === 'settings' && <AdminSettings user={user} />}


      </main >
    </div >
  );
}
