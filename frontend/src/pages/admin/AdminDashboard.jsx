import React, { useEffect, useState } from 'react';
import { adminApi, productsApi, categoriesApi } from '../../services/api';
import { BarChart3, Users, Package, ShoppingCart, IndianRupee, Plus, Trash2, Edit3, X, RefreshCw } from 'lucide-react';
import { money, formatDate, statusLabel, statusClass } from '../../utils/commerce';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('overview');
  const [editing, setEditing] = useState(null);
  const [categoryEditing, setCategoryEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [s, p, c, o, u] = await Promise.all([
        adminApi.getDashboard(),
        productsApi.getAll({ page: 0, size: 100, sortBy: 'createdAt', sortDir: 'desc' }),
        categoriesApi.getAll(),
        adminApi.getOrders({ page: 0, size: 100 }),
        adminApi.getUsers(),
      ]);
      setStats(s.data?.data);
      setProducts(p.data?.data?.products || []);
      setCats(c.data?.data || []);
      setOrders(o.data?.data?.content || []);
      setUsers(u.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const removeProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await productsApi.delete(id); await load(); }
    catch (e) { alert(e.response?.data?.message || 'Could not delete product.'); }
  };

  const updateStatus = async (id, next) => {
    try { await adminApi.updateOrderStatus(id, next); await load(); }
    catch (e) { alert(e.response?.data?.message || 'Could not update order status.'); await load(); }
  };

  const tabs = [
    ['overview', 'Overview'], ['products', 'Products'], ['categories', 'Categories'], ['orders', 'Orders'], ['users', 'Users'],
  ];

  return <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
    <div className="flex flex-wrap justify-between gap-4 items-center mb-7">
      <div><p className="text-amber-600 font-semibold">Administration</p><h1 className="text-4xl font-black">ShopNest Dashboard</h1><p className="text-gray-500 mt-1">Manage catalogue, inventory, customers and orders.</p></div>
      <button onClick={load} disabled={loading} className="btn-secondary"><RefreshCw size={17} className={loading ? 'animate-spin' : ''}/> Refresh</button>
    </div>
    {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 text-red-700 p-4">{error}</div>}
    <div className="flex flex-wrap gap-2 mb-7">{tabs.map(([key,label])=><button key={key} onClick={()=>setTab(key)} className={`px-4 py-2 rounded-xl text-sm font-bold ${tab===key?'bg-teal-600 text-white':'bg-white border hover:border-teal-300'}`}>{label}</button>)}</div>
    {tab==='overview' && <Overview stats={stats} orders={orders} />}
    {tab==='products' && <ProductsAdmin products={products} cats={cats} onEdit={setEditing} onDelete={removeProduct} onSaved={load} />}
    {tab==='categories' && <CategoriesAdmin cats={cats} editing={categoryEditing} setEditing={setCategoryEditing} onSaved={load} />}
    {tab==='orders' && <OrdersAdmin orders={orders} onStatus={updateStatus} />}
    {tab==='users' && <UsersAdmin users={users} onSaved={load} />}
    {editing && <ProductModal product={editing==='new'?null:editing} cats={cats} onClose={()=>setEditing(null)} onSaved={()=>{setEditing(null);load()}} />}
  </section>;
}

function Overview({ stats, orders }) {
  if (!stats) return <LoadingBlock />;
  const cards = [
    ['Users', stats.totalUsers, Users], ['Products', stats.totalProducts, Package], ['Orders', stats.totalOrders, ShoppingCart], ['Revenue', money(stats.totalRevenue), IndianRupee],
  ];
  const statusCards = [
    ['Placed', stats.pendingOrders, 'PLACED'], ['Shipped', stats.shippedOrders, 'SHIPPED'], ['Delivered', stats.deliveredOrders, 'DELIVERED'], ['Cancelled', stats.cancelledOrders, 'CANCELLED'], ['Return requested', stats.returnRequestedOrders || 0, 'RETURN_REQUESTED'], ['Returned', stats.returnedOrders || 0, 'RETURNED'],
  ];
  return <>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{cards.map(([label,value,Icon])=><div className="bg-white border rounded-2xl p-5 shadow-sm" key={label}><Icon className="text-teal-600"/><p className="text-sm text-gray-500 mt-4">{label}</p><p className="text-2xl font-black mt-1">{value}</p></div>)}</div>
    <div className="grid lg:grid-cols-2 gap-6 mt-6">
      <div className="bg-white border rounded-2xl p-6"><div className="flex items-center gap-2"><BarChart3 className="text-teal-600"/><h2 className="font-black text-xl">Order status</h2></div><div className="grid grid-cols-2 gap-3 mt-5">{statusCards.map(([label,value,status])=><div className="bg-gray-50 rounded-xl p-4" key={status}><span className={`text-xs px-2 py-1 rounded-full font-bold ${statusClass(status)}`}>{statusLabel(status)}</span><p className="text-2xl font-black mt-3">{value}</p></div>)}</div></div>
      <div className="bg-white border rounded-2xl p-6"><h2 className="font-black text-xl">Recent orders</h2><div className="mt-3">{orders.slice(0,6).map(o=><div key={o.id} className="py-3 border-b last:border-0 flex justify-between gap-4"><div><p className="font-semibold">#{o.id} · {o.userName}</p><p className="text-xs text-gray-400">{formatDate(o.createdAt,true)} · {statusLabel(o.status)}</p></div><b>{money(o.totalAmount)}</b></div>)}</div></div>
    </div>
  </>;
}

function ProductsAdmin({ products, cats, onEdit, onDelete }) {
  return <div className="bg-white border rounded-2xl overflow-hidden shadow-sm"><div className="p-5 flex flex-wrap justify-between gap-3"><div><h2 className="font-black text-xl">Products</h2><p className="text-sm text-gray-500">Manage pricing, inventory and catalogue details.</p></div><button className="btn-primary" onClick={()=>onEdit('new')}><Plus size={17}/> Add product</button></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="th">Product</th><th className="th">Category</th><th className="th">Price</th><th className="th">Stock</th><th className="th">Actions</th></tr></thead><tbody>{products.map(p=><tr key={p.id} className="border-t"><td className="td"><div className="flex items-center gap-3"><img src={p.imageUrl||'https://placehold.co/60x60?text=P'} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100"/><span className="font-semibold">{p.name}</span></div></td><td className="td">{p.category?.name}</td><td className="td">{money(p.price)}</td><td className="td"><span className={p.stock===0?'text-red-600 font-bold':'font-semibold'}>{p.stock}</span></td><td className="td"><button onClick={()=>onEdit(p)} className="p-2 text-teal-700 hover:bg-teal-50 rounded-lg" title="Edit"><Edit3 size={17}/></button><button onClick={()=>onDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 size={17}/></button></td></tr>)}</tbody></table></div></div>;
}

function ProductModal({ product, cats, onClose, onSaved }) {
  const [f,setF]=useState({name:product?.name||'',description:product?.description||'',price:product?.price||'',stock:product?.stock??0,imageUrl:product?.imageUrl||'',categoryId:product?.category?.id||''});
  const [busy,setBusy]=useState(false);
  const save=async e=>{e.preventDefault();setBusy(true);try{const data={...f,price:Number(f.price),stock:Number(f.stock),categoryId:Number(f.categoryId)};product?await productsApi.update(product.id,data):await productsApi.create(data);onSaved()}catch(e){alert(e.response?.data?.message||'Could not save product.')}finally{setBusy(false)}};
  return <Modal title={product?'Edit product':'Add product'} onClose={onClose}><form onSubmit={save} className="grid md:grid-cols-2 gap-4"><label className="md:col-span-2"><span className="label">Name</span><input className="input" required minLength="2" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></label><label><span className="label">Price (₹)</span><input className="input" required type="number" min=".01" step=".01" value={f.price} onChange={e=>setF({...f,price:e.target.value})}/></label><label><span className="label">Stock</span><input className="input" required type="number" min="0" step="1" value={f.stock} onChange={e=>setF({...f,stock:e.target.value})}/></label><label><span className="label">Category</span><select className="input" required value={f.categoryId} onChange={e=>setF({...f,categoryId:e.target.value})}><option value="">Select category</option>{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label><span className="label">Image URL</span><input className="input" type="url" placeholder="https://..." value={f.imageUrl} onChange={e=>setF({...f,imageUrl:e.target.value})}/></label><label className="md:col-span-2"><span className="label">Description</span><textarea className="input" rows="4" value={f.description} onChange={e=>setF({...f,description:e.target.value})}/></label><div className="md:col-span-2 flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={onClose}>Cancel</button><button disabled={busy} className="btn-primary">{busy?'Saving...':'Save product'}</button></div></form></Modal>;
}

function CategoriesAdmin({ cats, editing, setEditing, onSaved }) {
  const [name,setName]=useState(''); const [description,setDescription]=useState(''); const [busy,setBusy]=useState(false);
  useEffect(()=>{if(editing){setName(editing.name||'');setDescription(editing.description||'')}else{setName('');setDescription('')}},[editing]);
  const save=async e=>{e.preventDefault();setBusy(true);try{if(editing)await categoriesApi.update(editing.id,{name,description});else await categoriesApi.create({name,description});setEditing(null);await onSaved()}catch(e){alert(e.response?.data?.message||'Could not save category.')}finally{setBusy(false)}};
  const del=async id=>{if(!confirm('Delete category? Products using this category may prevent deletion.'))return;try{await categoriesApi.delete(id);onSaved()}catch(e){alert(e.response?.data?.message||'Cannot delete category.')}};
  return <div className="grid lg:grid-cols-[360px_1fr] gap-6"><form onSubmit={save} className="bg-white border rounded-2xl p-6 h-fit shadow-sm"><h2 className="font-black text-xl">{editing?'Edit category':'Add category'}</h2><input required minLength="2" className="input mt-4" placeholder="Category name" value={name} onChange={e=>setName(e.target.value)}/><textarea className="input mt-3" rows="4" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)}/><div className="flex gap-2 mt-3"><button className="btn-primary flex-1" disabled={busy}><Plus size={17}/>{busy?'Saving...':editing?'Save changes':'Add category'}</button>{editing&&<button type="button" className="btn-secondary" onClick={()=>setEditing(null)}>Cancel</button>}</div></form><div className="bg-white border rounded-2xl divide-y shadow-sm">{cats.map(c=><div key={c.id} className="p-5 flex justify-between gap-4"><div><h3 className="font-bold">{c.name}</h3><p className="text-sm text-gray-500 mt-1">{c.description||'No description'}</p></div><div className="flex gap-1 shrink-0"><button onClick={()=>setEditing(c)} className="p-2 text-teal-700 hover:bg-teal-50 rounded-lg"><Edit3 size={18}/></button><button onClick={()=>del(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button></div></div>)}</div></div>;
}

function OrdersAdmin({orders,onStatus}) {
  const nextStatuses=(status)=> status==='PLACED'?['PLACED','SHIPPED','CANCELLED']:status==='SHIPPED'?['SHIPPED','DELIVERED']:status==='RETURN_REQUESTED'?['RETURN_REQUESTED','RETURNED']:[status];
  return <div className="bg-white border rounded-2xl overflow-x-auto shadow-sm"><div className="p-5 border-b"><h2 className="font-black text-xl">Orders</h2><p className="text-sm text-gray-500">Update order lifecycle and process return requests.</p></div><table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="th">Order</th><th className="th">Customer</th><th className="th">Items</th><th className="th">Delivery</th><th className="th">Total</th><th className="th">Status</th><th className="th">Update</th></tr></thead><tbody>{orders.map(o=><tr className="border-t align-top" key={o.id}><td className="td font-bold">#{o.id}<div className="text-xs text-gray-400 font-normal mt-1">{formatDate(o.createdAt)}</div></td><td className="td">{o.userName}<br/><span className="text-gray-400">{o.userEmail}</span></td><td className="td min-w-[250px]"><div className="space-y-2">{(o.items||[]).map(i=><div key={i.id} className="flex justify-between gap-3"><span className="font-medium">{i.productName}</span><span className="text-gray-500 whitespace-nowrap">× {i.quantity}</span></div>)}</div></td><td className="td">{Number(o.deliveryCharge||0)===0?'FREE':money(o.deliveryCharge)}</td><td className="td font-semibold">{money(o.totalAmount)}</td><td className="td"><span className={`text-xs px-2 py-1 rounded-full font-bold ${statusClass(o.status)}`}>{statusLabel(o.status)}</span></td><td className="td"><select className="input min-w-[155px]" value={o.status} disabled={['DELIVERED','CANCELLED','RETURNED'].includes(o.status)} onChange={e=>onStatus(o.id,e.target.value)}>{nextStatuses(o.status).map(s=><option key={s} value={s}>{statusLabel(s)}</option>)}</select></td></tr>)}</tbody></table></div>;
}

function UsersAdmin({users,onSaved}) {
  const [currentUser]=useState(()=>{try{return JSON.parse(localStorage.getItem('shopnest_user'))||null}catch{return null}}); const [busy,setBusy]=useState(null);
  const changeRole=async u=>{const next=u.role==='ADMIN'?'USER':'ADMIN';if(u.email===currentUser?.email&&next==='USER'){alert('You cannot remove your own ADMIN role.');return}if(!confirm(`Change ${u.name}'s role from ${u.role} to ${next}?`))return;setBusy(u.id);try{await adminApi.updateUserRole(u.id,next);onSaved()}catch(e){alert(e.response?.data?.message||'Could not update role.')}finally{setBusy(null)}};
  return <div className="bg-white border rounded-2xl overflow-x-auto shadow-sm"><div className="p-5 border-b"><h2 className="font-black text-xl">Users & roles</h2><p className="text-sm text-gray-500">Promote or demote users while protecting your own admin access.</p></div><table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="th">Name</th><th className="th">Email</th><th className="th">Role</th><th className="th">Joined</th></tr></thead><tbody>{users.map(u=><tr className="border-t" key={u.id}><td className="td font-semibold">{u.name}</td><td className="td">{u.email}</td><td className="td"><button onClick={()=>changeRole(u)} disabled={busy===u.id} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${u.role==='ADMIN'?'bg-amber-100 text-amber-800':'bg-gray-100 text-gray-700'} disabled:opacity-50`}>{busy===u.id?'Updating...':u.role}</button></td><td className="td">{formatDate(u.createdAt)}</td></tr>)}</tbody></table></div>;
}

function Modal({title,onClose,children}) { return <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"><div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto p-6 shadow-2xl"><div className="flex justify-between items-center mb-5"><h2 className="text-xl font-black">{title}</h2><button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X/></button></div>{children}</div></div>; }
function LoadingBlock(){return <div className="bg-white border rounded-2xl p-12 text-center text-gray-500">Loading dashboard...</div>}
