import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, CreditCard, Truck, ShieldCheck, CheckCircle2, 
  ShoppingBag, MapPin, Phone, Mail, User as UserIcon, Lock, Copy
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
  const [paymentMethod, setPaymentMethod] = useState<'Cartão de Crédito' | 'Pix'>('Cartão de Crédito');
  const [copied, setCopied] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Generate a temporary order ID if Pix is selected, or just generate one when needed
    if (!orderId) {
      setOrderId(Math.random().toString(36).substr(2, 9).toUpperCase());
    }
  }, [orderId]);

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

    // Simulate payment processing for card
    if (paymentMethod === 'Cartão de Crédito') {
      await new Promise(resolve => setTimeout(resolve, 2500));
    }

    const currentOrderId = orderId; // Use the one generated in useEffect
    const newOrder: Order = { 
      id: currentOrderId, 
      userId: user.id,
      items: cart, 
      total: total, 
      customer: {
        name: user.name,
        email: user.email,
        address: user.address || 'Endereço não informado'
      }, 
      date: new Date().toISOString(),
      status: 'Pendente',
      paymentMethod: paymentMethod
    };

    saveOrder(newOrder);
    localStorage.removeItem('chronos_cart');
    setIsProcessing(false);
    setIsCompleted(true);
    
    // Notify other components
    window.dispatchEvent(new Event('cartUpdated'));

    // Handle WhatsApp redirection
    if (paymentMethod === 'Pix' || paymentMethod === 'Cartão de Crédito') {
      const itemsList = cart.map(item => `- ${item.quantity}x ${item.name}`).join('%0A');
      const methodText = paymentMethod === 'Pix' ? 'via Pix' : 'com Cartão de Crédito';
      const actionText = paymentMethod === 'Pix' ? 'Realizei o pagamento' : 'Gostaria de pagar';
      
      const message = `Olá! ${actionText} ${methodText} para o pedido *%23${currentOrderId}*.%0A%0A*Detalhes do Pedido:*%0A- Cliente: ${user.name}%0A- Total: ${formatPrice(total)}%0A%0A*Itens:*%0A${itemsList}%0A%0A_${paymentMethod === 'Pix' ? 'Fico no aguardo da confirmação!' : 'Aguardando link de pagamento ou instruções.'}_`;
      const whatsappUrl = `https://wa.me/${storeConfig.whatsappNumber}?text=${message}`;
      
      // Delay slightly for visual feedback before redirecting
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 1000);
    }
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
                <h2 className="text-xl font-serif">Escolha o Método de Pagamento</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => setPaymentMethod('Cartão de Crédito')}
                  className={cn(
                    "p-6 border-2 rounded-2xl flex flex-col items-center gap-3 transition-all",
                    paymentMethod === 'Cartão de Crédito' 
                      ? "border-gold bg-gold/5" 
                      : "border-gray-100 hover:border-gray-200"
                  )}
                >
                  <CreditCard size={24} className={paymentMethod === 'Cartão de Crédito' ? "text-gold" : "text-gray-400"} />
                  <span className="font-bold text-sm">Cartão de Crédito</span>
                </button>

                <button 
                  onClick={() => setPaymentMethod('Pix')}
                  className={cn(
                    "p-6 border-2 rounded-2xl flex flex-col items-center gap-3 transition-all",
                    paymentMethod === 'Pix' 
                      ? "border-gold bg-gold/5" 
                      : "border-gray-100 hover:border-gray-200"
                  )}
                >
                  <div className="w-6 h-6 flex items-center justify-center font-bold text-xs bg-gray-400 text-white rounded-full">X</div>
                  <span className="font-bold text-sm">Pix</span>
                </button>
              </div>

              {paymentMethod === 'Cartão de Crédito' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 bg-blue-50 rounded-2xl border border-dashed border-blue-200 space-y-4"
                >
                  <div className="flex items-center gap-3 text-blue-600">
                    <ShieldCheck size={20} />
                    <h3 className="font-serif text-lg">Pagamento Seguro InfinitePay</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    O pagamento por cartão de crédito será processado via <strong className="text-premium-black">InfinitePay</strong>. 
                    Estamos utilizando esta plataforma para garantir o máximo de segurança e criptografia em sua transação.
                  </p>
                  <div className="p-3 bg-white/50 rounded-xl text-[10px] text-blue-500 font-bold uppercase tracking-widest text-center">
                    Ambiente 100% Protegido
                  </div>
                </motion.div>
              )}

              {paymentMethod === 'Pix' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 bg-gray-50 rounded-2xl border border-dashed border-gold/30 space-y-6"
                >
                  <div className="text-center space-y-2">
                    <h3 className="font-serif text-lg">Pague via Pix</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Chave Aleatória de Pagamento</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between group">
                    <span className="font-mono text-sm break-all">{storeConfig.pixKey}</span>
                    <button 
                      onClick={() => {
                        if (storeConfig.pixKey) {
                          navigator.clipboard.writeText(storeConfig.pixKey);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }
                      }}
                      className="ml-4 p-2 text-gray-400 hover:text-gold hover:bg-gold/5 rounded-lg transition-all flex items-center gap-2"
                      title="Copiar Chave Pix"
                    >
                      {copied ? (
                        <>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gold">Copiado!</span>
                          <CheckCircle2 size={18} className="text-gold" />
                        </>
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                  </div>

                  <div className="p-4 bg-gold/10 rounded-xl border border-gold/20 space-y-3">
                    <div className="flex items-center gap-2 text-gold">
                      <ShieldCheck size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Instruções Importantes</span>
                    </div>
                    <ul className="text-xs text-gray-600 space-y-2 list-disc pl-4">
                      <li>Ao realizar o Pix, cole o número do pedido na <strong>descrição</strong> do pagamento.</li>
                      <li>Número do seu pedido: <strong className="text-premium-black">#{orderId}</strong></li>
                    </ul>
                  </div>
                </motion.div>
              )}

              <p className="mt-6 text-xs text-gray-400 text-center italic">
                {paymentMethod === 'Cartão de Crédito' 
                  ? "* Pagamento processado em ambiente seguro."
                  : "* O pedido será processado após a confirmação do Pix."}
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
                      {paymentMethod === 'Pix' ? 'Confirmar Pagamento Realizado' : 'Finalizar Pedido'}
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
