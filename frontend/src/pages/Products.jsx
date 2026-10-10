import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { productsApi, categoriesApi } from '../services/api';
import ProductCard from '../components/ProductCard';

const defaultFilters = { keyword: '', categoryId: '', minPrice: '', maxPrice: '', inStock: false, sortBy: 'createdAt', sortDir: 'desc' };

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    ...defaultFilters,
    keyword: params.get('keyword') || '',
    categoryId: params.get('categoryId') || '',
    minPrice: params.get('minPrice') || '',
    maxPrice: params.get('maxPrice') || '',
    inStock: params.get('inStock') === 'true',
    sortBy: params.get('sortBy') || 'createdAt',
    sortDir: params.get('sortDir') || 'desc',
  });
  const page = Number(params.get('page') || 0);

  useEffect(() => {
    categoriesApi.getAll().then(r => setCats(r.data?.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    const q = {
      ...filters, page, size: 12,
      inStock: filters.inStock ? true : undefined,
    };
    Object.keys(q).forEach(k => { if (q[k] === '' || q[k] === undefined) delete q[k]; });
    productsApi.getAll(q)
      .then(r => { setProducts(r.data?.data?.products || []); setMeta(r.data?.data || {}); })
      .catch(e => setError(e.response?.data?.message || 'Unable to load products.'))
      .finally(() => setLoading(false));
  }, [params.toString()]);

  const apply = (e) => {
    e?.preventDefault();
    const p = { ...filters, page: 0 };
    Object.keys(p).forEach(k => { if (p[k] === '' || p[k] === false || p[k] === undefined) delete p[k]; });
    setParams(p);
  };

  const reset = () => { setFilters(defaultFilters); setParams({}); };

  return <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
    <div className="mb-8">
      <p className="text-teal-600 font-semibold">Shop</p>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-4xl font-black">All Products</h1><p className="text-gray-500 mt-2">Search, filter and compare products across ShopNest.</p></div>
        {meta.totalElements != null && <span className="text-sm text-gray-500">{meta.totalElements} results</span>}
      </div>
    </div>

    <form onSubmit={apply} className="bg-white border rounded-2xl p-4 mb-8 grid md:grid-cols-6 gap-3 shadow-sm">
      <div className="md:col-span-2 relative"><Search className="absolute left-3 top-3.5 text-gray-400" size={18}/><input value={filters.keyword} onChange={e=>setFilters({...filters,keyword:e.target.value})} placeholder="Search products..." className="input pl-10"/></div>
      <select className="input" value={filters.categoryId} onChange={e=>setFilters({...filters,categoryId:e.target.value})}><option value="">All categories</option>{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <input className="input" type="number" min="0" placeholder="Min ₹" value={filters.minPrice} onChange={e=>setFilters({...filters,minPrice:e.target.value})}/>
      <input className="input" type="number" min="0" placeholder="Max ₹" value={filters.maxPrice} onChange={e=>setFilters({...filters,maxPrice:e.target.value})}/>
      <select className="input" value={`${filters.sortBy}:${filters.sortDir}`} onChange={e=>{const [sortBy,sortDir]=e.target.value.split(':');setFilters({...filters,sortBy,sortDir})}}><option value="createdAt:desc">Newest first</option><option value="createdAt:asc">Oldest first</option><option value="price:asc">Price: Low to high</option><option value="price:desc">Price: High to low</option><option value="name:asc">Name: A–Z</option></select>
      <label className="md:col-span-5 flex items-center gap-2 text-sm font-medium text-gray-700"><input type="checkbox" className="w-4 h-4 accent-teal-600" checked={filters.inStock} onChange={e=>setFilters({...filters,inStock:e.target.checked})}/> Show only in-stock products</label>
      <div className="flex gap-2"><button className="btn-primary flex-1"><SlidersHorizontal size={17}/> Apply</button><button type="button" onClick={reset} className="btn-secondary" title="Reset filters"><RotateCcw size={17}/></button></div>
    </form>

    {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 text-red-700 p-4">{error}</div>}
    {loading ? <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">{Array.from({length:8}).map((_,i)=><div key={i} className="bg-white border rounded-2xl overflow-hidden animate-pulse"><div className="aspect-square bg-gray-200"/><div className="p-4 space-y-3"><div className="h-3 bg-gray-200 rounded w-1/3"/><div className="h-4 bg-gray-200 rounded w-4/5"/><div className="h-3 bg-gray-200 rounded w-full"/><div className="h-8 bg-gray-200 rounded"/></div></div>)}</div>
      : products.length ? <><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">{products.map(p=><ProductCard key={p.id} product={p}/>)}</div><div className="flex items-center justify-between mt-10"><p className="text-sm text-gray-500">Page {(meta.pageNo||0)+1} of {meta.totalPages||1}</p><div className="flex gap-2"><button disabled={page===0} onClick={()=>setParams({...Object.fromEntries(params),page:page-1})} className="page-btn"><ChevronLeft/></button><button disabled={meta.last} onClick={()=>setParams({...Object.fromEntries(params),page:page+1})} className="page-btn"><ChevronRight/></button></div></div></>
      : <div className="bg-white border rounded-2xl p-16 text-center"><h2 className="text-xl font-bold">No products found</h2><p className="text-gray-500 mt-2">Try a different keyword, price range or category.</p><button onClick={reset} className="btn-secondary mt-5">Reset filters</button></div>}
  </section>;
}
