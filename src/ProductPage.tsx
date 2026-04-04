import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingBag, ArrowLeft, CheckCircle2, Star, Shield, Truck, ArrowRight } from 'lucide-react';
import { Product, CartItem } from './types';
import { getProducts } from './lib/storage';
import { formatPrice, cn } from './lib/utils';
import { Toast, ToastType } from './components/UI';

export const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({ message: '', type: 'success', isVisible: false });
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const saved = localStorage.getItem('chronos_cart');
      if (saved) {
        const cart: CartItem[] = JSON.parse(saved);
        setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
      } else {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  useEffect(() => {
    const products = getProducts();
    const found = products.find(p => p.id === id);
    if (found) {
      setProduct(found);
    }
    setLoading(false);
  }, [id]);

  const addToCart = () => {
    if (!product) return;
    const savedCart = localStorage.getItem('chronos_cart');
    let cart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];
    
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      cart = cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('chronos_cart', JSON.stringify(cart));
    setToast({ message: 'Produto adicionado ao carrinho!', type: 'success', isVisible: true });
    // Sync with other components
    window.dispatchEvent(new Event('cartUpdated'));
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Carregando...</div>;
  if (!product) return <div className="h-screen flex flex-col items-center justify-center gap-4">
    <h2 className="text-2xl font-serif">Produto não encontrado</h2>
    <Link to="/" className="text-gold hover:underline">Voltar para a loja</Link>
  </div>;

  return (
    <div className="min-h-screen bg-white">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />
      <nav className="p-6 border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex justify-start">
            <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-premium-black transition-colors">
              <ArrowLeft size={20} />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest truncate max-w-[80px] sm:max-w-none">Voltar</span>
            </Link>
          </div>
          
          <div className="flex justify-center">
            <Link to="/" className="text-xl sm:text-2xl font-serif font-bold tracking-tighter whitespace-nowrap">
              CHRONOS<span className="text-gold">.</span>
            </Link>
          </div>
          
          <div className="flex justify-end">
            <Link to="/cart" className="p-2 hover:text-gold transition-colors relative">
              <ShoppingBag size={24} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-gold text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-24">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-100 rounded-3xl overflow-hidden aspect-square"
          >
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gold uppercase tracking-[0.2em] text-xs font-bold">{product.category}</span>
              {product.isBestSeller && (
                <span className="bg-gold/10 text-gold text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                  <Star size={10} fill="currentColor" /> Best Seller
                </span>
              )}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-serif mb-6">{product.name}</h1>
            
            <div className="text-3xl font-medium text-gold mb-8">{formatPrice(product.price)}</div>
            
            <p className="text-gray-500 leading-relaxed mb-10 text-lg font-light italic">
              "{product.description}"
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
              <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-2xl">
                <Truck size={24} className="text-gold mb-2" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Frete Grátis</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-2xl">
                <Shield size={24} className="text-gold mb-2" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">2 Anos Garantia</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-2xl">
                <CheckCircle2 size={24} className="text-gold mb-2" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Original</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={addToCart}
                className="flex-1 bg-white border-2 border-premium-black text-premium-black py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-3 text-sm"
              >
                Adicionar ao Carrinho
                <ShoppingBag size={20} />
              </button>
              <button 
                onClick={() => {
                  addToCart();
                  navigate('/cart');
                }}
                className="flex-1 bg-premium-black text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-gold transition-all duration-300 flex items-center justify-center gap-3 text-sm shadow-xl hover:shadow-gold/20"
              >
                Comprar Agora
                <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};
