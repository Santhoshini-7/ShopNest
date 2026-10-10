import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, Headphones, Sparkles } from 'lucide-react';
import { productsApi, categoriesApi } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    Promise.all([productsApi.getAll({ page: 0, size: 8, sortBy: 'createdAt', sortDir: 'desc' }), categoriesApi.getAll()])
      .then(([p, c]) => { setProducts(p.data?.data?.products || []); setCategories(c.data?.data || []); })
      .catch(console.error);
  }, []);
  return <>
    <section className="bg-gradient-to-br from-teal-800 via-teal-700 to-cyan-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-10 items-center">
        <div><p className="uppercase tracking-[.25em] text-teal-200 text-sm font-semibold mb-4">Welcome to ShopNest</p>
          <h1 className="text-4xl sm:text-6xl font-black leading-tight">Everything you need. <span className="text-teal-200">One nest.</span></h1>
          <p className="mt-6 text-teal-50 text-lg max-w-xl">Discover quality products across electronics, fashion, home, beauty and sports — with a simple, secure shopping experience.</p>
          <div className="mt-8 flex gap-3"><Link to="/products" className="inline-flex items-center gap-2 bg-white text-teal-800 px-6 py-3 rounded-xl font-bold hover:bg-teal-50">Shop now <ArrowRight size={18}/></Link><Link to="/products" className="px-6 py-3 rounded-xl font-semibold border border-white/30 hover:bg-white/10">Explore products</Link></div>
        </div>
        <div className="hidden lg:block"><div className="bg-white/10 backdrop-blur rounded-3xl p-8 border border-white/10"><Sparkles className="w-12 h-12 text-teal-200"/><h2 className="text-2xl font-bold mt-5">Smart shopping, made simple.</h2><p className="mt-3 text-teal-100">JWT-secured accounts, cart and wishlist, order tracking and an admin management panel.</p></div></div>
      </div>
    </section>
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12"><div className="grid sm:grid-cols-3 gap-4 mb-12"><Feature icon={<Truck/>} title="Reliable delivery" text="Easy checkout with your delivery address."/><Feature icon={<ShieldCheck/>} title="Secure accounts" text="JWT-based authentication protects your account."/><Feature icon={<Headphones/>} title="Shop confidently" text="Clear product details and order tracking."/></div>
      <div className="flex items-end justify-between mb-6"><div><p className="text-teal-600 font-semibold">Browse</p><h2 className="text-3xl font-black">Shop by category</h2></div><Link to="/products" className="text-teal-700 font-semibold">View all</Link></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-14">{categories.map(c=><Link key={c.id} to={`/products?categoryId=${c.id}`} className="bg-white rounded-2xl border p-5 hover:border-teal-300 hover:-translate-y-1 transition"><div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">{c.name[0]}</div><h3 className="font-bold mt-4">{c.name}</h3><p className="text-sm text-gray-500 mt-1">{c.description}</p></Link>)}</div>
      <div className="flex items-end justify-between mb-6"><div><p className="text-teal-600 font-semibold">Fresh picks</p><h2 className="text-3xl font-black">Latest products</h2></div><Link to="/products" className="text-teal-700 font-semibold">See everything</Link></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">{products.map(p=><ProductCard key={p.id} product={p}/>)}</div>
    </section>
  </>;
}
function Feature({icon,title,text}){return <div className="bg-white rounded-2xl border p-5 flex gap-4"><div className="text-teal-600">{React.cloneElement(icon,{size:25})}</div><div><h3 className="font-bold">{title}</h3><p className="text-sm text-gray-500 mt-1">{text}</p></div></div>}
