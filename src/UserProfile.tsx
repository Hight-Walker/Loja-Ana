import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, ShoppingBag, MapPin, Phone, Mail, Calendar, Hash, ArrowLeft, LogOut, Package, ChevronRight, Lock, Code, Clock, PackageCheck, Send, CheckCircle2, Truck, Copy, Printer } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Order } from './types';
import { getCurrentUser, getOrders, setCurrentUser, updateUserProfile as updateUser, updateOrder, getStoreConfig } from './lib/storage';
import { formatPrice, cn } from './lib/utils';
import { Toast, ToastType } from './components/UI';
import { CEPInput } from './components/CEPInput';

export const UserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({ message: '', type: 'success', isVisible: false });
  const [activeTab, setActiveTab] = useState<'info' | 'orders'>('info');
  const toastTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = React.useRef(true);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const init = async () => {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);
      setFormData(currentUser);
      
      // Filter orders for this user
      const allOrders = await getOrders();
      setOrders(allOrders.filter(o => o.userId === currentUser.id));
      
      setTimeout(() => {
        isInitialMount.current = false;
      }, 1000);
    };
    init();
  }, [navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  useEffect(() => {
    if (isInitialMount.current) return;
    if (formData && user && JSON.stringify(formData) !== JSON.stringify(user)) {
      const save = async () => {
        await updateUser(formData);
        // Update current session too
        setCurrentUser(formData);
        setUser(formData);
        
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => {
          setToast({ message: 'Informações atualizadas!', type: 'success', isVisible: true });
        }, 1000);
      };
      save();
    }
  }, [formData, user]);

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  const handleConfirmPayment = async (order: Order) => {
    const updatedOrder = { ...order, status: 'Pago' as any };
    await updateOrder(updatedOrder);
    
    // Refresh orders list
    const currentUser = getCurrentUser();
    if (currentUser) {
      const allOrders = await getOrders();
      setOrders(allOrders.filter(o => o.userId === currentUser.id));
    }
    
    setToast({ message: 'Pagamento confirmado com sucesso!', type: 'success', isVisible: true });
  };

  const handlePrintOrder = async (order: Order) => {
    const storeConfig = await getStoreConfig();
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Recibo de Pedido - #${order.id}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; mb: 20px; }
          .info-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin: 20px 0; }
          .label { font-size: 10px; text-transform: uppercase; color: #999; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { text-align: left; padding: 10px; border-bottom: 1px solid #eee; }
          .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${storeConfig.name}</h1>
          <p>Comprovante de Pedido #${order.id}</p>
        </div>
        <div class="info-grid">
          <div>
            <p class="label">Dados do Cliente</p>
            <p><strong>${order.customer.name}</strong></p>
            <p>${order.customer.email}</p>
            <p>${order.customer.address}</p>
          </div>
          <div>
            <p class="label">Informações do Pedido</p>
            <p>Data: ${new Date(order.date).toLocaleDateString('pt-BR')}</p>
            <p>Método: ${order.paymentMethod}</p>
            <p>Status: ${order.status}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Unit.</th>
              <th>Qtd.</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${formatPrice(item.price)}</td>
                <td>${item.quantity}</td>
                <td>${formatPrice(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">Total: ${formatPrice(order.total)}</div>
        <script>window.print(); setTimeout(() => window.close(), 500);</script>
      </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  if (!user || !formData) return null;

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background Image with Overlay */}
      {/* Background with subtle animation */}
      <div className="absolute inset-0 z-0 h-[50vh]">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
          src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=1920" 
          alt="Luxury Watch Background" 
          className="w-full h-full object-cover opacity-30"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-premium-black via-premium-black/80 to-gray-50" />
      </div>

      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />
      {/* Header */}
      <header className="relative z-10 text-white py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 bg-gold/20 rounded-full flex items-center justify-center border-2 border-gold/30 backdrop-blur-sm"
            >
              <UserIcon size={48} className="text-gold" />
            </motion.div>
            <div>
              <motion.h1 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-3xl font-serif mb-1"
              >
                {user.name}
              </motion.h1>
              <motion.p 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-gray-400 text-sm uppercase tracking-widest"
              >
                {user.role === 'admin' ? 'Administrador' : user.role === 'dev' ? 'Modo Desenvolvedor' : 'Cliente Premium'}
              </motion.p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {user.role === 'dev' && (
              <button 
                onClick={() => navigate('/dev-control')}
                className="flex items-center gap-2 px-6 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl hover:bg-green-500/30 transition-all font-bold uppercase tracking-widest text-xs"
              >
                <Code size={16} /> Painel Dev
              </button>
            )}
            {user.role === 'admin' && (
              <button 
                onClick={() => navigate('/manager')}
                className="flex items-center gap-2 px-6 py-2 bg-gold/20 text-gold border border-gold/30 rounded-xl hover:bg-gold/30 transition-all font-bold uppercase tracking-widest text-xs"
              >
                Painel Admin
              </button>
            )}
            <Link to="/" className="flex items-center gap-3 text-premium-black hover:text-gold transition-all group py-2 font-bold uppercase tracking-widest text-[10px] sm:text-xs">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              </div>
              <span>Voltar para a Loja</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="bg-white/10 hover:bg-red-500/20 hover:text-red-500 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all flex items-center gap-2 backdrop-blur-sm"
            >
              <LogOut size={16} /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 -mt-10 pb-32">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-8 sm:mb-12">
          <button 
            onClick={() => setActiveTab('info')}
            className={cn(
              "w-full sm:w-auto px-6 sm:px-12 py-4 sm:py-5 rounded-xl sm:rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] transition-all duration-500 flex items-center justify-center sm:justify-start gap-3 relative overflow-hidden",
              activeTab === 'info' 
                ? "bg-premium-black text-white shadow-xl border border-white/10" 
                : "bg-white/80 backdrop-blur-md text-gray-400 hover:text-gold hover:bg-white border border-gray-100"
            )}
          >
            <UserIcon size={14} className={cn("transition-colors", activeTab === 'info' ? "text-gold" : "text-gray-300")} />
            <span className="relative z-10">Meu Perfil</span>
            {activeTab === 'info' && (
              <motion.div layoutId="active-pill" className="absolute bottom-0 left-0 right-0 h-1 bg-gold" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={cn(
              "w-full sm:w-auto px-6 sm:px-12 py-4 sm:py-5 rounded-xl sm:rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] transition-all duration-500 flex items-center justify-center sm:justify-start gap-3 relative overflow-hidden",
              activeTab === 'orders' 
                ? "bg-premium-black text-white shadow-xl border border-white/10" 
                : "bg-white/80 backdrop-blur-md text-gray-400 hover:text-gold hover:bg-white border border-gray-100"
            )}
          >
            <ShoppingBag size={14} className={cn("transition-colors", activeTab === 'orders' ? "text-gold" : "text-gray-300")} />
            <span className="relative z-10">Meus Pedidos</span>
            {activeTab === 'orders' && (
              <motion.div layoutId="active-pill" className="absolute bottom-0 left-0 right-0 h-1 bg-gold" />
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'info' ? (
            <motion.div 
              key="info-tab"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100"
            >
              {/* Professional Header inside Info */}
              <div className="p-6 md:p-14 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-gray-50/50 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-8 md:w-1.5 md:h-10 bg-gold rounded-full" />
                  <div>
                    <h2 className="text-lg md:text-2xl font-serif font-bold uppercase tracking-[0.2em] text-premium-black">Configurações de Perfil</h2>
                    <p className="text-[9px] md:text-[10px] text-gray-400 font-bold mt-0.5 md:mt-1 uppercase tracking-[0.3em]">Gerencie sua identidade exclusiva Chronos.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl border border-gray-100 shadow-sm w-fit">
                  <Clock size={12} className="text-gold" />
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500">Acesso Seguro</span>
                </div>
              </div>

              <div className="p-6 md:p-14">
                <div className="space-y-8 md:space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-6 md:gap-y-12">
                    {/* User Fields */}
                    {[
                      { icon: UserIcon, label: 'Nome de Colecionador', value: formData.name, key: 'name', type: 'text' },
                      { icon: Mail, label: 'E-mail de Contato', value: formData.email, key: 'email', type: 'email' },
                      { icon: Hash, label: 'CPF / Identidade', value: formData.cpf, key: 'cpf', type: 'text', disabled: true },
                      { icon: Phone, label: 'Telefone Privado', value: formData.phone, key: 'phone', type: 'tel', placeholder: '(00) 00000-0000' },
                      { icon: Calendar, label: 'Data de Nascimento', value: formData.birthDate, key: 'birthDate', type: 'date' },
                    ].map((field) => (
                      <div key={field.key} className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 flex items-center gap-3 ml-1">
                          <field.icon size={12} className="text-gold" /> 
                          {field.label}
                        </label>
                        <input 
                          type={field.type} 
                          disabled={field.disabled}
                          value={field.value || ''} 
                          placeholder={field.placeholder}
                          onChange={e => !field.disabled && setFormData({...formData, [field.key]: e.target.value})}
                          className={cn(
                            "w-full bg-white border border-gray-200 rounded-2xl h-[64px] px-6 outline-none transition-all duration-300 text-sm font-medium",
                            field.disabled 
                              ? "bg-gray-50/50 cursor-not-allowed text-gray-400 border-dashed" 
                              : "focus:ring-4 focus:ring-gold/5 focus:border-gold hover:border-gold/30 shadow-sm focus:shadow-md"
                          )}
                        />
                      </div>
                    ))}

                    {user.role === 'admin' && (
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 flex items-center gap-3 ml-1">
                          <Lock size={12} className="text-gold" /> Chave de Segurança
                        </label>
                        <input 
                          type="text" 
                          value={formData.password || ''} 
                          onChange={e => setFormData({...formData, password: e.target.value})}
                          className="w-full bg-white border border-gray-200 rounded-2xl h-[64px] px-6 outline-none focus:ring-4 focus:ring-gold/5 focus:border-gold transition-all text-sm font-mono shadow-sm focus:shadow-md"
                          placeholder="••••••••"
                        />
                      </div>
                    )}

                    <div className="md:col-span-2 pt-8 md:pt-12 mt-4 md:mt-8 border-t border-gray-100">
                      <div className="flex items-center gap-4 mb-6 md:mb-8">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-gold/10 rounded-lg md:rounded-xl flex items-center justify-center">
                          <MapPin size={16} className="text-gold" />
                        </div>
                        <div>
                          <h3 className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-premium-black">Logística de Entrega</h3>
                          <p className="text-[8px] md:text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Endereço principal para remessa de coleções.</p>
                        </div>
                      </div>
                      <CEPInput 
                        value={formData.address || ''} 
                        onChange={(address) => setFormData({...formData, address})}
                        minimal={true}
                        className="!p-0 !bg-transparent !border-none !shadow-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="orders-tab"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100"
            >
              <div className="p-6 md:p-14 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 bg-gradient-to-r from-gray-50/50 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-8 md:w-1.5 md:h-12 bg-gold rounded-full" />
                  <div>
                    <h2 className="text-xl md:text-3xl font-serif font-bold uppercase tracking-[0.2em] text-premium-black">Histórico de Pedidos</h2>
                    <p className="text-[9px] md:text-[10px] text-gray-400 font-bold mt-0.5 md:mt-1 uppercase tracking-[0.3em]">Registro oficial de suas transações na Chronos.</p>
                  </div>
                </div>
                <div className="bg-premium-black text-white px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] inline-flex items-center justify-center shadow-xl shadow-premium-black/20 w-fit">
                  {orders.length} {orders.length === 1 ? 'Registro' : 'Registros'}
                </div>
              </div>

              <div className="p-0">
                {orders.length > 0 ? (
                   <div className="divide-y divide-gray-50">
                    {orders.slice().reverse().map((order) => (
                      <div 
                        key={order.id} 
                        className="p-6 md:p-12 hover:bg-gray-50/50 transition-all duration-500"
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 md:gap-12">
                          <div className="space-y-8 md:space-y-10 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                              <div className="bg-premium-black text-white px-4 py-2 rounded-lg text-[10px] font-mono font-bold tracking-[0.2em] shadow-lg w-fit">
                                Pedido: #{order.id}
                              </div>
                              <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
                                <Calendar size={12} className="text-gold" />
                                {new Date(order.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                              <div className="flex -space-x-3 sm:-space-x-5">
                                {order.items.map((item, idx) => (
                                  <motion.div 
                                    whileHover={{ y: -5, scale: 1.1, zIndex: 10 }}
                                    key={idx} 
                                    className="relative inline-block h-12 w-12 sm:h-20 sm:w-20 rounded-full ring-2 sm:ring-4 ring-white overflow-hidden bg-gray-100 shadow-lg transition-all"
                                  >
                                    <img src={item.image || undefined} alt={item.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                  </motion.div>
                                ))}
                              </div>
                              {order.items.length > 3 && (
                                <div className="pl-2 sm:pl-4 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                  + {order.items.length - 3} itens exclusivos
                                </div>
                              )}
                            </div>
 
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                              <div className="flex flex-col">
                                <span className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] text-gray-400 font-bold mb-1 md:mb-2">Montante</span>
                                <span className="text-base md:text-xl font-serif font-bold text-premium-black">{formatPrice(order.total)}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] text-gray-400 font-bold mb-1 md:mb-2">Método</span>
                                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">{order.paymentMethod}</span>
                              </div>
                              {order.trackingCode && (
                                <div className="flex flex-col col-span-2 space-y-2 md:space-y-3">
                                  <span className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] text-gray-400 font-bold">Logística</span>
                                  <div className="flex flex-col gap-3 md:gap-4">
                                    <div className="flex items-center gap-2 md:gap-3 bg-gray-100/50 p-2 md:p-3 rounded-lg md:rounded-xl border border-gray-200/50">
                                      <Truck size={12} className="text-gold" />
                                      <div className="flex flex-col">
                                        <span className="text-[7px] md:text-[8px] uppercase tracking-widest text-gray-400 font-bold">Rastreio</span>
                                        <span className="text-[10px] md:text-xs font-mono font-bold text-premium-black transition-all truncate max-w-[100px] sm:max-w-none">{order.trackingCode}</span>
                                      </div>
                                      <button 
                                        onClick={() => {
                                          navigator.clipboard.writeText(order.trackingCode!);
                                          setToast({ message: 'Rastreador copiado!', type: 'success', isVisible: true });
                                        }}
                                        className="ml-auto p-1.5 text-gray-300 hover:text-gold transition-colors"
                                        title="Copiar Código"
                                      >
                                        <Copy size={12} />
                                      </button>
                                    </div>
                                    <a 
                                      href={`https://rastreamento.correios.com.br/app/index.php?codigo=${order.trackingCode}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-full bg-gold/10 hover:bg-gold text-gold hover:text-white border border-gold/20 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all duration-300"
                                    >
                                      <Send size={12} /> Rastrear nos Correios
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-start md:items-end gap-4 md:gap-6 min-w-0 sm:min-w-[240px]">
                            <div className={cn(
                              "flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] shadow-xl w-fit",
                              order.status === 'Pendente' ? "bg-amber-50 text-amber-600 border border-amber-100 shadow-amber-500/10" :
                              order.status === 'Pago' ? "bg-green-50 text-green-600 border border-green-100 shadow-green-500/10" :
                              order.status === 'Processando' ? "bg-blue-50 text-blue-600 border border-blue-100 shadow-blue-500/10" :
                              order.status === 'Enviado' ? "bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-indigo-500/10" :
                              order.status === 'Entregue' ? "bg-green-50 text-green-600 border border-green-100 shadow-green-500/10" :
                              "bg-red-50 text-red-600 border border-red-100 shadow-red-500/10"
                            )}>
                              {order.status === 'Pendente' && <Clock size={12} className="animate-pulse" />}
                              {order.status === 'Pago' && <CheckCircle2 size={12} />}
                              {order.status === 'Processando' && <PackageCheck size={12} />}
                              {order.status === 'Enviado' && <Send size={12} />}
                              {order.status === 'Entregue' && <CheckCircle2 size={12} />}
                              {order.status}
                            </div>
                            {order.status === 'Pendente' && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handlePrintOrder(order)}
                                  className="p-3 bg-gray-100 text-gray-500 rounded-xl hover:bg-gold hover:text-white transition-all shadow-md active:scale-95"
                                  title="Imprimir Recibo"
                                >
                                  <Printer size={16} />
                                </button>
                                <button
                                  onClick={() => handleConfirmPayment(order)}
                                  className="group flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gold text-premium-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-premium-black hover:text-gold transition-all shadow-lg active:scale-95"
                                >
                                  <Lock size={12} className="group-hover:hidden" />
                                  <CheckCircle2 size={12} className="hidden group-hover:block" />
                                  Confirmar Pagamento
                                </button>
                              </div>
                            )}
                            {order.status !== 'Pendente' && (
                              <button
                                onClick={() => handlePrintOrder(order)}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-white transition-all shadow-md active:scale-95 w-full"
                              >
                                <Printer size={14} /> Imprimir Recibo
                              </button>
                            )}
                            <div className="md:text-right">
                              <p className="text-[9px] md:text-[10px] text-gray-400 font-bold leading-relaxed uppercase tracking-[0.3em] bg-gray-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-gray-100 max-w-[280px]">
                                {order.status === 'Pendente' && 'Aguardando validação do centro financeiro.'}
                                {order.status === 'Pago' && 'Pagamento recebido. Seu pedido iniciará a preparação.'}
                                {order.status === 'Processando' && 'Embalagem especial e seguro em preparação.'}
                                {order.status === 'Enviado' && 'Despachado via transporte de alta segurança.'}
                                {order.status === 'Entregue' && 'Transferência de custódia realizada.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-32 text-center space-y-8">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gold/5 blur-3xl rounded-full" />
                      <div className="relative w-20 h-20 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto border border-gray-100">
                        <ShoppingBag size={32} />
                      </div>
                    </div>
                    <div className="space-y-4 max-w-xs mx-auto">
                      <h3 className="text-xl font-serif font-bold text-premium-black tracking-tight">Galeria Vazia</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] leading-relaxed">Você ainda não possui aquisições registradas em sua coleção privada.</p>
                      <div className="pt-8">
                        <Link to="/" className="inline-block bg-premium-black text-white px-12 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-gold transition-all shadow-xl shadow-premium-black/20">Explorar Boutique</Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
