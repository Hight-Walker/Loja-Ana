import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User as UserIcon, Mail, Lock, MapPin, ArrowRight, CreditCard, Calendar, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getUsers, saveUser, setCurrentUser } from './lib/storage';
import { User } from './types';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    phone: '',
    cpf: '',
    birthDate: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getUsers();
    
    if (users.find(u => u.email === formData.email)) {
      setError('Este e-mail já está em uso.');
      return;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      role: 'user'
    };

    saveUser(newUser);
    setCurrentUser(newUser);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-premium-black flex items-center justify-center p-2 py-12 relative overflow-hidden w-full">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=1920" 
          alt="Luxury Watch Background" 
          className="w-full h-full object-cover opacity-30"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-premium-black/80 via-premium-black/60 to-premium-black/90" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-[94vw] sm:w-full bg-white rounded-3xl p-2 sm:p-12 shadow-2xl relative z-10 backdrop-blur-sm bg-white/95 overflow-hidden"
      >
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-serif mb-2">Criar Conta</h1>
          <p className="text-gray-400 text-sm font-light px-2">Para sua segurança e do vendedor, solicitamos dados completos.</p>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 text-xs p-4 rounded-xl font-medium mx-2">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 px-1">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Nome Completo</label>
              <div className="flex items-center bg-gray-50 rounded-xl focus-within:ring-2 focus-within:ring-gold transition-all overflow-hidden">
                <div className="pl-3 pr-2 text-gray-300 flex-shrink-0">
                  <UserIcon size={18} />
                </div>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="flex-1 bg-transparent border-none py-4 pr-3 outline-none text-sm sm:text-base min-w-0 w-full" placeholder="Seu Nome" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">E-mail</label>
              <div className="flex items-center bg-gray-50 rounded-xl focus-within:ring-2 focus-within:ring-gold transition-all overflow-hidden">
                <div className="pl-3 pr-2 text-gray-300 flex-shrink-0">
                  <Mail size={18} />
                </div>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="flex-1 bg-transparent border-none py-4 pr-3 outline-none text-sm sm:text-base min-w-0 w-full" placeholder="seu@email.com" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">CPF</label>
              <div className="flex items-center bg-gray-50 rounded-xl focus-within:ring-2 focus-within:ring-gold transition-all overflow-hidden">
                <div className="pl-3 pr-2 text-gray-300 flex-shrink-0">
                  <CreditCard size={18} />
                </div>
                <input required type="text" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} className="flex-1 bg-transparent border-none py-4 pr-3 outline-none text-sm sm:text-base min-w-0 w-full" placeholder="000.000.000-00" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Senha</label>
              <div className="flex items-center bg-gray-50 rounded-xl focus-within:ring-2 focus-within:ring-gold transition-all overflow-hidden">
                <div className="pl-3 pr-2 text-gray-300 flex-shrink-0">
                  <Lock size={18} />
                </div>
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="flex-1 bg-transparent border-none py-4 pr-3 outline-none text-sm sm:text-base min-w-0 w-full" placeholder="••••••••" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Telefone</label>
              <div className="flex items-center bg-gray-50 rounded-xl focus-within:ring-2 focus-within:ring-gold transition-all overflow-hidden">
                <div className="pl-3 pr-2 text-gray-300 flex-shrink-0">
                  <Phone size={18} />
                </div>
                <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="flex-1 bg-transparent border-none py-4 pr-3 outline-none text-sm sm:text-base min-w-0 w-full" placeholder="(00) 00000-0000" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Data de Nascimento</label>
              <div className="flex items-center bg-gray-50 rounded-xl focus-within:ring-2 focus-within:ring-gold transition-all overflow-hidden">
                <div className="pl-3 pr-2 text-gray-300 flex-shrink-0">
                  <Calendar size={18} />
                </div>
                <input required type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="flex-1 bg-transparent border-none py-4 pr-1 outline-none h-[56px] text-sm sm:text-base min-w-0 w-full" />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Endereço Completo</label>
              <div className="flex items-center bg-gray-50 rounded-xl focus-within:ring-2 focus-within:ring-gold transition-all overflow-hidden">
                <div className="pl-3 pr-2 text-gray-300 flex-shrink-0">
                  <MapPin size={18} />
                </div>
                <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="flex-1 bg-transparent border-none py-4 pr-3 outline-none text-sm sm:text-base min-w-0 w-full" placeholder="Rua, Número, Bairro, Cidade, CEP" />
              </div>
            </div>
          </div>
          
          <button type="submit" className="w-full bg-premium-black text-white py-5 rounded-xl font-bold uppercase tracking-widest hover:bg-gold transition-all duration-300 flex items-center justify-center gap-3">
            Finalizar Cadastro
            <ArrowRight size={20} />
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-gray-400">
          Já tem uma conta? <Link to="/login" className="text-gold font-bold hover:underline">Entre aqui</Link>
        </p>
      </motion.div>
    </div>
  );
};
