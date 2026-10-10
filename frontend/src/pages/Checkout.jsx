import React,{useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {ordersApi} from '../services/api';
import {useCart} from '../context/CartContext';
import {Error} from './Login';

const FREE_DELIVERY_THRESHOLD=1000;
const DELIVERY_CHARGE=50;
const money=n=>`₹${Number(n||0).toLocaleString('en-IN',{minimumFractionDigits:2})}`;

export default function Checkout(){
 const {cart,fetchCart}=useCart(); const nav=useNavigate();
 const [address,setAddress]=useState(''); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
 if(!cart.items.length)return <div className="max-w-3xl mx-auto p-16 text-center"><h1 className="text-2xl font-black">Your cart is empty</h1><button className="btn-primary mt-5" onClick={()=>nav('/products')}>Continue shopping</button></div>;
 const itemsTotal=Number(cart.totalAmount||0); const delivery=itemsTotal<FREE_DELIVERY_THRESHOLD?DELIVERY_CHARGE:0; const grandTotal=itemsTotal+delivery;
 const submit=async e=>{e.preventDefault();setBusy(true);setError('');try{const r=await ordersApi.create({address});await fetchCart();nav(`/orders/${r.data.data.id}`)}catch(e){setError(e.response?.data?.message||e.message||'Unable to place order')}finally{setBusy(false)}};
 return <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10"><h1 className="text-4xl font-black mb-8">Checkout</h1><div className="grid lg:grid-cols-[1fr_350px] gap-6">
  <form onSubmit={submit} className="bg-white border rounded-2xl p-6"><h2 className="text-xl font-black">Delivery address</h2><textarea required minLength="10" maxLength="500" rows="6" className="input mt-4 resize-none" placeholder="House/flat, street, area, city, state, PIN code" value={address} onChange={e=>setAddress(e.target.value)}/>{error&&<div className="mt-4"><Error text={error}/></div>}<button disabled={busy} className="btn-primary w-full mt-5">{busy?'Placing order...':'Place order'}</button></form>
  <div className="bg-white border rounded-2xl p-6 h-fit"><h2 className="font-black text-xl">Summary</h2>{cart.items.map(i=><div key={i.id} className="flex justify-between gap-3 text-sm py-3 border-b"><span>{i.product.name} × {i.quantity}</span><span>{money(i.subtotal)}</span></div>)}<div className="flex justify-between text-sm mt-4"><span>Items subtotal</span><span>{money(itemsTotal)}</span></div><div className="flex justify-between text-sm mt-2"><span>Delivery</span><span className={delivery===0?'text-green-600 font-semibold':''}>{delivery===0?'FREE':money(delivery)}</span></div>{delivery===0&&<p className="text-xs text-green-600 mt-2">Free delivery on orders of ₹1,000 or more.</p>}<div className="border-t my-4"/><div className="flex justify-between font-black text-xl"><span>Total</span><span>{money(grandTotal)}</span></div></div>
 </div></section>
}
