import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product }) {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const { isAdmin } = useAuth();
  const [busy,setBusy]=React.useState(false);
  const [message,setMessage]=React.useState('');
  const wish=isInWishlist(product.id);
  const cart=async()=>{setBusy(true);try{await addToCart(product.id);if(wish) await removeFromWishlist(product.id);setMessage(wish?'Moved to cart':'Added to cart');}catch(e){setMessage(e.message)}finally{setBusy(false);setTimeout(()=>setMessage(''),1800)}};
  const toggleWish=async()=>{try{wish?await removeFromWishlist(product.id):await addToWishlist(product.id)}catch(e){setMessage(e.message);setTimeout(()=>setMessage(''),1800)}};
  return <div className="bg-white border rounded-2xl overflow-hidden group flex flex-col"><div className="relative bg-gray-100 aspect-square"><Link to={`/products/${product.id}`}><img src={product.imageUrl || 'https://placehold.co/600x600?text=ShopNest'} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300"/></Link><button onClick={toggleWish} className="absolute top-3 right-3 bg-white/95 rounded-full p-2 shadow"><Heart size={18} className={wish?'fill-rose-500 text-rose-500':'text-gray-500'}/></button></div><div className="p-4 flex-1 flex flex-col"><p className="text-xs text-teal-600 font-semibold">{product.category?.name}</p><Link to={`/products/${product.id}`} className="font-bold mt-1 line-clamp-2 hover:text-teal-700">{product.name}</Link><p className="text-gray-500 text-sm mt-2 line-clamp-2 flex-1">{product.description}</p><div className="flex items-center justify-between mt-4"><span className="text-xl font-black">₹{Number(product.price).toLocaleString('en-IN',{minimumFractionDigits:2})}</span>{!isAdmin && <button disabled={busy||product.stock<1} onClick={cart} aria-label="Add to cart" className="p-2 rounded-xl bg-teal-600 text-white disabled:bg-gray-300 hover:bg-teal-700"><ShoppingCart size={18}/></button>}</div><p className={`text-xs mt-2 ${message.includes('Added')?'text-green-600':'text-red-500'}`}>{message || (product.stock<1?'Out of stock':`${product.stock} in stock`)}</p></div></div>
}
