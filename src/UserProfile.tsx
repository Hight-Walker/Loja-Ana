import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User as UserIcon, ShoppingBag, MapPin, Phone, Mail, Calendar, Hash, Save, ArrowLeft, LogOut, Package, ChevronRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Order } from './types';
import { getCurrentUser, getOrders, setCurrentUser, updateUser } from './lib/storage';
import { formatPrice, cn } from './lib/utils';
import { Toast, ToastType } from './components/UI';

export const UserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User | null>(null);
  const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({ message: '', type: 'success', isVisible: false });
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    setFormData(currentUser);
  }, [navigate]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      updateUser(formData);
      // Update current session too
      const isPersistent = !!localStorage.getItem('chronos_current_user');
      setCurrentUser(formData, isPersistent);
      setUser(formData);
      setIsEditing(false);
      setToast({ message: 'Informações atualizadas com sucesso!', type: 'success', isVisible: true });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  if (!user || !formData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />
      {/* Header */}
      <header className="bg-premium-black text-white py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gold/20 rounded-full flex items-center justify-center border-2 border-gold/30">
              <UserIcon size={48} className="text-gold" />
            </div>
            <div>
              <h1 className="text-3xl font-serif mb-1">{user.name}</h1>
              <p className="text-gray-400 text-sm uppercase tracking-widest">{user.role === 'admin' ? 'Administrador' : 'Cliente Premium'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={16} /> Voltar para a Loja
            </Link>
            <button 
              onClick={handleLogout}
              className="bg-white/10 hover:bg-red-500/20 hover:text-red-500 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <LogOut size={16} /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 -mt-8 pb-24">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          {/* Title */}
          <div className="p-8 border-b">
            <h2 className="text-xl font-serif font-bold uppercase tracking-widest text-premium-black">Informações Pessoais</h2>
          </div>

          <div className="p-8 md:p-12">
            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                    <UserIcon size={12} /> Nome Completo
                  </label>
                  <input 
                    disabled={!isEditing}
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold disabled:opacity-60 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                    <Mail size={12} /> E-mail
                  </label>
                  <input 
                    disabled={!isEditing}
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold disabled:opacity-60 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                    <Hash size={12} /> CPF (Não alterável)
                  </label>
                  <input 
                    disabled
                    type="text" 
                    value={formData.cpf || 'Não informado'} 
                    className="w-full bg-gray-100 border-none rounded-xl p-4 outline-none opacity-60 cursor-not-allowed font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                    <Phone size={12} /> Telefone
                  </label>
                  <input 
                    disabled={!isEditing}
                    type="tel" 
                    value={formData.phone || ''} 
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="(00) 00000-0000"
                    className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold disabled:opacity-60 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                    <Calendar size={12} /> Data de Nascimento
                  </label>
                  <input 
                    disabled={!isEditing}
                    type="date" 
                    value={formData.birthDate || ''} 
                    onChange={e => setFormData({...formData, birthDate: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold disabled:opacity-60 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                    <MapPin size={12} /> Endereço de Entrega
                  </label>
                  <input 
                    disabled={!isEditing}
                    type="text" 
                    value={formData.address || ''} 
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    placeholder="Rua, Número, Bairro, Cidade - UF"
                    className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-gold disabled:opacity-60 transition-all"
                  />
                </div>
              </div>

              <div className="pt-8 border-t flex justify-end gap-4">
                {!isEditing ? (
                  <button 
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="bg-premium-black text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gold transition-all"
                  >
                    Editar Informações
                  </button>
                ) : (
                  <>
                    <button 
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData(user);
                      }}
                      className="bg-gray-100 text-gray-600 px-10 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="bg-gold text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-premium-black transition-all flex items-center gap-2"
                    >
                      <Save size={18} /> Salvar Alterações
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
