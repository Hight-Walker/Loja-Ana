import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, CreditCard, Truck, ShieldCheck, CheckCircle2, 
  ShoppingBag, MapPin, Phone, Mail, User as UserIcon, Lock
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Product, CartItem, Order, User, StoreConfig } from './types';
import { getProducts, saveOrder, getCurrentUser, getStoreConfig } from './lib/storage';
import { cn, formatPrice } from './lib/utils';
import { Toast, ToastType } from './components/UI';

export const CheckoutPage = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [storeConfig] = useState<StoreConfig>(getStoreConfig());
  const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({ message: '', type: 'success', isVisible: false });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);

    const savedCart = localStorage.getItem('chronos_cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (parsedCart.length === 0) {
        navigate('/');
      }
      setCart(parsedCart);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 0; // Free shipping for premium store
  const total = subtotal + shipping;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2500));

    const newOrderId = Math.random().toString(36).substr(2, 9).toUpperCase();
    const newOrder: Order = { 
      id: newOrderId, 
      userId: user.id,
      items: cart, 
      total: total, 
      customer: {
        name: user.name,
        email: user.email,
        address: user.address || 'Endereço não informado'
      }, 
      date: new Date().toISOString(),
      status: 'Processando',
      paymentMethod: 'Cartão de Crédito'
    };

    saveOrder(newOrder);
    localStorage.removeItem('chronos_cart');
    setOrderId(newOrderId);
    setIsProcessing(false);
    setIsCompleted(true);
    
    // Notify other components
    window.dispatchEvent(new Event('cartUpdated'));
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={48} />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-serif">Pedido Confirmado</h1>
            <p className="text-gray-500">Obrigado pela sua compra, {user?.name.split(' ')[0]}. Seu relógio exclusivo está sendo preparado.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Número do Pedido</p>
            <p className="text-xl font-mono font-bold text-premium-black">#{orderId}</p>
          </div>
          <div className="space-y-4">
            <Link 
              to="/" 
              className="block w-full bg-premium-black text-white py-5 rounded-xl font-bold uppercase tracking-widest hover:bg-gold transition-all"
            >
              Voltar para a Loja
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />

      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex justify-start">
            <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-premium-black transition-colors">
              <ArrowLeft size={20} />
              <span className="text-[10px] sm:text-sm font-bold uppercase tracking-widest truncate max-w-[80px] sm:max-w-none">Voltar</span>
            </Link>
          </div>
          
          <div className="flex justify-center">
            <Link to="/" className="text-xl sm:text-2xl font-serif font-bold tracking-tighter whitespace-nowrap">
              {storeConfig.name}<span className="text-gold">.</span>
            </Link>
          </div>
          
          <div className="flex justify-end">
            <div className="flex items-center gap-2 text-gray-400">
              <Lock size={16} className="shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block">Checkout Seguro</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Form */}
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-gold/10 text-gold rounded-full flex items-center justify-center">
                  <UserIcon size={20} />
                </div>
                <h2 className="text-xl font-serif">Informações do Cliente</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Nome Completo</label>
                  <div className="p-4 bg-gray-50 rounded-xl text-gray-600 font-medium">{user?.name}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">E-mail</label>
                  <div className="p-4 bg-gray-50 rounded-xl text-gray-600 font-medium">{user?.email}</div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-gold/10 text-gold rounded-full flex items-center justify-center">
                  <Truck size={20} />
                </div>
                <h2 className="text-xl font-serif">Endereço de Entrega</h2>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Endereço Completo</label>
                  <div className="p-4 bg-gray-50 rounded-xl text-gray-600 font-medium min-h-[3.5rem]">
                    {user?.address || 'Endereço não cadastrado. Por favor, atualize seu perfil.'}
                  </div>
                </div>
                {!user?.address && (
                  <Link to="/profile" className="text-gold text-sm font-bold hover:underline flex items-center gap-2">
                    Atualizar Endereço no Perfil <ArrowLeft size={14} className="rotate-180" />
                  </Link>
                )}
              </div>
            </section>

            <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-gold/10 text-gold rounded-full flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <h2 className="text-xl font-serif">Pagamento</h2>
              </div>
              <div className="p-6 border-2 border-gold bg-gold/5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-premium-black rounded flex items-center justify-center text-white text-[10px] font-bold">VISA</div>
                  <div>
                    <p className="font-bold text-sm">Cartão de Crédito</p>
                    <p className="text-xs text-gray-500">Finalizado em Checkout Seguro</p>
                  </div>
                </div>
                <CheckCircle2 size={20} className="text-gold" />
              </div>
              <p className="mt-6 text-xs text-gray-400 text-center italic">
                * Em ambiente de demonstração, o pagamento é simulado.
              </p>
            </section>
          </div>

          {/* Right Column: Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden sticky top-28">
              <div className="p-8 border-b">
                <h3 className="text-xl font-serif">Resumo do Pedido</h3>
              </div>
              <div className="p-8 space-y-6 max-h-[400px] overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-gray-400">{item.quantity}x {formatPrice(item.price)}</p>
                    </div>
                    <div className="text-sm font-bold">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-8 bg-gray-50 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Frete</span>
                  <span className="text-green-600 font-medium">Grátis</span>
                </div>
                <div className="pt-4 border-t flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total a Pagar</p>
                    <p className="text-3xl font-serif font-bold text-premium-black">{formatPrice(total)}</p>
                  </div>
                </div>
                <button 
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || !user?.address}
                  className={cn(
                    "w-full py-5 rounded-xl font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 mt-4",
                    isProcessing || !user?.address 
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                      : "bg-premium-black text-white hover:bg-gold shadow-lg hover:shadow-gold/20"
                  )}
                >
                  {isProcessing ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Processando...
                    </>
                  ) : (
                    <>
                      Finalizar Pedido
                      <ArrowLeft size={20} className="rotate-180" />
                    </>
                  )}
                </button>
                {!user?.address && (
                  <p className="text-[10px] text-red-500 text-center font-bold uppercase tracking-widest mt-2">
                    Cadastre um endereço para continuar
                  </p>
                )}
              </div>
              <div className="p-6 flex items-center justify-center gap-6 border-t border-gray-100">
                <ShieldCheck size={20} className="text-gray-300" />
                <div className="flex gap-2">
                  <div className="w-8 h-5 bg-gray-100 rounded" />
                  <div className="w-8 h-5 bg-gray-100 rounded" />
                  <div className="w-8 h-5 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
