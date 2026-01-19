import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import Navbar from './components/Navbar';
import About from './pages/About';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import BlogDetail from './pages/BlogDetail';
import ProductDetail from './components/ProductDetail';
import Header from './components/Header';
import ScrollToTop from './components/ScrollToTop';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/AdminDashboard';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import FAQs from './pages/FAQs';
import Career from './pages/Career';
import PrivacyPolicy from './pages/PrivacyPolicy';
import BrandPage from './pages/BrandPage';
import WomenPage from './pages/WomenPage';

import ColorPage from './pages/ColorPage';
import ComparePage from './pages/ComparePage';
import AccessoriesPage from './pages/AccessoriesPage';
import ReadyToWearPage from './pages/ReadyToWearPage';

import MenPage from './pages/MenPage';
import TermsPage from './pages/TermsPage';
import ExchangePolicyPage from './pages/ExchangePolicyPage';
import TrackOrderPage from './pages/TrackOrderPage';
import ComplaintsPage from './pages/ComplaintsPage';
import FeedbackPage from './pages/FeedbackPage';
import SearchPage from './pages/SearchPage';
import CheckoutPage from './pages/CheckoutPage'; // Import CheckoutPage
import StyleBot from './components/StyleBot'; // Import StyleBot
import BestSellersPage from './pages/BestSellersPage';
import Breadcrumbs from './components/Breadcrumbs';

import { ProductProvider } from './context/ProductContext';
import BrandProductsPage from './pages/BrandProductsPage';
function Layout() {
  const location = useLocation();

  // ❌ Don't show footer on the cart page
  const hideFooter = location.pathname === '/cart';

  const hideLoginPage =
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTop />
      {!location.pathname.startsWith('/admin') && <Header />}
      {!location.pathname.startsWith('/admin') && <Navbar />}
      {!location.pathname.startsWith('/admin') && <Breadcrumbs />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/unstitched" element={<WomenPage />} />
        <Route path="/women" element={<WomenPage />} />

        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/brand/:brandName" element={<BrandProductsPage />} />

        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/FAQs" element={<FAQs />} />
        <Route path="/Career" element={<Career />} />
        <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="/account" element={<LoginPage />} />
        <Route path="/brand" element={<BrandPage />} />
        <Route path="/color/:colorId" element={<ColorPage />} />
        <Route path="/accessories" element={<AccessoriesPage />} />
        <Route path="/ready-to-wear" element={<ReadyToWearPage />} />

        <Route path="/men" element={<MenPage />} />

        <Route path="/compare" element={<ComparePage />} />
        <Route path="/best-sellers" element={<BestSellersPage />} />

        {/* Footer Pages */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/exchange-policy" element={<ExchangePolicyPage />} />
        <Route path="/track-order" element={<TrackOrderPage />} />
        <Route path="/complaints" element={<ComplaintsPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
      </Routes>

      {/* ✅ Footer visible on all pages except the Cart page and Admin pages */}
      {!hideFooter && !hideLoginPage && <Footer />}

      {!location.pathname.startsWith('/admin') && <StyleBot />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <ProductProvider>
        <Layout />
      </ProductProvider>
    </Router>
  );
}
