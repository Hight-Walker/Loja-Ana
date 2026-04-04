import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, ArrowLeft, Trash2, Plus, Minus, 
  ArrowRight, Truck, ShieldCheck, CreditCard, 
  ChevronRight, Star
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { CartItem, StoreConfig } from './types';
import { getStoreConfig } from './lib/storage';
import { cn, formatPrice } from './lib/utils';
import { Toast, ToastType } from './components/UI';

export const CartPage = () => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('chronos_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [storeConfig] = useState<StoreConfig>(getStoreConfig());
  const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({ message: '', type: 'success', isVisible: false });
  const [cep, setCep] = useState('');
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCartUpdate = () => {
      const saved = localStorage.getItem('chronos_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCart(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(parsed)) {
            return parsed;
          }
          return prev;
        });
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  useEffect(() => {
    const currentSaved = localStorage.getItem('chronos_cart');
    const currentCartStr = JSON.stringify(cart);
    if (currentSaved !== currentCartStr) {
      localStorage.setItem('chronos_cart', currentCartStr);
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }, [cart]);

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
    setToast({ message: 'Item removido do carrinho', type: 'info', isVisible: true });
  };

  const calculateShipping = async () => {
    if (cep.length < 8) {
      setToast({ message: 'Por favor, insira um CEP válido', type: 'error', isVisible: true });
      return;
    }

    setIsCalculating(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock logic: different regions have different costs
    const firstDigit = parseInt(cep[0]);
    let cost = 0;
    if (firstDigit === 0 || firstDigit === 1) cost = 250; // São Paulo/Região
    else if (firstDigit >= 2 && firstDigit <= 4) cost = 450; // Sul/Sudeste
    else cost = 850; // Norte/Nordeste/Centro-Oeste

    setShippingCost(cost);
    setIsCalculating(false);
    setToast({ message: 'Frete calculado com sucesso!', type: 'success', isVisible: true });
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const freeShippingThreshold = storeConfig.freeShippingMinAmount || 20000;
  const isFreeShipping = storeConfig.freeShippingEnabled && subtotal >= freeShippingThreshold;
  
  // Use calculated shipping or default
  const shipping = isFreeShipping ? 0 : (shippingCost !== null ? shippingCost : 250);
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-white">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />

      {/* Minimalist Header - Fixed for Mobile */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex justify-start">
            <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-premium-black transition-all group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest truncate max-w-[100px] sm:max-w-none">Continuar Comprando</span>
            </Link>
          </div>
          
          <div className="flex justify-center">
            <Link to="/" className="text-xl sm:text-2xl font-serif font-bold tracking-tighter whitespace-nowrap">
              {storeConfig.name}<span className="text-gold">.</span>
            </Link>
          </div>
          
          <div className="flex justify-end">
            <div className="flex items-center gap-4 text-gray-400">
              <ShieldCheck size={18} className="shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block">Pagamento Seguro</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-16"
        >
          {/* Left: Cart Items */}
          <div className="lg:col-span-8 space-y-12">
            <div className="flex items-end justify-between border-b border-gray-100 pb-8">
              <h1 className="text-4xl md:text-6xl font-serif">Sua Sacola</h1>
              <p className="text-sm text-gray-400 font-light italic">
                {cart.length} {cart.length === 1 ? 'item selecionado' : 'itens selecionados'}
              </p>
            </div>

            <AnimatePresence mode="popLayout">
              {cart.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-20 flex flex-col items-center justify-center text-center space-y-8"
                >
                  <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                    <ShoppingBag size={64} />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-3xl font-serif">Seu carrinho está vazio</h2>
                    <p className="text-gray-400 font-light max-w-md mx-auto">
                      Parece que você ainda não escolheu seu próximo Chronos. 
                      Explore nossas coleções e descubra a peça perfeita.
                    </p>
                  </div>
                  <Link 
                    to="/" 
                    className="inline-block bg-premium-black text-white px-12 py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-gold transition-all shadow-xl hover:shadow-gold/20"
                  >
                    Ver Coleções
                  </Link>
                </motion.div>
              ) : (
                <div className="space-y-10">
                  {cart.map((item, index) => (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex flex-col sm:flex-row gap-8 group"
                    >
                      <div className="w-full sm:w-48 aspect-[4/5] bg-gray-50 rounded-3xl overflow-hidden relative">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          referrerPolicy="no-referrer" 
                        />
                        {item.isBestSeller && (
                          <div className="absolute top-4 left-4 bg-gold text-white text-[8px] font-bold px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                            <Star size={8} fill="currentColor" /> Best Seller
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between py-2">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">{item.category}</p>
                              <h3 className="text-2xl md:text-3xl font-serif group-hover:text-gold transition-colors">{item.name}</h3>
                            </div>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                          <p className="text-gray-500 font-light text-sm line-clamp-2 italic">
                            "{item.description}"
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mt-8">
                          <div className="flex items-center bg-gray-50 rounded-2xl p-1.5 w-fit">
                            <button 
                              onClick={() => updateQty(item.id, -1)}
                              className="w-10 h-10 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-xl transition-all"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-14 text-center font-bold text-lg">{item.quantity}</span>
                            <button 
                              onClick={() => updateQty(item.id, 1)}
                              className="w-10 h-10 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-xl transition-all"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Preço Unitário</p>
                            <p className="text-2xl font-serif font-bold text-premium-black">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
              <div className="bg-gray-50 rounded-[2.5rem] p-10 space-y-8 border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-serif">Resumo</h2>
                
                <div className="space-y-4">
                  {/* Shipping Calculation */}
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                      <Truck size={14} />
                      <span>Calcular Frete</span>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="00000-000"
                        value={cep}
                        onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                        className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gold/20 transition-all font-mono"
                      />
                      <button 
                        onClick={calculateShipping}
                        disabled={isCalculating}
                        className="bg-premium-black text-white px-4 py-3 rounded-xl hover:bg-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCalculating ? (
                          <motion.div 
                            animate={{ rotate: 360 }} 
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          >
                            <Plus size={18} />
                          </motion.div>
                        ) : (
                          <ArrowRight size={18} />
                        )}
                      </button>
                    </div>
                    {shippingCost !== null && !isFreeShipping && (
                      <div className="space-y-3 pt-2">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          Opções para {cep.replace(/(\d{5})(\d{3})/, '$1-$2')}
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gold/20">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-gold rounded-full" />
                              <div>
                                <p className="text-xs font-bold">SEDEX Express</p>
                                <p className="text-[10px] text-gray-400">1-3 dias úteis</p>
                              </div>
                            </div>
                            <span className="text-sm font-bold">{formatPrice(shippingCost)}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-transparent hover:border-gray-200 transition-all cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-gray-300 rounded-full" />
                              <div>
                                <p className="text-xs font-bold">PAC Econômico</p>
                                <p className="text-[10px] text-gray-400">5-10 dias úteis</p>
                              </div>
                            </div>
                            <span className="text-sm font-bold">{formatPrice(Math.max(15, shippingCost - 10))}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-bold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Frete</span>
                    <span className={cn("font-bold", isFreeShipping ? "text-green-600" : "text-premium-black")}>
                      {isFreeShipping ? 'Grátis' : formatPrice(shipping)}
                    </span>
                  </div>
                  
                  {storeConfig.freeShippingEnabled && subtotal < freeShippingThreshold && (
                    <div className="bg-white/50 p-4 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Progresso Frete Grátis</span>
                        <span className="text-[10px] font-bold text-gold">{Math.round((subtotal / freeShippingThreshold) * 100)}%</span>
                      </div>
                      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(subtotal / freeShippingThreshold) * 100}%` }}
                          className="h-full bg-gold"
                        />
                      </div>
                      <p className="text-[9px] text-gray-400 text-center">
                        Adicione mais {formatPrice(freeShippingThreshold - subtotal)} para frete grátis
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-8 border-t border-gray-200 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total Estimado</p>
                    <p className="text-4xl font-serif font-bold text-premium-black">{formatPrice(total)}</p>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className={cn(
                    "w-full py-6 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]",
                    cart.length === 0 
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                      : "bg-premium-black text-white hover:bg-gold hover:shadow-gold/20"
                  )}
                >
                  Finalizar Pedido
                  <ArrowRight size={20} />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-white border border-gray-100 rounded-3xl flex flex-col items-center text-center gap-3">
                  <ShieldCheck size={24} className="text-gold" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 leading-tight">Garantia de Autenticidade</span>
                </div>
                <div className="p-6 bg-white border border-gray-100 rounded-3xl flex flex-col items-center text-center gap-3">
                  <Truck size={24} className="text-gold" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 leading-tight">Entrega Segura Segurada</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer Credit */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-50 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-300">
          Desenvolvido por Gustavo Walker, CEO da DS Company
        </p>
      </footer>
    </div>
  );
};
