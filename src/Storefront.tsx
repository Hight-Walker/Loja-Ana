import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Menu, X, ChevronRight, Star, Search, Filter, Trash2, Plus, Minus, ArrowRight, CheckCircle2, LayoutDashboard, User as UserIcon, LogOut, Mail, Phone, MapPin, Instagram, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Product, CartItem, Order, User, StoreConfig } from './types';
import { getProducts, saveOrder, getCurrentUser, setCurrentUser, clearAllSessions, getStoreConfig } from './lib/storage';
import { cn, formatPrice } from './lib/utils';
import { Toast, ToastType } from './components/UI';

// --- Sub-components ---

const Navbar = ({ cartCount, onOpenCart, user, onLogout, storeConfig }: { cartCount: number, onOpenCart: () => void, user: User | null, onLogout: () => void, storeConfig: StoreConfig }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4", isScrolled ? "glass-effect py-3 shadow-sm" : "bg-transparent")}>
      <div className="max-w-7xl mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="flex justify-start min-w-0">
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium uppercase tracking-widest shrink-0">
            <Link to="/" className="hover:text-gold transition-colors">Coleções</Link>
          </div>
          {/* Mobile placeholder */}
          <div className="md:hidden w-6" />
        </div>

        <div className="flex justify-center min-w-0">
          <Link 
            to="/" 
            className="flex items-center hover:text-gold transition-colors group shrink-0"
            title="Ir para o Início"
          >
            {storeConfig.logo ? (
              <img src={storeConfig.logo} alt={storeConfig.name} className="h-6 sm:h-8 w-auto object-contain" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-xl sm:text-2xl font-serif font-bold tracking-tighter truncate max-w-[150px] sm:max-w-none">{storeConfig.name}<span className="text-gold">.</span></span>
            )}
          </Link>
        </div>

        <div className="flex justify-end items-center space-x-2 sm:space-x-6 shrink-0">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-4">
              {user.role === 'admin' ? (
                <Link to="/manager" className="flex items-center gap-2 group" title="Painel Admin">
                  <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all shrink-0">
                    <LayoutDashboard size={16} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest hidden lg:block group-hover:text-gold transition-colors truncate max-w-[100px]">Painel Admin</span>
                </Link>
              ) : (
                <Link to="/profile" className="flex items-center gap-2 group" title="Meu Perfil">
                  <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all shrink-0">
                    <UserIcon size={16} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest hidden lg:block group-hover:text-gold transition-colors truncate max-w-[100px]">Olá, {user.name.split(' ')[0]}</span>
                </Link>
              )}
              
              <button 
                onClick={onLogout} 
                className="p-2 hover:text-gold transition-colors" 
                title="Sair"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="p-2 hover:text-gold transition-colors" title="Entrar">
              <UserIcon size={24} />
            </Link>
          )}
          <Link to="/cart" className="relative p-2 hover:text-gold transition-colors">
            <ShoppingBag size={24} />
            {cartCount > 0 && <span className="absolute top-0 right-0 bg-gold text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">{cartCount}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
};

const Hero = ({ storeConfig }: { storeConfig: StoreConfig }) => (
  <section className="relative h-[90vh] md:h-screen flex items-center justify-center overflow-hidden bg-premium-black text-white">
    <motion.div 
      initial={{ scale: 1.1, opacity: 0 }} 
      animate={{ scale: 1, opacity: 0.4 }} 
      transition={{ duration: 2.5, ease: "easeOut" }} 
      className="absolute inset-0 z-0"
    >
      <img 
        src={storeConfig.homepageBackground || "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=2000"} 
        alt="Imagem de Destaque" 
        className="w-full h-full object-cover" 
        referrerPolicy="no-referrer" 
      />
    </motion.div>
    <div className="relative z-10 text-center px-6 max-w-5xl">
      <motion.span 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.5 }} 
        className="text-gold uppercase tracking-[0.4em] text-[10px] sm:text-xs font-bold mb-6 block"
      >
        Excelência em cada segundo
      </motion.span>
      <motion.h1 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.7, duration: 1, ease: [0.22, 1, 0.36, 1] }} 
        className="text-4xl sm:text-6xl md:text-8xl font-serif mb-8 leading-[1.1] tracking-tight"
      >
        A Arte da <br /> <span className="italic text-gold">Precisão Eterna</span>
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 1.2, duration: 1 }} 
        className="text-gray-300 text-base sm:text-lg md:text-xl mb-12 max-w-2xl mx-auto font-light leading-relaxed"
      >
        {storeConfig.description}
      </motion.p>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 1.5 }}
      >
        <button 
          onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} 
          className="bg-gold hover:bg-white hover:text-premium-black text-white px-8 sm:px-12 py-4 sm:py-5 rounded-full transition-all duration-500 font-bold tracking-[0.2em] uppercase text-[10px] sm:text-xs flex items-center gap-3 mx-auto group shadow-2xl shadow-gold/20 hover:shadow-white/10"
        >
          Explorar Coleção 
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </div>
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2, duration: 1 }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block"
    >
      <div className="w-[1px] h-20 bg-gradient-to-b from-gold to-transparent animate-pulse" />
    </motion.div>
  </section>
);

const ProductCard = ({ product, onAddToCart }: any) => (
  <motion.div 
    layout 
    initial={{ opacity: 0, y: 30 }} 
    whileInView={{ opacity: 1, y: 0 }} 
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    className="group"
  >
    <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 mb-6 rounded-2xl shadow-sm group-hover:shadow-xl transition-all duration-500">
      {product.isBestSeller && (
        <span className="absolute top-4 left-4 z-10 bg-gold text-white text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg">
          <Star size={10} fill="currentColor" /> Mais Vendido
        </span>
      )}
      <Link to={`/product/${product.id}`} className="block w-full h-full">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110" 
          referrerPolicy="no-referrer" 
        />
      </Link>
      <div className="absolute inset-0 bg-premium-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4 pointer-events-none group-hover:pointer-events-auto backdrop-blur-[2px]">
        <Link to={`/product/${product.id}`} className="bg-white text-premium-black p-4 rounded-full hover:bg-gold hover:text-white transition-all duration-300 transform translate-y-8 group-hover:translate-y-0 shadow-2xl">
          <Search size={22} />
        </Link>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart(product);
          }} 
          className="bg-white text-premium-black p-4 rounded-full hover:bg-gold hover:text-white transition-all duration-300 transform translate-y-8 group-hover:translate-y-0 delay-75 shadow-2xl"
        >
          <ShoppingBag size={22} />
        </button>
      </div>
    </div>
    <div className="text-center px-2">
      <p className="text-[10px] text-gold font-bold uppercase tracking-[0.2em] mb-2">{product.category}</p>
      <Link to={`/product/${product.id}`}>
        <h3 className="font-serif text-xl sm:text-2xl mb-2 group-hover:text-gold transition-colors duration-300">{product.name}</h3>
      </Link>
      <div className="flex items-center justify-center gap-3">
        <div className="h-[1px] w-4 bg-gray-200" />
        <p className="text-premium-black font-medium text-lg">{formatPrice(product.price)}</p>
        <div className="h-[1px] w-4 bg-gray-200" />
      </div>
    </div>
  </motion.div>
);

const Footer = ({ storeConfig }: { storeConfig: StoreConfig }) => (
  <footer className="bg-premium-black text-white pt-24 pb-12 px-6 border-t border-white/5">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
      <div className="col-span-1 md:col-span-2">
        {storeConfig.logo ? (
          <img src={storeConfig.logo} alt={storeConfig.name} className="h-10 w-auto object-contain mb-8" referrerPolicy="no-referrer" />
        ) : (
          <h2 className="text-3xl font-serif font-bold tracking-tighter mb-8">{storeConfig.name}<span className="text-gold">.</span></h2>
        )}
        <p className="text-gray-400 max-w-sm mb-8 font-light leading-relaxed">{storeConfig.description}</p>
        <div className="flex space-x-6">
          {storeConfig.instagram && (
            <a 
              href={storeConfig.instagram.startsWith('http') ? storeConfig.instagram : `https://instagram.com/${storeConfig.instagram.replace('@', '')}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-gold transition-colors"
            >
              <Instagram size={20} />
            </a>
          )}
          <a href="#" className="text-gray-400 hover:text-gold transition-colors"><Globe size={20} /></a>
        </div>
      </div>
      <div>
        <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 text-gold">Contato</h4>
        <ul className="space-y-4 text-gray-400 text-sm font-light">
          <li className="flex items-center gap-3"><Mail size={16} className="text-gold" /> {storeConfig.email}</li>
          <li className="flex items-center gap-3"><Phone size={16} className="text-gold" /> {storeConfig.phone}</li>
          <li className="flex items-center gap-3"><MapPin size={16} className="text-gold" /> {storeConfig.address}</li>
        </ul>
      </div>
      <div>
        <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 text-gold">Coleções</h4>
        <ul className="space-y-4 text-gray-400 text-sm font-light">
          {(storeConfig.collections || ["Luxo", "Esportivo", "Clássico", "Minimalista"]).map(c => (
            <li key={c}><a href="#products" className="hover:text-gold transition-colors">{c}</a></li>
          ))}
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
      <div className="flex flex-col gap-2 text-center md:text-left">
        <p>© 2024 {storeConfig.name} PREMIUM WATCHES. TODOS OS DIREITOS RESERVADOS.</p>
        <p className="text-gold/60">DESENVOLVIDO POR GUSTAVO WALKER, CEO DA DS COMPANY</p>
      </div>
      <div className="flex space-x-8">
        <a href="#" className="hover:text-white transition-colors">POLÍTICA DE PRIVACIDADE</a>
        <a href="#" className="hover:text-white transition-colors">TERMOS DE USO</a>
      </div>
    </div>
  </footer>
);

export const Storefront = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('chronos_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [user, setUser] = useState<User | null>(null);
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(getStoreConfig());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');
  const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({ message: '', type: 'success', isVisible: false });
  const navigate = useNavigate();

  useEffect(() => {
    setProducts(getProducts());
    setUser(getCurrentUser());

    const handleConfigUpdate = () => {
      setStoreConfig(getStoreConfig());
    };

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

    window.addEventListener('storeConfigUpdated', handleConfigUpdate);
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('storeConfigUpdated', handleConfigUpdate);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  useEffect(() => {
    const currentSaved = localStorage.getItem('chronos_cart');
    const currentCartStr = JSON.stringify(cart);
    if (currentSaved !== currentCartStr) {
      localStorage.setItem('chronos_cart', currentCartStr);
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }, [cart]);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`${product.name} adicionado ao carrinho!`);
    // Sync with other components
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUser(null);
    navigate('/');
  };

  const handleCheckoutClick = () => {
    if (!user) {
      setIsCartOpen(false);
      showToast('Você precisa estar logado para finalizar a compra.', 'error');
      navigate('/login');
      return;
    }
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const updateQty = (id: string, delta: number) => setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));

  const handleCheckoutComplete = (customerData: any) => {
    const newOrder: Order = { 
      id: Math.random().toString(36).substr(2, 9).toUpperCase(), 
      userId: user?.id || 'guest',
      items: cart, 
      total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), 
      customer: customerData, 
      date: new Date().toISOString(),
      status: 'Processando',
      paymentMethod: 'Cartão de Crédito'
    };
    saveOrder(newOrder);
    setCart([]);
    setIsCheckoutOpen(false);
    showToast('Pedido realizado com sucesso!', 'success');
  };

  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = products
    .filter(p => filter === 'Todos' || p.category === filter)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === 'price-asc' ? a.price - b.price : sort === 'price-desc' ? b.price - a.price : 0);

  return (
    <div className="min-h-screen">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />
      <Navbar 
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
        onOpenCart={() => setIsCartOpen(true)} 
        user={user}
        onLogout={handleLogout}
        storeConfig={storeConfig}
      />
      <Hero storeConfig={storeConfig} />
      <section id="products" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold mb-4 block">Nossa Curadoria</span>
            <h2 className="text-4xl md:text-6xl font-serif">Coleções <br className="hidden sm:block" /> <span className="italic">Exclusivas</span></h2>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
          >
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar relógio..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                className="bg-gray-50 border border-transparent rounded-full pl-14 pr-8 py-4 focus:bg-white focus:ring-2 focus:ring-gold/10 focus:border-gold/20 outline-none text-sm w-full md:w-80 transition-all shadow-sm" 
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-gold" size={16} />
              <select 
                value={filter} 
                onChange={e => setFilter(e.target.value)} 
                className="bg-gray-50 rounded-full pl-12 pr-10 py-4 border border-transparent focus:bg-white focus:ring-2 focus:ring-gold/10 focus:border-gold/20 outline-none text-sm font-bold appearance-none cursor-pointer transition-all shadow-sm w-full"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronRight size={14} className="rotate-90" />
              </div>
            </div>
          </motion.div>
        </div>
        <motion.div 
          layout 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-20"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart} 
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </section>
      <Footer storeConfig={storeConfig} />
    </div>
  );
};
