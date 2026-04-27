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

  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const products = await getProducts();
      const found = products.find(p => p.id === id);
      if (found) {
        setProduct(found);
        setActiveImage(found.image);
      }
      setLoading(false);
    };
    fetchProduct();
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

  const productImages = product.images && product.images.length > 0 ? product.images : [product.image];

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
            <Link to="/" className="flex items-center gap-3 text-premium-black hover:text-gold transition-all group py-2">
              <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">Voltar</span>
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
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="bg-gray-50 rounded-[2.5rem] overflow-hidden aspect-square relative group shadow-2xl"
            >
              <img 
                src={activeImage || product.image || undefined} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                referrerPolicy="no-referrer" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>

            {productImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={cn(
                      "w-20 sm:w-24 aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 shrink-0",
                      activeImage === img ? "border-gold scale-105 shadow-lg shadow-gold/20" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={img || undefined} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col pt-4"
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="bg-gold/10 text-gold text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border border-gold/20">
                {product.category}
              </span>
              {product.isBestSeller && (
                <span className="bg-premium-black text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg">
                  <Star size={10} fill="currentColor" className="text-gold" /> Best Seller
                </span>
              )}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif mb-6 leading-[1.1] tracking-tight">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-10">
              <div className="text-4xl font-serif font-bold text-gold">{formatPrice(product.price)}</div>
              <div className="h-8 w-[1px] bg-gray-200" />
              <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">Disponibilidade Imediata</div>
            </div>
            
            <p className="text-gray-500 leading-relaxed mb-12 text-xl font-light italic border-l-4 border-gold/20 pl-6 py-2">
              "{product.description}"
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
              <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-gold/10 hover:bg-white hover:shadow-xl transition-all duration-500 group">
                <Truck size={28} className="text-gold mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 group-hover:text-premium-black transition-colors">Frete Grátis</span>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-gold/10 hover:bg-white hover:shadow-xl transition-all duration-500 group">
                <Shield size={28} className="text-gold mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 group-hover:text-premium-black transition-colors">2 Anos Garantia</span>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-gold/10 hover:bg-white hover:shadow-xl transition-all duration-500 group">
                <CheckCircle2 size={28} className="text-gold mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400 group-hover:text-premium-black transition-colors">Original</span>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 mt-auto">
              <button 
                onClick={addToCart}
                className="flex-1 bg-white border-2 border-premium-black text-premium-black py-6 rounded-2xl font-bold uppercase tracking-[0.2em] hover:bg-premium-black hover:text-white transition-all duration-500 flex items-center justify-center gap-3 text-xs shadow-lg"
              >
                Adicionar ao Carrinho
                <ShoppingBag size={20} />
              </button>
              <button 
                onClick={() => {
                  addToCart();
                  navigate('/cart');
                }}
                className="flex-1 bg-gold text-white py-6 rounded-2xl font-bold uppercase tracking-[0.2em] hover:bg-premium-black transition-all duration-500 flex items-center justify-center gap-3 text-xs shadow-2xl shadow-gold/30 hover:shadow-black/20"
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
