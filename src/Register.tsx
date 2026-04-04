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
    <div className="min-h-screen bg-premium-black flex items-center justify-center p-6 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-3xl p-12 shadow-2xl"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif mb-2">Criar Conta</h1>
          <p className="text-gray-400 text-sm font-light">Para sua segurança e do vendedor, solicitamos dados completos.</p>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 text-xs p-4 rounded-xl font-medium">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Nome Completo</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-4 pl-12 outline-none focus:ring-2 focus:ring-gold transition-all" placeholder="Seu Nome" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-4 pl-12 outline-none focus:ring-2 focus:ring-gold transition-all" placeholder="seu@email.com" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">CPF</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input required type="text" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-4 pl-12 outline-none focus:ring-2 focus:ring-gold transition-all" placeholder="000.000.000-00" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Telefone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-4 pl-12 outline-none focus:ring-2 focus:ring-gold transition-all" placeholder="(00) 00000-0000" />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Endereço Completo</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-4 pl-12 outline-none focus:ring-2 focus:ring-gold transition-all" placeholder="Rua, Número, Bairro, Cidade, CEP" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Data de Nascimento</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input required type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-4 pl-12 outline-none focus:ring-2 focus:ring-gold transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-4 pl-12 outline-none focus:ring-2 focus:ring-gold transition-all" placeholder="••••••••" />
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
