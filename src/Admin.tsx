import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Package, ShoppingCart, BarChart3, Plus, Edit2, Trash2, 
  TrendingUp, DollarSign, Users, ArrowUpRight, ArrowDownRight, LogOut, X, Save, Image as ImageIcon,
  Store, Globe, Instagram, Mail, Phone, MapPin, Menu, AlertCircle, Truck, User as ProfileIcon, Hash, Calendar, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product, Order, AnalyticsData, User, StoreConfig, OrderStatus, PaymentMethod } from './types';
import { getProducts, saveProducts, getOrders, getUsers, setCurrentUser, clearAllSessions, getStoreConfig, saveStoreConfig, updateOrder, deleteOrder, updateUser, getCurrentUser } from './lib/storage';
import { formatPrice, cn } from './lib/utils';
import { Toast, Modal, ToastType } from './components/UI';

// --- Admin Components ---

const StatCard = ({ title, value, icon: Icon, trend, trendValue }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-gray-50 rounded-xl text-gold">
        <Icon size={24} />
      </div>
      {trend && (
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
          trend === 'up' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
        )}>
          {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trendValue}
        </div>
      )}
    </div>
    <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const ProductModal = ({ product, onClose, onSave }: { product: Product | null, onClose: () => void, onSave: (p: Product) => void }) => {
  const [formData, setFormData] = useState<Product>(product || {
    id: Math.random().toString(36).substr(2, 9),
    name: '',
    price: 0,
    description: '',
    image: '',
    category: 'Luxo',
    isBestSeller: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b flex items-center justify-between">
          <h2 className="text-2xl font-serif">{product ? 'Editar Produto' : 'Novo Produto'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Nome</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Preço (R$)</label>
              <input 
                required 
                type="number" 
                step="0.01"
                value={formData.price === 0 ? '' : formData.price} 
                onChange={e => {
                  const val = e.target.value;
                  setFormData({...formData, price: val === '' ? 0 : Number(val)});
                }} 
                className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold" 
                placeholder="0.00"
              />
            </div>
          </div>

          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">URL da Imagem</label>
            <div className="flex gap-4">
              <input required type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="flex-1 bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold" />
              {formData.image && (
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Descrição</label>
            <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Categoria</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold">
                <option value="Luxo">Luxo</option>
                <option value="Minimalista">Minimalista</option>
                <option value="Clássico">Clássico</option>
                <option value="Esportivo">Esportivo</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-8">
              <input type="checkbox" id="bestseller" checked={formData.isBestSeller} onChange={e => setFormData({...formData, isBestSeller: e.target.checked})} className="w-5 h-5 accent-gold" />
              <label htmlFor="bestseller" className="text-sm font-medium">Marcar como Mais Vendido</label>
            </div>
          </div>

          <button type="submit" className="w-full bg-premium-black text-white py-5 rounded-xl font-bold uppercase tracking-widest hover:bg-gold transition-all duration-300 flex items-center justify-center gap-3">
            <Save size={20} />
            Salvar Alterações
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const OrderModal = ({ order, onClose, onSave }: { order: Order, onClose: () => void, onSave: (o: Order) => void }) => {
  const [formData, setFormData] = useState<Order>({ ...order });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const statuses: OrderStatus[] = ['Pendente', 'Processando', 'Enviado', 'Entregue', 'Cancelado'];
  const paymentMethods: PaymentMethod[] = ['Cartão de Crédito', 'Boleto', 'Pix'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b flex items-center justify-between">
          <h2 className="text-2xl font-serif">Editar Pedido #{order.id}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Status do Pedido</label>
              <select 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value as OrderStatus})} 
                className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold"
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Forma de Pagamento</label>
              <select 
                value={formData.paymentMethod} 
                onChange={e => setFormData({...formData, paymentMethod: e.target.value as PaymentMethod})} 
                className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold"
              >
                {paymentMethods.map(pm => <option key={pm} value={pm}>{pm}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Informações do Cliente</label>
            <div className="p-4 bg-gray-50 rounded-xl space-y-1">
              <p className="text-sm font-medium">{formData.customer.name}</p>
              <p className="text-xs text-gray-500">{formData.customer.email}</p>
              <p className="text-xs text-gray-500">{formData.customer.address}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Itens do Pedido</label>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {formData.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-400">{item.quantity}x {formatPrice(item.price)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t flex justify-between items-center">
            <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Total do Pedido</span>
            <span className="text-2xl font-serif font-bold text-gold">{formatPrice(formData.total)}</span>
          </div>

          <button type="submit" className="w-full bg-premium-black text-white py-5 rounded-xl font-bold uppercase tracking-widest hover:bg-gold transition-all duration-300 flex items-center justify-center gap-3">
            <Save size={20} />
            Salvar Alterações
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// --- Main Admin Page ---

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(getStoreConfig());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  
  // Profile State
  const [user, setUser] = useState<User | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState<User | null>(null);
  
  // Custom UI State
  const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({ message: '', type: 'success', isVisible: false });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, type: 'product' | 'order', id: string | null }>({ isOpen: false, type: 'product', id: null });
  
  const navigate = useNavigate();

  useEffect(() => {
    setProducts(getProducts());
    setOrders(getOrders());
    setUsers(getUsers());
    
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setProfileFormData(currentUser);
    }
  }, []);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileFormData) {
      updateUser(profileFormData);
      // Update current session too
      const isPersistent = !!localStorage.getItem('chronos_current_user');
      setCurrentUser(profileFormData, isPersistent);
      setUser(profileFormData);
      setIsEditingProfile(false);
      showToast('Suas informações foram atualizadas com sucesso!');
    }
  };

  const handleSaveProduct = (product: Product) => {
    let newProducts;
    if (products.find(p => p.id === product.id)) {
      newProducts = products.map(p => p.id === product.id ? product : p);
      showToast('Produto atualizado com sucesso!');
    } else {
      newProducts = [...products, product];
      showToast('Produto criado com sucesso!');
    }
    setProducts(newProducts);
    saveProducts(newProducts);
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveOrder = (order: Order) => {
    updateOrder(order);
    setOrders(getOrders());
    setEditingOrder(null);
    showToast('Pedido atualizado com sucesso!');
  };

  const handleDeleteProduct = (id: string) => {
    setDeleteModal({ isOpen: true, type: 'product', id });
  };

  const handleDeleteOrder = (id: string) => {
    setDeleteModal({ isOpen: true, type: 'order', id });
  };

  const confirmDelete = () => {
    if (deleteModal.id) {
      if (deleteModal.type === 'product') {
        const newProducts = products.filter(p => p.id !== deleteModal.id);
        setProducts(newProducts);
        saveProducts(newProducts);
        showToast('Produto excluído com sucesso!', 'info');
      } else {
        deleteOrder(deleteModal.id);
        setOrders(getOrders());
        showToast('Pedido excluído com sucesso!', 'info');
      }
      setDeleteModal({ isOpen: false, type: 'product', id: null });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for localStorage
        showToast('A imagem é muito grande. Por favor, escolha uma imagem menor que 1MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setStoreConfig({ ...storeConfig, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveStoreConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoreConfig(storeConfig);
    showToast('Configurações da loja salvas com sucesso!');
    // Trigger a custom event to notify other components (like Storefront)
    window.dispatchEvent(new Event('storeConfigUpdated'));
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalSalesCount = orders.length;

  // Simple Analytics
  const productSalesMap: Record<string, number> = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      productSalesMap[item.name] = (productSalesMap[item.name] || 0) + item.quantity;
    });
  });

  const sortedSales = Object.entries(productSalesMap).sort((a, b) => b[1] - a[1]);
  const bestSellers = sortedSales.slice(0, 5);
  const leastSold = sortedSales.reverse().slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Toast Notification */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, type: 'product', id: null })}
        title="Confirmar Exclusão"
        footer={
          <>
            <button 
              onClick={() => setDeleteModal({ isOpen: false, type: 'product', id: null })}
              className="px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all"
            >
              Cancelar
            </button>
            <button 
              onClick={confirmDelete}
              className="bg-red-600 text-white px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-red-700 transition-all"
            >
              Excluir
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
            <AlertCircle size={32} />
          </div>
          <p className="text-gray-600">Tem certeza que deseja excluir este {deleteModal.type === 'product' ? 'produto' : 'pedido'}? Esta ação não pode ser desfeita.</p>
        </div>
      </Modal>

      {/* Mobile Header */}
      <div className="md:hidden bg-premium-black text-white p-4 flex items-center justify-between sticky top-0 z-[60]">
        <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer">
          {storeConfig.logo ? (
            <img src={storeConfig.logo} alt={storeConfig.name} className="h-6 w-auto object-contain" referrerPolicy="no-referrer" />
          ) : (
            <span className="text-xl font-serif font-bold tracking-tighter">{storeConfig.name}<span className="text-gold">.</span></span>
          )}
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "w-64 bg-premium-black text-white flex flex-col fixed h-full z-[55] transition-transform duration-300 md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div 
          onClick={() => navigate('/')}
          className="p-8 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-all group hidden md:block"
          title="Ir para a loja"
        >
          {storeConfig.logo ? (
            <img src={storeConfig.logo} alt={storeConfig.name} className="h-8 w-auto object-contain mb-1" referrerPolicy="no-referrer" />
          ) : (
            <h1 className="text-2xl font-serif font-bold tracking-tighter group-hover:text-gold transition-colors">{storeConfig.name}<span className="text-gold">.</span></h1>
          )}
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Painel Administrativo</p>
        </div>
        
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'products', label: 'Produtos', icon: Package },
            { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
            { id: 'customers', label: 'Clientes', icon: Users },
            { id: 'mystore', label: 'Minha Loja', icon: Store },
            { id: 'profile', label: 'Minhas Informações', icon: ProfileIcon },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium",
                activeTab === item.id ? "bg-gold text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/10">
          <button 
            onClick={() => {
              setCurrentUser(null);
              navigate('/');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-red-500/10 hover:text-red-500 transition-all text-sm font-medium"
          >
            <LogOut size={18} />
            Sair do Painel
          </button>
          <p className="text-[10px] text-gray-600 uppercase tracking-widest text-center mt-4">Chronos Premium © 2026</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 md:p-10">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif capitalize">
              {activeTab === 'profile' ? 'Minhas Informações' : 
               activeTab === 'mystore' ? 'Minha Loja' : 
               activeTab}
            </h2>
            <p className="text-gray-400 text-sm">Bem-vindo de volta, Administrador.</p>
          </div>
          {activeTab === 'products' && (
            <button 
              onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
              className="bg-gold text-white px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-premium-black transition-all self-start sm:self-auto"
            >
              <Plus size={18} /> Novo Produto
            </button>
          )}
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Faturamento Total" value={formatPrice(totalRevenue)} icon={DollarSign} trend="up" trendValue="12%" />
              <StatCard title="Total de Pedidos" value={totalSalesCount} icon={ShoppingCart} trend="up" trendValue="8%" />
              <StatCard title="Produtos Ativos" value={products.length} icon={Package} />
              <StatCard title="Novos Clientes" value={users.length} icon={Users} trend="up" trendValue="100%" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-serif mb-6">Mais Vendidos</h3>
                <div className="space-y-4">
                  {bestSellers.length > 0 ? bestSellers.map(([name, qty], idx) => (
                    <div key={name} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-300 font-serif text-2xl">0{idx + 1}</span>
                        <span className="font-medium">{name}</span>
                      </div>
                      <span className="bg-gold/10 text-gold px-3 py-1 rounded-full text-xs font-bold">{qty} vendas</span>
                    </div>
                  )) : <p className="text-gray-400 italic">Nenhuma venda registrada.</p>}
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-serif mb-6">Pedidos Recentes</h3>
                <div className="space-y-4">
                  {orders.slice(-5).reverse().map(order => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div>
                        <p className="text-xs font-bold text-gray-400">#{order.id}</p>
                        <p className="font-medium text-sm">{order.customer.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{formatPrice(order.total)}</p>
                        <p className="text-[10px] text-gray-400">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && <p className="text-gray-400 italic">Nenhum pedido recente.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

            {activeTab === 'products' && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-50 text-xs font-bold uppercase tracking-widest text-gray-400">
                      <tr>
                        <th className="px-8 py-6">Produto</th>
                        <th className="px-8 py-6">Categoria</th>
                        <th className="px-8 py-6">Preço</th>
                        <th className="px-8 py-6">Status</th>
                        <th className="px-8 py-6 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map(product => (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                              <span className="font-medium">{product.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-sm text-gray-500">{product.category}</td>
                          <td className="px-8 py-6 font-bold">{formatPrice(product.price)}</td>
                          <td className="px-8 py-6">
                            {product.isBestSeller ? (
                              <span className="bg-gold/10 text-gold text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">Best Seller</span>
                            ) : (
                              <span className="bg-gray-100 text-gray-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">Standard</span>
                            )}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => { setEditingProduct(product); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-gold transition-colors"><Edit2 size={18} /></button>
                              <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b">
                  <h3 className="text-xl font-serif">Gerenciamento de Pedidos</h3>
                  <p className="text-sm text-gray-400">Visualize e acompanhe todas as vendas realizadas na loja.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[1000px]">
                <thead className="bg-gray-50 text-xs font-bold uppercase tracking-widest text-gray-400">
                  <tr>
                    <th className="px-8 py-6">ID / Data</th>
                    <th className="px-8 py-6">Cliente</th>
                    <th className="px-8 py-6">Itens</th>
                    <th className="px-8 py-6">Total / Pagamento</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.slice().reverse().map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-bold text-premium-black">#{order.id}</p>
                        <p className="text-xs text-gray-400">{new Date(order.date).toLocaleDateString()}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-medium">{order.customer.name}</p>
                        <p className="text-xs text-gray-400">{order.customer.email}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex -space-x-2">
                          {order.items.map((item, i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-100" title={item.name}>
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-bold text-gold">{formatPrice(order.total)}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">{order.paymentMethod || 'Cartão'}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest",
                          order.status === 'Entregue' ? "bg-green-50 text-green-600" :
                          order.status === 'Cancelado' ? "bg-red-50 text-red-600" :
                          order.status === 'Enviado' ? "bg-blue-50 text-blue-600" :
                          "bg-gold/10 text-gold"
                        )}>
                          {order.status || 'Concluído'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setEditingOrder(order)} className="p-2 text-gray-400 hover:text-gold transition-colors"><Edit2 size={18} /></button>
                          <button onClick={() => handleDeleteOrder(order.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center text-gray-400 italic">Nenhum pedido registrado até o momento.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

            {activeTab === 'customers' && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b">
                  <h3 className="text-xl font-serif">Base de Clientes</h3>
                  <p className="text-sm text-gray-400">Visualize todos os usuários registrados e suas informações.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[900px]">
                <thead className="bg-gray-50 text-xs font-bold uppercase tracking-widest text-gray-400">
                  <tr>
                    <th className="px-8 py-6">Nome / E-mail</th>
                    <th className="px-8 py-6">CPF</th>
                    <th className="px-8 py-6">Telefone</th>
                    <th className="px-8 py-6">Nível</th>
                    <th className="px-8 py-6">Endereço</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6">
                        <div>
                          <p className="font-bold text-premium-black">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-mono text-gray-600">{user.cpf || 'N/A'}</td>
                      <td className="px-8 py-6 text-sm text-gray-600">{user.phone || 'N/A'}</td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest",
                          user.role === 'admin' ? "bg-gold/10 text-gold" : "bg-blue-50 text-blue-600"
                        )}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-500 max-w-xs truncate">
                        {user.address || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

            {activeTab === 'mystore' && (
          <div className="max-w-4xl">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b">
                <h3 className="text-xl font-serif">Configurações da Loja</h3>
                <p className="text-sm text-gray-400">Personalize a identidade visual e as informações de contato da sua loja.</p>
              </div>
              
              <form onSubmit={handleSaveStoreConfig} className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                      <Globe size={12} /> Nome da Loja
                    </label>
                    <input 
                      type="text" 
                      value={storeConfig.name} 
                      onChange={e => setStoreConfig({...storeConfig, name: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold transition-all"
                      placeholder="Ex: CHRONOS"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                      <ImageIcon size={12} /> Logo da Loja
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 space-y-4">
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={storeConfig.logo} 
                            onChange={e => setStoreConfig({...storeConfig, logo: e.target.value})}
                            className="flex-1 bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold transition-all text-sm"
                            placeholder="URL da imagem ou faça upload abaixo"
                          />
                        </div>
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                            id="logo-upload"
                          />
                          <label 
                            htmlFor="logo-upload"
                            className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 rounded-xl cursor-pointer transition-all border-2 border-dashed border-gray-300 text-xs font-bold uppercase tracking-widest"
                          >
                            <Plus size={16} /> Upload de Arquivo Local
                          </label>
                        </div>
                      </div>
                      {storeConfig.logo && (
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center self-center sm:self-start">
                          <img src={storeConfig.logo} alt="Logo Preview" className="max-w-full max-h-full object-contain p-2" referrerPolicy="no-referrer" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400">Suporta URLs ou arquivos locais (máx. 1MB). Deixe em branco para usar texto.</p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                      Descrição da Loja
                    </label>
                    <textarea 
                      rows={3}
                      value={storeConfig.description} 
                      onChange={e => setStoreConfig({...storeConfig, description: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold transition-all resize-none"
                      placeholder="Breve descrição da sua loja..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                      <Phone size={12} /> Telefone de Contato
                    </label>
                    <input 
                      type="text" 
                      value={storeConfig.phone} 
                      onChange={e => setStoreConfig({...storeConfig, phone: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold transition-all"
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                      <Mail size={12} /> E-mail de Contato
                    </label>
                    <input 
                      type="email" 
                      value={storeConfig.email} 
                      onChange={e => setStoreConfig({...storeConfig, email: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold transition-all"
                      placeholder="contato@loja.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                      <MapPin size={12} /> Endereço Físico
                    </label>
                    <input 
                      type="text" 
                      value={storeConfig.address} 
                      onChange={e => setStoreConfig({...storeConfig, address: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold transition-all"
                      placeholder="Endereço completo"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                      <Instagram size={12} /> Instagram
                    </label>
                    <input 
                      type="text" 
                      value={storeConfig.instagram} 
                      onChange={e => setStoreConfig({...storeConfig, instagram: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold transition-all"
                      placeholder="@sualoja"
                    />
                  </div>

                  <div className="md:col-span-2 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-serif mb-4 flex items-center gap-2">
                      <Truck size={18} className="text-gold" /> Configuração de Frete
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                        <div className="flex-1">
                          <p className="text-xs font-bold uppercase tracking-widest mb-1">Ativar Frete Grátis</p>
                          <p className="text-[10px] text-gray-400">Habilita a promoção de frete grátis na loja.</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setStoreConfig({...storeConfig, freeShippingEnabled: !storeConfig.freeShippingEnabled})}
                          className={cn(
                            "w-12 h-6 rounded-full transition-all relative",
                            storeConfig.freeShippingEnabled ? "bg-gold" : "bg-gray-300"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                            storeConfig.freeShippingEnabled ? "right-1" : "left-1"
                          )} />
                        </button>
                      </div>

                      {storeConfig.freeShippingEnabled && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                            Valor Mínimo para Frete Grátis
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                            <input 
                              type="number" 
                              value={storeConfig.freeShippingMinAmount} 
                              onChange={e => setStoreConfig({...storeConfig, freeShippingMinAmount: Number(e.target.value)})}
                              className="w-full bg-gray-50 border-none rounded-xl p-4 pl-10 outline-none focus:ring-2 focus:ring-gold transition-all"
                              placeholder="0,00"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t flex justify-end">
                  <button 
                    type="submit"
                    className="w-full sm:w-auto bg-premium-black text-white px-6 sm:px-12 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gold transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-gold/20 text-xs sm:text-sm"
                  >
                    <Save size={20} /> Salvar Configurações
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

            {activeTab === 'profile' && user && profileFormData && (
          <div className="max-w-4xl">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 sm:p-8 border-b">
                <h3 className="text-xl font-serif">Minhas Informações</h3>
                <p className="text-sm text-gray-400">Gerencie seus dados pessoais de acesso ao painel.</p>
              </div>
              
              <div className="p-6 sm:p-8">
                <form onSubmit={handleSaveProfile} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                        <ProfileIcon size={12} /> Nome Completo
                      </label>
                      <input 
                        disabled={!isEditingProfile}
                        type="text" 
                        value={profileFormData.name} 
                        onChange={e => setProfileFormData({...profileFormData, name: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold disabled:opacity-60 transition-all text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                        <Mail size={12} /> E-mail
                      </label>
                      <input 
                        disabled={!isEditingProfile}
                        type="email" 
                        value={profileFormData.email} 
                        onChange={e => setProfileFormData({...profileFormData, email: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold disabled:opacity-60 transition-all text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                        <Hash size={12} /> CPF (Não alterável)
                      </label>
                      <input 
                        disabled
                        type="text" 
                        value={profileFormData.cpf || 'Não informado'} 
                        className="w-full bg-gray-100 border-none rounded-xl p-4 outline-none opacity-60 cursor-not-allowed font-mono text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                        <Phone size={12} /> Telefone
                      </label>
                      <input 
                        disabled={!isEditingProfile}
                        type="tel" 
                        value={profileFormData.phone || ''} 
                        onChange={e => setProfileFormData({...profileFormData, phone: e.target.value})}
                        placeholder="(00) 00000-0000"
                        className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold disabled:opacity-60 transition-all text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                        <Calendar size={12} /> Data de Nascimento
                      </label>
                      <input 
                        disabled={!isEditingProfile}
                        type="date" 
                        value={profileFormData.birthDate || ''} 
                        onChange={e => setProfileFormData({...profileFormData, birthDate: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold disabled:opacity-60 transition-all text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                        <MapPin size={12} /> Endereço
                      </label>
                      <input 
                        disabled={!isEditingProfile}
                        type="text" 
                        value={profileFormData.address || ''} 
                        onChange={e => setProfileFormData({...profileFormData, address: e.target.value})}
                        placeholder="Rua, Número, Bairro, Cidade - UF"
                        className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold disabled:opacity-60 transition-all text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="pt-8 border-t flex flex-col sm:flex-row justify-end gap-4">
                    {!isEditingProfile ? (
                      <button 
                        type="button"
                        onClick={() => setIsEditingProfile(true)}
                        className="w-full sm:w-auto bg-premium-black text-white px-6 sm:px-10 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gold transition-all text-xs sm:text-sm"
                      >
                        Editar Informações
                      </button>
                    ) : (
                      <>
                        <button 
                          type="button"
                          onClick={() => {
                            setIsEditingProfile(false);
                            setProfileFormData(user);
                          }}
                          className="w-full sm:w-auto bg-gray-100 text-gray-600 px-6 sm:px-10 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-200 transition-all text-xs sm:text-sm order-2 sm:order-1"
                        >
                          Cancelar
                        </button>
                        <button 
                          type="submit"
                          className="w-full sm:w-auto bg-gold text-white px-6 sm:px-10 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-premium-black transition-all flex items-center justify-center gap-2 text-xs sm:text-sm order-1 sm:order-2"
                        >
                          <Save size={18} /> Salvar Alterações
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

            {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-serif mb-8">Desempenho de Vendas</h3>
                <div className="h-64 flex items-end gap-4">
                  {/* Simple CSS Chart */}
                  {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div 
                        className="w-full bg-gray-100 rounded-t-lg group-hover:bg-gold transition-all duration-500 relative"
                        style={{ height: `${h}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-premium-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {h}%
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dia {i+1}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-serif mb-8">Ranking de Produtos</h3>
                <div className="space-y-6">
                  {sortedSales.map(([name, qty], idx) => (
                    <div key={name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{name}</span>
                        <span className="text-gray-400">{qty} unidades</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(qty / sortedSales[0][1]) * 100}%` }}
                          className="h-full bg-gold"
                        />
                      </div>
                    </div>
                  ))}
                  {sortedSales.length === 0 && <p className="text-gray-400 italic">Dados insuficientes para gerar ranking.</p>}
                </div>
              </div>
            </div>
            
            <div className="bg-premium-black text-white p-10 rounded-3xl flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-serif mb-2">Relatório Consolidado</h3>
                <p className="text-gray-400 font-light">Resumo financeiro do período atual.</p>
              </div>
              <div className="flex gap-16">
                <div className="text-center">
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Faturamento</p>
                  <p className="text-3xl font-serif text-gold">{formatPrice(totalRevenue)}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Ticket Médio</p>
                  <p className="text-3xl font-serif text-gold">{formatPrice(totalSalesCount ? totalRevenue / totalSalesCount : 0)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
          </motion.div>
        </AnimatePresence>
      </main>

      {isModalOpen && (
        <ProductModal 
          product={editingProduct} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSaveProduct} 
        />
      )}

      {editingOrder && (
        <OrderModal 
          order={editingOrder} 
          onClose={() => setEditingOrder(null)} 
          onSave={handleSaveOrder} 
        />
      )}
    </div>
  );
};
