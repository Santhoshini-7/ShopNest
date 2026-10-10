import React,{useEffect,useState} from 'react';
import {Link,useParams} from 'react-router-dom';
import {ordersApi} from '../services/api';
import {ArrowLeft,MapPin,PackageCheck,XCircle,RotateCcw,CheckCircle2,Clock3} from 'lucide-react';
import {money,formatDate,statusLabel,statusClass} from '../utils/commerce';

const timeline = ['PLACED','SHIPPED','DELIVERED'];

export default function OrderDetails(){
 const{id}=useParams(); const[o,setO]=useState(null); const[busy,setBusy]=useState(false); const[error,setError]=useState('');
 useEffect(()=>{ordersApi.getById(id).then(r=>setO(r.data?.data)).catch(e=>setError(e.response?.data?.message||'Unable to load order.'));},[id]);
 const cancel=async()=>{if(!confirm('Cancel this order? The reserved stock will be restored.'))return;setBusy(true);try{const r=await ordersApi.cancel(id);setO(r.data?.data)}catch(e){alert(e.response?.data?.message||'Unable to cancel order')}finally{setBusy(false)}};
 const requestReturn=async()=>{if(!confirm('Request a return for this delivered order?'))return;setBusy(true);try{const r=await ordersApi.requestReturn(id);setO(r.data?.data)}catch(e){alert(e.response?.data?.message||'Unable to request return')}finally{setBusy(false)}};
 if(error)return <div className="max-w-3xl mx-auto px-4 py-16 text-center"><div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 p-5">{error}</div><Link to="/orders" className="btn-secondary mt-5 inline-flex">Back to orders</Link></div>;
 if(!o)return <div className="p-16 text-center text-gray-500">Loading order...</div>;
 const returnDeadline=o.returnEligibleUntil?new Date(o.returnEligibleUntil):null; const returnOpen=o.status==='DELIVERED'&&returnDeadline&&new Date()<=returnDeadline;
 const currentIndex=timeline.indexOf(o.status);
 return <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
  <Link to="/orders" className="inline-flex gap-2 items-center text-sm text-gray-500 mb-6 hover:text-teal-700"><ArrowLeft size={16}/> My orders</Link>
  <div className="flex flex-wrap justify-between gap-4 mb-7"><div><p className="text-gray-500 text-sm">Order #{o.id}</p><h1 className="text-3xl font-black">Order details</h1><p className="text-sm text-gray-500 mt-1">Placed {formatDate(o.createdAt,true)}</p></div><span className={`h-fit px-3 py-1.5 rounded-full font-bold text-sm ${statusClass(o.status)}`}>{statusLabel(o.status)}</span></div>
  <div className="bg-white border rounded-2xl p-5 mb-6">
   <div className="grid sm:grid-cols-3 gap-4">{timeline.map((s,i)=>{const active=currentIndex>=i;return <div key={s} className="flex items-center gap-3"><div className={`w-9 h-9 rounded-full flex items-center justify-center ${active?'bg-teal-600 text-white':'bg-gray-100 text-gray-400'}`}>{active?<CheckCircle2 size={18}/>:<Clock3 size={18}/>}</div><div><p className={`font-bold text-sm ${active?'text-gray-900':'text-gray-400'}`}>{statusLabel(s)}</p>{s==='PLACED'&&<p className="text-xs text-gray-400">{formatDate(o.createdAt)}</p>}{s==='DELIVERED'&&<p className="text-xs text-gray-400">{formatDate(o.deliveredAt)}</p>}</div></div>})}</div>
   {(o.status==='CANCELLED'||o.status==='RETURN_REQUESTED'||o.status==='RETURNED')&&<div className="mt-4 pt-4 border-t text-sm font-semibold">Current state: {statusLabel(o.status)}</div>}
  </div>
  <div className="grid lg:grid-cols-[1fr_340px] gap-6">
   <div className="space-y-4"><div className="bg-white border rounded-2xl divide-y">{o.items?.map(i=><div key={i.id} className="p-4 flex gap-4"><img src={i.productImageUrl||'https://placehold.co/100x100?text=Product'} alt={i.productName} className="w-20 h-20 rounded-xl object-cover bg-gray-100"/><div className="flex-1"><Link to={`/products/${i.productId}`} className="font-bold hover:text-teal-700">{i.productName}</Link><p className="text-sm text-gray-500 mt-1">{money(i.price)} × {i.quantity}</p></div><b>{money(i.subtotal)}</b></div>)}</div></div>
   <div className="space-y-4"><div className="bg-white border rounded-2xl p-5"><h2 className="font-black">Delivery</h2><div className="flex gap-3 mt-4 text-sm text-gray-600"><MapPin className="text-teal-600 shrink-0" size={19}/><span>{o.address}</span></div></div>
    <div className="bg-white border rounded-2xl p-5"><h2 className="font-black">Payment summary</h2><div className="flex justify-between mt-4 text-sm"><span className="text-gray-500">Items</span><span>{money((o.totalAmount||0)-(o.deliveryCharge||0))}</span></div><div className="flex justify-between mt-2 text-sm"><span className="text-gray-500">Delivery</span><span>{Number(o.deliveryCharge||0)===0?'FREE':money(o.deliveryCharge)}</span></div><div className="flex justify-between font-black text-xl mt-4 pt-4 border-t"><span>Total</span><span>{money(o.totalAmount)}</span></div>
     {o.status==='PLACED'&&<button disabled={busy} onClick={cancel} className="w-full mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-red-700 font-bold py-3 hover:bg-red-100 disabled:opacity-50"><XCircle size={18}/>{busy?'Cancelling...':'Cancel order'}</button>}
     {o.status==='SHIPPED'&&<p className="mt-5 text-sm text-gray-500">This order has been shipped and can no longer be cancelled.</p>}
     {returnOpen&&<><button disabled={busy} onClick={requestReturn} className="w-full mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 font-bold py-3 hover:bg-orange-100 disabled:opacity-50"><RotateCcw size={18}/>{busy?'Submitting...':'Request return'}</button><p className="mt-2 text-xs text-gray-500">Return requests are accepted until {formatDate(o.returnEligibleUntil)} (30 days after delivery).</p></>}
     {o.status==='DELIVERED'&&!returnOpen&&<p className="mt-5 text-sm text-gray-500">The 30-day return window has expired.</p>}
     {o.status==='RETURN_REQUESTED'&&<div className="mt-5 rounded-xl bg-orange-50 p-4 text-sm text-orange-800"><b>Return requested.</b><p className="mt-1">Your request is waiting for admin processing.</p></div>}
     {o.status==='RETURNED'&&<div className="mt-5 rounded-xl bg-green-50 p-4 text-sm text-green-800"><b>Return completed.</b><p className="mt-1">The returned items have been restored to inventory.</p></div>}
    </div></div>
  </div>
 </section>;
}
