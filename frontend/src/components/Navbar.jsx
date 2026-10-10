import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  Heart, 
  ShoppingCart, 
  User as UserIcon, 
  Menu, 
  X, 
  ChevronDown, 
  LogOut, 
  Package, 
  LayoutDashboard, 
  UserCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { categoriesApi } from '../services/api';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart, wishlist } = useCart();
  const [categories, setCategories] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoriesApi.getAll();
        if (res.data?.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load categories in navbar:', err);
      }
    };
    loadCategories();
  }, []);

  // Close dropdowns on route change or outside click
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
    setIsCategoryDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchKeyword.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-cyan-900 text-white text-xs py-1.5 px-4 text-center font-medium">
        Free Delivery on Orders ₹1,000 and above • 30-Day Return Window
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md group-hover:bg-teal-700 transition-colors">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-teal-700 to-teal-900 bg-clip-text text-transparent">
                ShopNest
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold -mt-1">
                Store
              </span>
            </div>
          </Link>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3 text-sm font-medium text-gray-700">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-lg transition-colors hover:text-teal-600 hover:bg-teal-50/50 ${
                location.pathname === '/' ? 'text-teal-600 bg-teal-50 font-semibold' : ''
              }`}
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className={`px-3 py-2 rounded-lg transition-colors hover:text-teal-600 hover:bg-teal-50/50 ${
                location.pathname === '/products' ? 'text-teal-600 bg-teal-50 font-semibold' : ''
              }`}
            >
              All Products
            </Link>

            {/* Categories Dropdown */}
            <div className="relative group">
              <button 
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-gray-700 hover:text-teal-600 hover:bg-teal-50/50 transition-colors"
              >
                <span>Categories</span>
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-transform group-hover:rotate-180 duration-200" />
              </button>

              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/products?categoryId=${cat.id}`}
                    className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                      {cat.productCount}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Search Bar (Desktop) */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products, brands, essentials..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </form>

          {/* Action Icons & User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-full transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shopping cart is a customer-only feature. */}
            {!isAdmin && (
              <Link
                to="/cart"
                className="relative p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cart.totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-teal-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                    {cart.totalItems}
                  </span>
                )}
              </Link>
            )}

            {/* User Dropdown / Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400 hidden lg:block" />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-400 uppercase font-semibold">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-700 bg-amber-50/60 hover:bg-amber-100/70 font-medium transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-amber-600" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <UserCircle className="w-4 h-4 text-gray-400" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Package className="w-4 h-4 text-gray-400" />
                      <span>My Orders</span>
                    </Link>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-sm font-medium bg-teal-600 text-white rounded-full hover:bg-teal-700 shadow-sm transition-all hover:shadow"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="sm:hidden pb-3">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            className="block px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700"
          >
            Home
          </Link>
          <Link
            to="/products"
            className="block px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700"
          >
            All Products
          </Link>

          <div className="border-t border-gray-100 pt-2">
            <p className="px-3 text-xs uppercase font-bold text-gray-400 mb-1">Categories</p>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className="block px-3 py-1.5 text-sm text-gray-600 hover:text-teal-600"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {!isAuthenticated && (
            <div className="border-t border-gray-100 pt-3 flex gap-2">
              <Link
                to="/login"
                className="flex-1 text-center py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="flex-1 text-center py-2 bg-teal-600 rounded-lg text-sm font-medium text-white shadow"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
