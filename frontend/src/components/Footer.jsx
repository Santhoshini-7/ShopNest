import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, Phone, MapPin, ShieldCheck, Truck, RefreshCw, CreditCard } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      {/* Value Propositions Bar */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Free Delivery</h4>
                <p className="text-xs text-gray-400">Free on orders ₹1,000 and above</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Secure Shopping</h4>
                <p className="text-xs text-gray-400">JWT-secured account access</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Simple Checkout</h4>
                <p className="text-xs text-gray-400">Fast address-based order placement</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Hassle-Free Returns</h4>
                <p className="text-xs text-gray-400">Returns available within 30 days of delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-teal-500 text-white flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">ShopNest</span>
            </Link>
            <p className="text-sm text-gray-400 max-w-sm">
              Discover curated electronics, apparel, and lifestyle accessories designed for effortless living. Shop with trust and complete transparency.
            </p>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400" />
                <span>ShopNest HQ, Innovation Boulevard, Silicon Avenue</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400" />
                <span>support@shopnest.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400" />
                <span>+1 (800) 555-NEST</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-teal-400 transition-colors">All Products</Link></li>
              <li><Link to="/products?inStock=true" className="hover:text-teal-400 transition-colors">In Stock</Link></li>
              <li><Link to="/cart" className="hover:text-teal-400 transition-colors">Shopping Cart</Link></li>
              <li><Link to="/wishlist" className="hover:text-teal-400 transition-colors">Saved Wishlist</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Customer Care</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/orders" className="hover:text-teal-400 transition-colors">Track Orders</Link></li>
              <li><Link to="/profile" className="hover:text-teal-400 transition-colors">Account Settings</Link></li>
              <li><span className="text-gray-400">Shipping Policy</span></li>
              <li><span className="text-gray-400">Returns & Warranty</span></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Stay Connected</h3>
            <p className="text-xs text-gray-400 mb-3">
              Subscribe for exclusive member drops and discounts.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
              />
              <button className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {new Date().getFullYear()} ShopNest Inc. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Crafted with modern React, Spring Boot, and Tailwind CSS.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
