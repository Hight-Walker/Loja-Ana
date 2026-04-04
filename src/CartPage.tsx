import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, ArrowLeft, Trash2, Plus, Minus, 
  ArrowRight, Truck, ShieldCheck, CreditCard, 
  ChevronRight, Star, MapPin, Package
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
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col sm:flex-row items-baseline sm:items-end justify-between border-b border-gray-100 pb-10 gap-4"
            >
              <h1 className="text-5xl md:text-7xl font-serif">Sua <span className="italic text-gold">Sacola</span></h1>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] bg-gray-50 px-4 py-2 rounded-full">
                {cart.length} {cart.length === 1 ? 'item selecionado' : 'itens selecionados'}
              </p>
            </motion.div>

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
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="flex flex-col sm:flex-row gap-8 group bg-white hover:bg-gray-50/50 p-4 sm:p-6 rounded-[2rem] transition-all duration-500 border border-transparent hover:border-gray-100 hover:shadow-xl hover:shadow-black/5"
                    >
                      <div className="w-full sm:w-48 aspect-[4/5] bg-gray-50 rounded-3xl overflow-hidden relative shadow-inner">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                          referrerPolicy="no-referrer" 
                        />
                        {item.isBestSeller && (
                          <div className="absolute top-4 left-4 bg-premium-black text-white text-[8px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg">
                            <Star size={8} fill="currentColor" className="text-gold" /> Best Seller
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between py-2">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">{item.category}</p>
                              <h3 className="text-2xl md:text-4xl font-serif group-hover:text-gold transition-colors duration-300 leading-tight">{item.name}</h3>
                            </div>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="w-12 h-12 flex items-center justify-center text-gray-300 hover:text-white hover:bg-red-500 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-red-200 shrink-0"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                          <p className="text-gray-500 font-light text-base line-clamp-2 italic border-l-2 border-gray-100 pl-4">
                            "{item.description}"
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mt-10">
                          <div className="flex items-center bg-white border border-gray-100 rounded-2xl p-2 w-fit shadow-sm">
                            <button 
                              onClick={() => updateQty(item.id, -1)}
                              className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 hover:text-gold rounded-xl transition-all active:scale-95"
                            >
                              <Minus size={18} />
                            </button>
                            <span className="w-16 text-center font-bold text-xl font-serif">{item.quantity}</span>
                            <button 
                              onClick={() => updateQty(item.id, 1)}
                              className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 hover:text-gold rounded-xl transition-all active:scale-95"
                            >
                              <Plus size={18} />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-1">Valor Total</p>
                            <p className="text-3xl font-serif font-bold text-premium-black">{formatPrice(item.price * item.quantity)}</p>
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
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gold/30 group-hover:bg-gold transition-colors" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-premium-black">
                        <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center text-gold">
                          <Truck size={16} />
                        </div>
                        <span>Cálculo de Entrega</span>
                      </div>
                      {isFreeShipping && (
                        <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest border border-green-100">
                          Frete Grátis
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <div className="flex gap-2">
                        <div className="relative flex-1 group/input">
                          <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-gold transition-colors" />
                          <input 
                            type="text" 
                            placeholder="00000-000"
                            value={cep}
                            onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                            className="w-full bg-gray-50 border border-transparent rounded-xl pl-11 pr-4 py-4 text-sm focus:bg-white focus:ring-2 focus:ring-gold/10 focus:border-gold/20 transition-all font-mono placeholder:text-gray-300"
                          />
                        </div>
                        <button 
                          onClick={calculateShipping}
                          disabled={isCalculating || cep.length < 8}
                          className="bg-premium-black text-white px-6 py-4 rounded-xl hover:bg-gold transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center min-w-[60px] shadow-lg shadow-black/5"
                        >
                          {isCalculating ? (
                            <motion.div 
                              animate={{ rotate: 360 }} 
                              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            >
                              <Plus size={20} />
                            </motion.div>
                          ) : (
                            <span className="text-xs font-bold uppercase tracking-widest">Calcular</span>
                          )}
                        </button>
                      </div>
                      <p className="text-[9px] text-gray-400 mt-2 ml-1 italic">Informe seu CEP para ver as opções de entrega premium.</p>
                    </div>

                    {shippingCost !== null && !isFreeShipping && (
                      <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="flex items-center gap-2">
                          <div className="h-[1px] flex-1 bg-gray-100" />
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.15em] whitespace-nowrap">
                            Disponível para {cep.replace(/(\d{5})(\d{3})/, '$1-$2')}
                          </p>
                          <div className="h-[1px] flex-1 bg-gray-100" />
                        </div>
                        
                        <div className="space-y-3">
                          <div className="group/option relative flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gold/20 hover:bg-white hover:shadow-md transition-all cursor-default">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gold/5 rounded-xl flex items-center justify-center text-gold group-hover/option:bg-gold group-hover/option:text-white transition-all">
                                <Truck size={20} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-premium-black">SEDEX Express</p>
                                <p className="text-[11px] text-gray-400">Entrega prioritária em até 3 dias úteis</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-base font-serif font-bold text-gold">{formatPrice(shippingCost)}</span>
                            </div>
                          </div>

                          <div className="group/option relative flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-gold/20 hover:shadow-md transition-all cursor-pointer">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover/option:bg-gold/5 group-hover/option:text-gold transition-all">
                                <Package size={20} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-600">PAC Econômico</p>
                                <p className="text-[11px] text-gray-400">Entrega padrão em até 10 dias úteis</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-base font-serif font-bold text-gray-400 group-hover/option:text-gold transition-colors">{formatPrice(Math.max(15, shippingCost - 10))}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {isFreeShipping && shippingCost !== null && (
                      <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100 flex items-center gap-3 animate-in zoom-in-95 duration-300">
                        <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                          <Truck size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-green-700">Parabéns! Você ganhou Frete Grátis</p>
                          <p className="text-[10px] text-green-600/70">Aproveite a entrega premium por nossa conta.</p>
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
