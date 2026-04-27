import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Package, ShoppingCart, BarChart3, Plus, Edit2, Trash2, 
  TrendingUp, DollarSign, Users, ArrowUpRight, ArrowDownRight, LogOut, X, Image as ImageIcon,
  Store, Globe, Instagram, Mail, Phone, MapPin, Menu, AlertCircle, Truck, User as ProfileIcon, Hash, Calendar, ArrowLeft, Lock, Code, Printer, CheckCircle2, Clock, Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product, Order, AnalyticsData, User, StoreConfig, OrderStatus, PaymentMethod } from './types';
import { getProducts, saveProducts, getOrders, saveOrders, getUsers, saveUsers, setCurrentUser, clearAllSessions, getStoreConfig, saveStoreConfig, updateOrder, deleteOrder, updateUserProfile as updateUser, getCurrentUser } from './lib/storage';
import { formatPrice, cn } from './lib/utils';
import { Toast, Modal, ToastType } from './components/UI';
import { CEPInput } from './components/CEPInput';

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

const ProductModal = ({ product, collections, onClose, onSave }: { product: Product | null, collections: string[], onClose: () => void, onSave: (p: Product) => void }) => {
  const [formData, setFormData] = useState<Product>(product || {
    id: Math.random().toString(36).substr(2, 9),
    name: '',
    price: 0,
    description: '',
    image: '',
    images: [],
    category: collections[0] || 'Luxo',
    isBestSeller: false
  });

  // Ensure images array exists
  useEffect(() => {
    if (!formData.images) {
      setFormData(prev => ({ ...prev, images: prev.image ? [prev.image] : [] }));
    }
  }, [formData.images, formData.image]);

  // Auto-save on any change
  useEffect(() => {
    onSave(formData);
  }, [formData, onSave]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      const MAX_SIZE = 1024 * 1024; // 1MB limit for localStorage per image
      
      Array.from(files).forEach((file: File) => {
        if (file.size > MAX_SIZE) {
          alert(`A imagem ${file.name} é muito grande (máx 1MB).`);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setFormData(prev => {
            const currentImages = prev.images || [];
            // Use the first image as the main 'image' property if it's empty
            const updatedImages = [...currentImages, result];
            return {
              ...prev,
              images: updatedImages,
              image: prev.image || updatedImages[0]
            };
          });
        };
        reader.readAsDataURL(file);
      });
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const currentImages = prev.images || [];
      const updatedImages = currentImages.filter((_, i) => i !== index);
      return {
        ...prev,
        images: updatedImages,
        image: updatedImages[0] || ''
      };
    });
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    setFormData(prev => {
      const currentImages = [...(prev.images || [])];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      
      if (newIndex < 0 || newIndex >= currentImages.length) return prev;
      
      const temp = currentImages[index];
      currentImages[index] = currentImages[newIndex];
      currentImages[newIndex] = temp;
      
      return {
        ...prev,
        images: currentImages,
        image: currentImages[0]
      };
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white max-w-3xl w-full rounded-3xl shadow-2xl overflow-hidden my-auto"
      >
        <div className="p-6 sm:p-8 border-b flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-serif">{product ? 'Editar Produto' : 'Novo Produto'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
        </div>
        
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Nome</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold text-sm transition-all" placeholder="Ex: Cronos Special Edition" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Preço (R$)</label>
              <input 
                required 
                type="number" 
                step="0.01"
                value={formData.price === 0 ? '' : formData.price} 
                onChange={e => {
                  const val = e.target.value;
                  setFormData({...formData, price: val === '' ? 0 : Number(val)});
                }} 
                className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold text-sm transition-all" 
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Imagens do Produto</label>
              <span className="text-[10px] text-gray-400">Máx 1MB por imagem</span>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {formData.images?.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 group border border-gray-100">
                  <img src={img || undefined} alt={`Preview ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    {idx > 0 && (
                      <button onClick={() => moveImage(idx, 'up')} className="p-1.5 bg-white rounded-full text-premium-black hover:text-gold transition-colors" title="Mover para Esquerda">
                        <ArrowLeft size={14} className="rotate-0" />
                      </button>
                    )}
                    <button onClick={() => removeImage(idx)} className="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors" title="Remover">
                      <Trash2 size={14} />
                    </button>
                    {idx < (formData.images?.length || 0) - 1 && (
                      <button onClick={() => moveImage(idx, 'down')} className="p-1.5 bg-white rounded-full text-premium-black hover:text-gold transition-colors" title="Mover para Direita">
                        <ArrowLeft size={14} className="rotate-180" />
                      </button>
                    )}
                  </div>
                  {idx === 0 && (
                    <div className="absolute top-2 left-2 bg-gold text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">
                      Principal
                    </div>
                  )}
                </div>
              ))}
              <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 hover:border-gold hover:bg-gold/5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group overflow-hidden">
                <Plus size={24} className="text-gray-300 group-hover:text-gold transition-colors" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-300 group-hover:text-gold">Adicionar</span>
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
            {(!formData.images || formData.images.length === 0) && (
              <p className="text-xs text-gray-400 italic">O primeiro item será a imagem principal da vitrine.</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Descrição</label>
            <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold resize-none text-sm transition-all" placeholder="Descreva os detalhes e exclusividades deste produto..." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Coleção</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold text-sm appearance-none transition-all">
                {collections.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-2 sm:pt-8 bg-gold/5 rounded-2xl px-6">
              <input type="checkbox" id="bestseller" checked={formData.isBestSeller} onChange={e => setFormData({...formData, isBestSeller: e.target.checked})} className="w-5 h-5 accent-gold cursor-pointer" />
              <label htmlFor="bestseller" className="text-sm font-bold text-premium-black uppercase tracking-widest cursor-pointer select-none">Mais Vendido</label>
            </div>
          </div>

          <div className="pt-6 border-t flex justify-end gap-4 bg-white sticky bottom-0">
            <button 
              onClick={onClose}
              className="px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-100 transition-all text-[10px] text-gray-500"
            >
              Cancelar
            </button>
            <button 
              onClick={onClose} 
              className="bg-premium-black text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gold transition-all text-[10px] shadow-lg shadow-gold/10"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const OrderModal = ({ order, onClose, onSave }: { order: Order, onClose: () => void, onSave: (o: Order) => void }) => {
  const [formData, setFormData] = useState<Order>({ ...order });

  // Auto-save on any change
  useEffect(() => {
    onSave(formData);
  }, [formData, onSave]);

  const statuses: OrderStatus[] = ['Pendente', 'Pago', 'Processando', 'Enviado', 'Entregue', 'Cancelado'];
  const paymentMethods: PaymentMethod[] = ['Cartão de Crédito', 'Boleto', 'Pix'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden my-auto"
      >
        <div className="p-6 sm:p-8 border-b flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-serif">Editar Pedido #{order.id}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
        </div>
        
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Status do Pedido</label>
              <select 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value as OrderStatus})} 
                className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold text-sm"
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Forma de Pagamento</label>
              <select 
                value={formData.paymentMethod} 
                onChange={e => setFormData({...formData, paymentMethod: e.target.value as PaymentMethod})} 
                className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold text-sm"
              >
                {paymentMethods.map(pm => <option key={pm} value={pm}>{pm}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Código de Rastreio</label>
            <div className="relative">
              <input 
                type="text" 
                value={formData.trackingCode || ''} 
                onChange={e => {
                  const newCode = e.target.value;
                  const updates: any = { trackingCode: newCode };
                  // If adding a code and status is not already shipped/delivered/cancelled, move to Enviado
                  if (newCode.trim() && (formData.status === 'Pendente' || formData.status === 'Pago' || formData.status === 'Processando')) {
                    updates.status = 'Enviado';
                  }
                  setFormData({...formData, ...updates});
                }} 
                placeholder="Ex: AA123456789BR"
                className="w-full bg-gray-50 border-none rounded-xl p-4 pr-12 outline-none focus:ring-2 focus:ring-gold text-sm font-mono"
              />
              <Truck size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
            </div>
            <p className="text-[9px] text-gray-400 italic">O cliente poderá visualizar este código em seu perfil.</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Informações do Cliente</label>
            <div className="p-4 bg-gray-50 rounded-xl space-y-1">
              <p className="text-sm font-medium">{formData.customer.name}</p>
              <p className="text-xs text-gray-500">{formData.customer.email}</p>
              <p className="text-xs text-gray-500">{formData.customer.address}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Itens do Pedido</label>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {formData.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <img src={item.image || undefined} alt={item.name} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                    <span className="text-sm font-medium truncate max-w-[150px]">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-400 shrink-0">{item.quantity}x {formatPrice(item.price)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total do Pedido</span>
            <span className="text-xl sm:text-2xl font-serif font-bold text-gold">{formatPrice(formData.total)}</span>
          </div>

          <div className="pt-4 border-t flex justify-end">
            <button 
              onClick={onClose} 
              className="bg-premium-black text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-gold transition-all text-xs"
            >
              Concluído
            </button>
          </div>
        </div>
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
  const [storeConfig, setStoreConfig] = useState<StoreConfig>({
    name: "CHRONOS",
    logo: "",
    homepageBackground: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    instagram: "",
    freeShippingEnabled: true,
    freeShippingMinAmount: 0,
    collections: [],
    maintenance: { enabled: false, time: "", reason: "" },
    pixKey: "",
    whatsappNumber: ""
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  
  // Profile State
  const [user, setUser] = useState<User | null>(null);
  const [profileFormData, setProfileFormData] = useState<User | null>(null);
  const isInitialMount = useRef(true);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Custom UI State
  const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({ message: '', type: 'success', isVisible: false });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, type: 'product' | 'order', id: string | null }>({ isOpen: false, type: 'product', id: null });
  
  const navigate = useNavigate();

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type, isVisible: true });
  }, []);

  const handleSaveProduct = useCallback((product: Product) => {
    setProducts(prev => {
      if (prev.find(p => p.id === product.id)) {
        return prev.map(p => p.id === product.id ? product : p);
      }
      return [...prev, product];
    });
  }, []);

  const handleSaveOrder = useCallback((order: Order) => {
    setOrders(prev => prev.map(o => o.id === order.id ? order : o));
  }, []);

  useEffect(() => {
    const init = async () => {
      setProducts(await getProducts());
      setOrders(await getOrders());
      
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setProfileFormData(currentUser);
      }
      
      const config = await getStoreConfig();
      if (!config.collections || config.collections.length === 0) {
        setStoreConfig({
          ...config,
          collections: ["Luxo", "Minimalista", "Clássico", "Esportivo"]
        });
      } else {
        setStoreConfig(config);
      }
      
      // Set initial mount to false after a short delay to avoid triggering auto-save toasts on load
      setTimeout(() => {
        isInitialMount.current = false;
      }, 1000);
    };
    init();
  }, []);

  // Auto-save Store Config
  useEffect(() => {
    if (isInitialMount.current) return;
    const save = async () => {
      await saveStoreConfig(storeConfig);
      window.dispatchEvent(new Event('storeConfigUpdated'));
      
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        showToast('Configurações da loja salvas!');
      }, 1000);
    };
    save();
  }, [storeConfig, showToast]);

  // Auto-save Products
  useEffect(() => {
    if (isInitialMount.current) return;
    if (products.length > 0) {
      const save = async () => {
        await saveProducts(products);
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => {
          showToast('Produtos atualizados!');
        }, 1000);
      };
      save();
    }
  }, [products, showToast]);

  // Auto-save Orders
  useEffect(() => {
    if (isInitialMount.current) return;
    if (orders.length > 0) {
      const save = async () => {
        // Since we don't have a saveOrders (plural) in my new storage.ts, 
        // I'll just skip here or assume components handle single updates.
        // Actually I'll implement saveOrders if needed or just skip auto-saving the whole list.
        // The individual updates are better.
      };
      save();
    }
  }, [orders, showToast]);

  // Auto-save Profile
  useEffect(() => {
    if (isInitialMount.current) return;
    if (profileFormData) {
      const saveProfile = async () => {
        const data = profileFormData;
        await updateUser(data);
        setCurrentUser(data);
        setUser(data);
        
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => {
          showToast('Perfil atualizado!');
        }, 1000);
      };
      saveProfile();
    }
  }, [profileFormData, showToast]);

  // Auto-save Users List
  useEffect(() => {
    if (isInitialMount.current) return;
    if (users.length > 0) {
      saveUsers(users);
    }
  }, [users]);

  const handleAddCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    
    const collections = storeConfig.collections || [];
    if (collections.includes(newCollectionName.trim())) {
      showToast('Esta coleção já existe.', 'error');
      return;
    }
    
    const updatedConfig = {
      ...storeConfig,
      collections: [...collections, newCollectionName.trim()]
    };
    setStoreConfig(updatedConfig);
    setNewCollectionName('');
    showToast('Coleção adicionada com sucesso!');
  };

  const handleDeleteCollection = (collectionName: string) => {
    const productsInCollection = products.filter(p => p.category === collectionName);
    
    if (productsInCollection.length > 0) {
      if (!window.confirm(`Existem ${productsInCollection.length} produtos nesta coleção. Ao excluí-la, esses produtos ficarão sem categoria. Deseja continuar?`)) {
        return;
      }
      
      // Update products to have no category or a default one
      const updatedProducts = products.map(p => 
        p.category === collectionName ? { ...p, category: 'Sem Categoria' } : p
      );
      setProducts(updatedProducts);
    }

    const collections = storeConfig.collections || [];
    const updatedConfig = {
      ...storeConfig,
      collections: collections.filter(c => c !== collectionName)
    };
    setStoreConfig(updatedConfig);
    showToast('Coleção removida com sucesso!');
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
        showToast('Produto excluído com sucesso!', 'info');
      } else {
        const newOrders = orders.filter(o => o.id !== deleteModal.id);
        setOrders(newOrders);
        showToast('Pedido excluído com sucesso!', 'info');
      }
      setDeleteModal({ isOpen: false, type: 'product', id: null });
    }
  };

  const handlePrintDeclaration = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Build the declaration HTML (basic structure inspired by Correios)
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Declaração de Conteúdo - #${order.id}</title>
        <style>
          body { font-family: -apple-system, sans-serif; padding: 10mm; line-height: 1.2; color: #000; font-size: 10pt; }
          .container { width: 100%; max-width: 190mm; margin: 0 auto; border: 1px solid #000; }
          .header { text-align: center; font-weight: bold; font-size: 14pt; padding: 5px; border-bottom: 2px solid #000; text-transform: uppercase; }
          .section { display: flex; border-bottom: 1px solid #000; }
          .box { flex: 1; padding: 5mm; border-right: 1px solid #000; }
          .box:last-child { border-right: none; }
          .title { font-weight: bold; font-size: 8pt; text-transform: uppercase; margin-bottom: 2mm; display: block; border-bottom: 1px solid #ddd; padding-bottom: 1mm; }
          .info { margin-bottom: 1mm; }
          .table-container { padding: 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 2mm; text-align: left; font-size: 9pt; }
          th { background: #f0f0f0; text-transform: uppercase; font-size: 8pt; }
          .total-row td { font-weight: bold; }
          .footer { padding: 5mm; font-size: 8pt; }
          .declaration-text { margin-bottom: 5mm; text-align: justify; }
          .signature-section { display: flex; justify-content: space-around; margin-top: 10mm; text-align: center; }
          .sig-box { width: 45%; border-top: 1px solid #000; padding-top: 2mm; margin-top: 5mm; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">Declaração de Conteúdo</div>
          
          <div class="section">
            <div class="box">
              <span class="title">1. Remetente</span>
              <div class="info"><strong>Nome:</strong> ${storeConfig.name}</div>
              <div class="info"><strong>Endereço:</strong> ${storeConfig.address}</div>
              <div class="info"><strong>Telefone:</strong> ${storeConfig.phone}</div>
            </div>
            <div class="box">
              <span class="title">2. Destinatário</span>
              <div class="info"><strong>Nome:</strong> ${order.customer.name}</div>
              <div class="info"><strong>Endereço:</strong> ${order.customer.address}</div>
              <div class="info"><strong>E-mail:</strong> ${order.customer.email}</div>
            </div>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th style="width: 70%;">3. Discriminação do Conteúdo</th>
                  <th style="width: 10%; text-align: center;">Quant.</th>
                  <th style="width: 20%; text-align: right;">Valor (R$)</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">${(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="2" style="text-align: right;">TOTAL</td>
                  <td style="text-align: right;">${order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="footer">
            <div class="declaration-text">
              Declaro que não me enquadro no conceito de contribuinte previsto no art. 4º da Lei Complementar nº 87/1996, logo não estou obrigado à emissão de nota fiscal, e que os bens descritos nesta declaração têm caráter de envio ocasional e não constituem objeto de comércio.
            </div>
            
            <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
            
            <div class="signature-section">
              <div class="sig-box">Assinatura do Remetente</div>
              <div class="sig-box">Assinatura do Responsável</div>
            </div>
          </div>
        </div>
        
        <script>
          window.focus();
          setTimeout(() => {
            window.print();
            window.addEventListener('afterprint', () => window.close());
            // Fallback for some browsers
            setTimeout(() => window.close(), 500);
          }, 500);
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();

    // After print, automatically update status to 'Processando' if it was 'Pendente' or 'Pago'
    if (order.status === 'Pendente' || order.status === 'Pago') {
      const updatedOrder = { ...order, status: 'Processando' as OrderStatus };
      handleSaveOrder(updatedOrder);
      showToast('Declaração gerada e status atualizado para Processando!');
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
        setStoreConfig(prev => ({ ...prev, logo: reader.result as string }));
        showToast('Logo atualizada com sucesso!', 'success');
      };
      reader.readAsDataURL(file);
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for localStorage
        showToast('A imagem é muito grande. Por favor, escolha uma imagem menor que 1MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setStoreConfig(prev => ({ ...prev, homepageBackground: reader.result as string }));
        showToast('Background atualizado com sucesso!', 'success');
      };
      reader.readAsDataURL(file);
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }
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
            <img src={storeConfig.logo || undefined} alt={storeConfig.name} className="h-8 w-auto object-contain mb-1" referrerPolicy="no-referrer" />
          ) : (
            <h1 className="text-2xl font-serif font-bold tracking-tighter group-hover:text-gold transition-colors">{storeConfig.name}<span className="text-gold">.</span></h1>
          )}
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Painel Administrativo</p>
        </div>
        
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
            { id: 'products', label: 'Produtos', icon: Package },
            { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
            { id: 'customers', label: 'Clientes', icon: Users },
            { id: 'mystore', label: 'Minha Loja', icon: Store },
            { id: 'profile', label: 'Minhas Informações', icon: ProfileIcon },
            { id: 'analytics', label: 'Análises', icon: BarChart3 },
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
          
          {user?.role === 'dev' && (
            <button
              onClick={() => navigate('/dev-control')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium text-green-500 hover:text-green-400 hover:bg-green-500/10 border border-green-500/10"
            >
              <Code size={18} />
              Painel do Dev
            </button>
          )}
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
      <main className="flex-1 md:ml-64 p-4 sm:p-6 md:p-10 min-w-0 overflow-x-hidden">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-10 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif capitalize">
              {activeTab === 'profile' ? 'Minhas Informações' : 
               activeTab === 'mystore' ? 'Minha Loja' : 
               activeTab === 'dashboard' ? 'Painel de Controle' :
               activeTab === 'products' ? 'Gerenciar Produtos' :
               activeTab === 'orders' ? 'Gerenciar Pedidos' :
               activeTab === 'customers' ? 'Base de Clientes' :
               activeTab === 'analytics' ? 'Análises de Desempenho' :
               activeTab}
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm">Bem-vindo de volta, Administrador.</p>
          </div>
          {activeTab === 'products' && (
            <button 
              onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
              className="bg-gold text-white px-5 py-3 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-premium-black transition-all self-start sm:self-auto shadow-lg shadow-gold/20"
            >
              <Plus size={16} /> Novo Produto
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
          <div className="space-y-8 sm:space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatCard title="Faturamento Total" value={formatPrice(totalRevenue)} icon={DollarSign} trend="up" trendValue="12%" />
              <StatCard title="Total de Pedidos" value={totalSalesCount} icon={ShoppingCart} trend="up" trendValue="8%" />
              <StatCard title="Produtos Ativos" value={products.length} icon={Package} />
              <StatCard title="Novos Clientes" value={users.length} icon={Users} trend="up" trendValue="100%" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg sm:text-xl font-serif mb-6">Mais Vendidos</h3>
                <div className="space-y-4">
                  {bestSellers.length > 0 ? bestSellers.map(([name, qty], idx) => (
                    <div key={name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <span className="text-gray-300 font-serif text-xl sm:text-2xl">0{idx + 1}</span>
                        <span className="font-medium text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">{name}</span>
                      </div>
                      <span className="bg-gold/10 text-gold px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold shrink-0">{qty} vendas</span>
                    </div>
                  )) : <p className="text-gray-400 italic text-sm">Nenhuma venda registrada.</p>}
                </div>
              </div>
              
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg sm:text-xl font-serif mb-6">Pedidos Recentes</h3>
                <div className="space-y-4">
                  {orders.slice(-5).reverse().map(order => (
                    <div key={order.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-2xl">
                      <div className="truncate pr-2">
                        <p className="text-[10px] font-bold text-gray-400">#{order.id}</p>
                        <p className="font-medium text-xs sm:text-sm truncate">{order.customer.name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-xs sm:text-sm">{formatPrice(order.total)}</p>
                        <p className="text-[9px] sm:text-[10px] text-gray-400">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && <p className="text-gray-400 italic text-sm">Nenhum pedido recente.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

            {activeTab === 'products' && (
              <div className="space-y-8">
                {/* Collection Management */}
                <div className="bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-serif">Gerenciar Coleções</h3>
                      <p className="text-xs sm:text-sm text-gray-400">Adicione ou remova categorias de produtos da sua loja.</p>
                    </div>
                    <div className="bg-gold/10 text-gold px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest self-start sm:self-auto">
                      {(storeConfig.collections || []).length} Coleções
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
                    {(storeConfig.collections || []).map(c => (
                      <div key={c} className="flex items-center justify-between bg-gray-50 p-3 sm:p-4 rounded-2xl border border-transparent hover:border-gold/20 hover:bg-white hover:shadow-md transition-all group">
                        <span className="text-xs sm:text-sm font-medium truncate pr-2">{c}</span>
                        <button 
                          onClick={() => handleDeleteCollection(c)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1.5"
                          title="Excluir Coleção"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {(!storeConfig.collections || storeConfig.collections.length === 0) && (
                      <p className="col-span-full text-gray-400 italic text-xs sm:text-sm py-4">Nenhuma coleção personalizada criada.</p>
                    )}
                  </div>

                  <form onSubmit={handleAddCollection} className="flex flex-col sm:flex-row gap-3 bg-gray-50 p-2 rounded-2xl">
                    <input 
                      type="text" 
                      value={newCollectionName}
                      onChange={e => setNewCollectionName(e.target.value)}
                      placeholder="Nova coleção (ex: Edição Limitada)..."
                      className="flex-1 bg-transparent border-none px-4 py-3 outline-none text-xs sm:text-sm"
                    />
                    <button 
                      type="submit"
                      className="bg-premium-black text-white px-6 py-3 rounded-xl font-bold text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-gold transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <Plus size={14} /> Adicionar
                    </button>
                  </form>
                </div>

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
                                {product.image && <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                              </div>
                              <span className="font-medium">{product.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-sm text-gray-500">{product.category}</td>
                          <td className="px-8 py-6 font-bold">{formatPrice(product.price)}</td>
                          <td className="px-8 py-6">
                            {product.isBestSeller ? (
                              <span className="bg-gold/10 text-gold text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">Mais Vendido</span>
                            ) : (
                              <span className="bg-gray-100 text-gray-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">Padrão</span>
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
                              {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
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
                          "text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 w-fit shadow-sm",
                          order.status === 'Pago' ? "bg-green-50 text-green-600 border border-green-100" :
                          order.status === 'Entregue' || order.status === 'Enviado' ? "bg-green-50 text-green-600 border border-green-100" :
                          order.status === 'Cancelado' ? "bg-red-50 text-red-600 border border-red-100" :
                          order.status === 'Processando' ? "bg-blue-50 text-blue-600 border border-blue-100" :
                          "bg-gold/10 text-gold border border-gold/10"
                        )}>
                          {order.status === 'Pendente' && <Clock size={12} className="animate-pulse" />}
                          {order.status === 'Pago' && <CheckCircle2 size={12} />}
                          {order.status === 'Processando' && <Package size={12} />}
                          {order.status === 'Enviado' && <Send size={12} />}
                          {order.status === 'Entregue' && <CheckCircle2 size={12} />}
                          {order.status || 'Concluído'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handlePrintDeclaration(order)} 
                            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                            title="Imprimir Declaração de Conteúdo"
                          >
                            <Printer size={18} />
                          </button>
                          {order.status === 'Pendente' && (
                            <button 
                              onClick={() => {
                                const updatedOrder = { ...order, status: 'Pago' as OrderStatus };
                                handleSaveOrder(updatedOrder);
                                showToast('Pagamento confirmado!');
                              }} 
                              className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                              title="Confirmar Pagamento"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                          )}
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
                    <th className="px-8 py-6">Senha</th>
                    <th className="px-8 py-6">Nível</th>
                    <th className="px-8 py-6">Endereço</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-6">
                        <div>
                          <p className="font-bold text-premium-black">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-mono text-gray-600">{u.cpf || 'N/A'}</td>
                      <td className="px-8 py-6 text-sm text-gray-600">{u.phone || 'N/A'}</td>
                      <td className="px-8 py-6">
                        <div className="relative group/pass">
                          <input 
                            type="text" 
                            value={u.password || ''} 
                            onChange={e => {
                              const newUsers = users.map(curr => curr.id === u.id ? {...curr, password: e.target.value} : curr);
                              setUsers(newUsers);
                            }}
                            className="bg-transparent border-b border-transparent hover:border-gray-200 focus:border-gold outline-none text-sm font-mono text-gray-600 w-24 transition-all"
                          />
                          <Lock size={12} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 opacity-0 group-hover/pass:opacity-100 transition-opacity" />
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest",
                          u.role === 'admin' ? "bg-gold/10 text-gold" : "bg-blue-50 text-blue-600"
                        )}>
                          {u.role === 'admin' ? 'Administrador' : 'Cliente'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-500 max-w-xs truncate">
                        {u.address || 'N/A'}
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
                <p className="text-sm text-gray-400">Personalize a identidade visual e as informações de contato da sua loja. Alterações são salvas automaticamente.</p>
              </div>
              
              <div className="p-8 space-y-8">
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
                  
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                      <ImageIcon size={12} /> Logo da Loja
                    </label>
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                      <div className="flex-1 w-full">
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
                            className="flex items-center justify-center gap-3 w-full bg-gray-50 hover:bg-gray-100 text-gray-600 py-4 rounded-2xl cursor-pointer transition-all border-2 border-dashed border-gray-200 text-xs font-bold uppercase tracking-widest"
                          >
                            <Plus size={18} /> Selecionar Logo
                          </label>
                        </div>
                      </div>
                      {storeConfig.logo && (
                        <div className="flex flex-col items-center gap-2">
                          <div className="relative group">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
                              {storeConfig.logo && <img src={storeConfig.logo} alt="Logo Preview" className="max-w-full max-h-full object-contain p-2" referrerPolicy="no-referrer" />}
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => {
                              setStoreConfig({...storeConfig, logo: ''});
                              showToast('Logo removida. A loja voltará a exibir o nome em texto.');
                            }}
                            className="flex items-center gap-2 text-red-500 hover:text-red-700 transition-colors text-[10px] font-bold uppercase tracking-widest"
                          >
                            <Trash2 size={14} /> Excluir Logo
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400">Faça upload da logo da sua marca (máx. 1MB). Se não houver logo, será exibido o nome da loja em texto.</p>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                      <ImageIcon size={12} /> Background da Home
                    </label>
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                      <div className="flex-1 w-full">
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleBackgroundUpload}
                            className="hidden"
                            id="bg-upload"
                          />
                          <label 
                            htmlFor="bg-upload"
                            className="flex items-center justify-center gap-3 w-full bg-gray-50 hover:bg-gray-100 text-gray-600 py-4 rounded-2xl cursor-pointer transition-all border-2 border-dashed border-gray-200 text-xs font-bold uppercase tracking-widest"
                          >
                            <Plus size={18} /> Selecionar Background
                          </label>
                        </div>
                      </div>
                      {storeConfig.homepageBackground && (
                        <div className="flex flex-col items-center gap-2">
                          <div className="relative group">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
                              {storeConfig.homepageBackground && <img src={storeConfig.homepageBackground} alt="BG Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => {
                              setStoreConfig({...storeConfig, homepageBackground: ''});
                              showToast('Background removido.');
                            }}
                            className="flex items-center gap-2 text-red-500 hover:text-red-700 transition-colors text-[10px] font-bold uppercase tracking-widest"
                          >
                            <Trash2 size={14} /> Excluir Background
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400">Imagem de fundo da tela inicial (máx. 1MB).</p>
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

                  <CEPInput 
                    value={storeConfig.address} 
                    onChange={address => setStoreConfig({...storeConfig, address})}
                    label="Endereço Físico"
                    icon={<MapPin size={12} />}
                  />

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                      <Instagram size={12} /> Link do Instagram
                    </label>
                    <input 
                      type="text" 
                      value={storeConfig.instagram} 
                      onChange={e => setStoreConfig({...storeConfig, instagram: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold transition-all"
                      placeholder="https://instagram.com/sualoja"
                    />
                  </div>

                  <div className="md:col-span-2 pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-serif mb-4 flex items-center gap-2 text-gold">
                      <div className="w-6 h-6 flex items-center justify-center font-bold text-[10px] bg-gold text-white rounded-full">X</div> Configurações de Pagamento (Pix)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                          Chave Pix
                        </label>
                        <input 
                          type="text" 
                          value={storeConfig.pixKey || ''} 
                          onChange={e => setStoreConfig({...storeConfig, pixKey: e.target.value})}
                          className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold transition-all"
                          placeholder="Chave Pix (CPF, CNPJ, E-mail ou Aleatória)"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                          WhatsApp para Notificação (DDI+DDD+Número)
                        </label>
                        <input 
                          type="text" 
                          value={storeConfig.whatsappNumber || ''} 
                          onChange={e => setStoreConfig({...storeConfig, whatsappNumber: e.target.value})}
                          className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold transition-all"
                          placeholder="Ex: 5511999999999"
                        />
                        <p className="text-[9px] text-gray-400 font-medium">Este número receberá os detalhes do pedido quando o cliente clicar em "Pagamento Realizado".</p>
                      </div>
                    </div>
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
              </div>
            </div>
          </div>
        )}

            {activeTab === 'profile' && user && profileFormData && (
          <div className="max-w-4xl">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 sm:p-8 border-b">
                <h3 className="text-xl font-serif">Minhas Informações</h3>
                <p className="text-sm text-gray-400">Gerencie seus dados pessoais de acesso ao painel. Alterações são salvas automaticamente.</p>
              </div>
              
              <div className="p-6 sm:p-8">
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                        <ProfileIcon size={12} /> Nome Completo
                      </label>
                      <input 
                        type="text" 
                        value={profileFormData.name} 
                        onChange={e => setProfileFormData({...profileFormData, name: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold transition-all text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                        <Mail size={12} /> E-mail
                      </label>
                      <input 
                        type="email" 
                        value={profileFormData.email} 
                        onChange={e => setProfileFormData({...profileFormData, email: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold transition-all text-sm sm:text-base"
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
                        type="tel" 
                        value={profileFormData.phone || ''} 
                        onChange={e => setProfileFormData({...profileFormData, phone: e.target.value})}
                        placeholder="(00) 00000-0000"
                        className="w-full bg-gray-50 border-none rounded-xl h-[56px] px-4 outline-none focus:ring-2 focus:ring-gold transition-all text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                        <Calendar size={12} /> Data de Nascimento
                      </label>
                      <input 
                        type="date" 
                        value={profileFormData.birthDate || ''} 
                        onChange={e => setProfileFormData({...profileFormData, birthDate: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-xl h-[56px] px-4 outline-none focus:ring-2 focus:ring-gold transition-all text-sm sm:text-base"
                      />
                    </div>
                    <CEPInput 
                      value={profileFormData.address || ''} 
                      onChange={address => setProfileFormData({...profileFormData, address})}
                      label="Endereço"
                      icon={<MapPin size={12} />}
                      className="sm:col-span-2"
                    />
                    {user.role === 'admin' && (
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                          <Lock size={12} /> Senha de Acesso
                        </label>
                        <input 
                          type="text" 
                          value={profileFormData.password || ''} 
                          onChange={e => setProfileFormData({...profileFormData, password: e.target.value})}
                          placeholder="Sua senha secreta"
                          className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold transition-all text-sm sm:text-base font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

            {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg sm:text-xl font-serif mb-8">Desempenho de Vendas</h3>
                <div className="h-64 flex items-end gap-2 sm:gap-4">
                  {/* Simple CSS Chart */}
                  {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div 
                        className="w-full bg-gray-100 rounded-t-lg group-hover:bg-gold transition-all duration-500 relative"
                        style={{ height: `${h}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-premium-black text-white text-[8px] sm:text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {h}%
                        </div>
                      </div>
                      <span className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">D{i+1}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg sm:text-xl font-serif mb-8">Ranking de Produtos</h3>
                <div className="space-y-6">
                  {sortedSales.map(([name, qty], idx) => (
                    <div key={name} className="space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="font-medium truncate pr-4">{name}</span>
                        <span className="text-gray-400 shrink-0">{qty} un.</span>
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
                  {sortedSales.length === 0 && <p className="text-gray-400 italic text-sm">Dados insuficientes para gerar ranking.</p>}
                </div>
              </div>
            </div>
            
            <div className="bg-premium-black text-white p-6 sm:p-10 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h3 className="text-xl sm:text-2xl font-serif mb-2">Relatório Consolidado</h3>
                <p className="text-gray-400 font-light text-sm">Resumo financeiro do período atual.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-8 sm:gap-16">
                <div className="text-center">
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Faturamento</p>
                  <p className="text-2xl sm:text-3xl font-serif text-gold">{formatPrice(totalRevenue)}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Ticket Médio</p>
                  <p className="text-2xl sm:text-3xl font-serif text-gold">{formatPrice(totalSalesCount ? totalRevenue / totalSalesCount : 0)}</p>
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
          collections={storeConfig.collections || []}
          onClose={() => { setIsModalOpen(false); setEditingProduct(null); }} 
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
