import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, ArrowLeft, Trash2, Plus, Minus, 
  ArrowRight, Truck, ShieldCheck, CreditCard, 
  ChevronRight, Star, MapPin, Package, RefreshCw,
  Info
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { CartItem, StoreConfig, User } from './types';
import { getStoreConfig, getCurrentUser } from './lib/storage';
import { cn, formatPrice } from './lib/utils';
import { Toast, ToastType } from './components/UI';

export const CartPage = () => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('chronos_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [storeConfig] = useState<StoreConfig>(getStoreConfig());
  const [user] = useState<User | null>(getCurrentUser());
  const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({ message: '', type: 'success', isVisible: false });
  const [cep, setCep] = useState('');
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<{ name: string, price: number, deliveryTime: string, icon: any }[]>([]);
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const navigate = useNavigate();

  // Address logic
  useEffect(() => {
    if (user?.address) {
      const match = user.address.match(/\d{5}-?\d{3}/);
      if (match) {
        setCep(match[0].replace('-', ''));
        setUseSavedAddress(true);
      }
    }
  }, [user]);

  useEffect(() => {
    const handleCartUpdate = () => {
      const saved = localStorage.getItem('chronos_cart');
      const parsed = saved ? JSON.parse(saved) : [];
      setCart(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(parsed)) {
          return parsed;
        }
        return prev;
      });
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

  const calculateShipping = async (targetCep?: string) => {
    const cepToCalc = targetCep || cep;
    if (cepToCalc.length < 8) {
      setToast({ message: 'Por favor, insira um CEP válido', type: 'error', isVisible: true });
      return;
    }

    setIsCalculating(true);
    
    try {
      // Simulate real calculation based on state via ViaCEP
      const response = await fetch(`https://viacep.com.br/ws/${cepToCalc}/json/`);
      const data = await response.json();

      if (data.erro) {
        throw new Error('CEP não encontrado');
      }

      // Simulation of costs based on destination state
      // SP, RJ, MG, ES -> Sudeste
      // PR, SC, RS -> Sul
      // etc.
      const stateCosts: Record<string, number> = {
        'SP': 22, 'RJ': 28, 'MG': 28, 'ES': 28,
        'PR': 35, 'SC': 35, 'RS': 35,
        'DF': 40, 'GO': 45, 'MS': 45, 'MT': 50,
        'BA': 55, 'PE': 60, 'CE': 60, 'RN': 65,
        'AM': 95, 'PA': 85, 'RR': 110
      };

      const basePrice = stateCosts[data.uf] || 75;
      
      setShippingOptions([
        { 
          name: 'SEDEX Prime', 
          price: basePrice, 
          deliveryTime: data.uf === 'SP' ? '1-2 dias úteis' : '2-4 dias úteis', 
          icon: Truck 
        },
        { 
          name: 'PAC Exclusive', 
          price: Math.max(15, Math.floor(basePrice * 0.6)), 
          deliveryTime: data.uf === 'SP' ? '3-5 dias úteis' : '5-10 dias úteis', 
          icon: Package 
        }
      ]);

      setShippingCost(basePrice);
      setToast({ message: `Endereço identificado: ${data.localidade} - ${data.uf}`, type: 'success', isVisible: true });
    } catch (error) {
      setToast({ message: 'Erro ao calcular frete. Verifique o CEP.', type: 'error', isVisible: true });
      setShippingCost(null);
    } finally {
      setIsCalculating(false);
    }
  };

  // Auto calculate if using saved address
  useEffect(() => {
    if (useSavedAddress && cep.length === 8) {
      calculateShipping(cep);
    }
  }, [useSavedAddress]);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const freeShippingThreshold = storeConfig.freeShippingMinAmount || 20000;
  const isFreeShipping = storeConfig.freeShippingEnabled && subtotal >= freeShippingThreshold;
  
  const shipping = isFreeShipping ? 0 : (shippingCost !== null ? shippingCost : 0);
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

      {/* Minimalist Header */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex justify-start">
            <Link to="/" className="flex items-center gap-3 text-premium-black hover:text-gold transition-all group py-2">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">Continuar Comprando</span>
            </Link>
          </div>
          
          <div className="flex justify-center">
            <Link to="/" className="text-xl font-serif font-bold tracking-tighter">
              {storeConfig.name}<span className="text-gold">.</span>
            </Link>
          </div>
          
          <div className="flex justify-end">
            <div className="flex items-center gap-4 text-gray-400">
              <ShieldCheck size={18} className="shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-widest hidden lg:block">Checkout Seguro</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Left: Cart Items */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            <div className="flex flex-col sm:flex-row items-baseline sm:items-end justify-between border-b border-gray-100 pb-8 gap-4">
              <h1 className="text-4xl md:text-6xl font-serif">Sua <span className="italic text-gold">Sacola</span></h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-full">
                {cart.length} {cart.length === 1 ? 'item' : 'itens'}
              </p>
            </div>

            <AnimatePresence mode="popLayout">
              {cart.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-20 flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                    <ShoppingBag size={40} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-serif">Carrinho Vazio</h2>
                    <p className="text-sm text-gray-400 font-light max-w-xs mx-auto">
                      Descubra nossa coleção exclusiva e encontre sua próxima peça.
                    </p>
                  </div>
                  <Link 
                    to="/" 
                    className="inline-block bg-premium-black text-white px-10 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gold transition-all"
                  >
                    Ver Coleções
                  </Link>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {cart.map((item) => (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col sm:flex-row gap-6 p-4 rounded-2xl bg-white border border-gray-100 hover:shadow-lg hover:shadow-black/5 transition-all"
                    >
                      <div className="w-full sm:w-32 aspect-square sm:aspect-[3/4] bg-gray-50 rounded-xl overflow-hidden relative shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer" 
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gold mb-1">{item.category}</p>
                              <h3 className="text-lg md:text-xl font-serif font-bold leading-tight">{item.name}</h3>
                            </div>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-6">
                          <div className="flex items-center bg-gray-50 rounded-lg p-1">
                            <button 
                              onClick={() => updateQty(item.id, -1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md transition-all"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                            <button 
                              onClick={() => updateQty(item.id, 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md transition-all"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <p className="text-lg font-serif font-bold text-premium-black">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-gray-50 rounded-[2rem] p-6 sm:p-8 space-y-8 border border-gray-100">
                <h2 className="text-xl font-serif font-bold">Resumo do Pedido</h2>
                
                <div className="space-y-6">
                  {/* Shipping Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-premium-black">
                        <Truck size={14} className="text-gold" />
                        <span>Entrega Premium</span>
                      </div>
                      {isFreeShipping && (
                        <span className="bg-green-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                          Grátis
                        </span>
                      )}
                    </div>

                    {user?.address && !useSavedAddress && (
                      <button 
                        onClick={() => {
                          const match = user.address?.match(/\d{5}-?\d{3}/);
                          if (match) {
                            setCep(match[0].replace('-', ''));
                            setUseSavedAddress(true);
                          }
                        }}
                        className="w-full bg-white border border-gray-100 p-3 rounded-xl flex items-center gap-3 hover:border-gold/30 transition-all text-left"
                      >
                        <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center text-gold">
                          <MapPin size={14} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-[9px] font-bold uppercase text-gray-400">Usar endereço salvo</p>
                          <p className="text-[10px] text-gray-600 truncate">{user.address}</p>
                        </div>
                        <ChevronRight size={14} className="text-gray-300" />
                      </button>
                    )}

                    {useSavedAddress && (
                      <div className="bg-white border border-gold/20 p-4 rounded-xl space-y-3 relative overflow-hidden group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-gold" />
                            <span className="text-[10px] font-bold text-premium-black uppercase">Entrega em: {cep.replace(/(\d{5})(\d{3})/, '$1-$2')}</span>
                          </div>
                          <button 
                            onClick={() => {
                              setUseSavedAddress(false);
                              setShippingCost(null);
                              setShippingOptions([]);
                            }}
                            className="text-[9px] font-bold text-gold uppercase hover:underline"
                          >
                            Alterar
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-tight line-clamp-2 italic">"{user?.address}"</p>
                      </div>
                    )}

                    {!useSavedAddress && (
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="CEP (00000-000)"
                          value={cep}
                          onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                          className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-gold/10 outline-none"
                        />
                        <button 
                          onClick={() => calculateShipping()}
                          disabled={isCalculating || cep.length < 8}
                          className="bg-premium-black text-white px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-all disabled:opacity-50"
                        >
                          {isCalculating ? <RefreshCw size={14} className="animate-spin" /> : 'Calcular'}
                        </button>
                      </div>
                    )}

                    {shippingOptions.length > 0 && !isFreeShipping && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        {shippingOptions.map((opt, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => setShippingCost(opt.price)}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                              shippingCost === opt.price ? "border-gold bg-white shadow-sm" : "border-gray-100 bg-white/50 hover:border-gray-200"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <opt.icon size={16} className={shippingCost === opt.price ? "text-gold" : "text-gray-400"} />
                              <div>
                                <p className="text-xs font-bold text-premium-black">{opt.name}</p>
                                <p className="text-[10px] text-gray-400">{opt.deliveryTime}</p>
                              </div>
                            </div>
                            <span className="text-sm font-bold">{formatPrice(opt.price)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {isFreeShipping && (
                      <div className="p-4 bg-green-50 rounded-xl flex items-center gap-3 border border-green-100">
                        <Truck size={16} className="text-green-500" />
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-green-700 uppercase">Frete Grátis Ativado</p>
                          <p className="text-[9px] text-green-600">Sua compra atingiu o valor de cortesia.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-6 border-t border-gray-100">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-bold uppercase tracking-widest">Subtotal</span>
                      <span className="font-bold">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-bold uppercase tracking-widest">Frete</span>
                      <span className={cn("font-bold", isFreeShipping ? "text-green-600" : "text-premium-black")}>
                        {isFreeShipping ? 'Grátis' : (shippingCost !== null ? formatPrice(shippingCost) : '—')}
                      </span>
                    </div>
                    <div className="pt-4 flex justify-between items-end">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Total Final</p>
                        <p className="text-3xl font-serif font-bold text-premium-black">{formatPrice(total)}</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    className="w-full bg-premium-black text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-gold transition-all shadow-xl hover:shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                  >
                    Finalizar Pedido
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              <div className="p-6 bg-white border border-gray-100 rounded-[2rem] flex items-center gap-4">
                <ShieldCheck size={24} className="text-gold shrink-0" />
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest">Ambiente Seguro</p>
                  <p className="text-[9px] text-gray-400 leading-tight">Sua transação é protegida por criptografia de nível militar.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-50 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-300">
          Desenvolvido por Gustavo Walker
        </p>
      </footer>
    </div>
  );
};

