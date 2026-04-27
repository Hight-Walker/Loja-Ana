import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User as UserIcon, Mail, Lock, MapPin, ArrowRight, CreditCard, Calendar, Phone, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from './types';
import { CEPInput } from './components/CEPInput';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './lib/firebase';
import { updateUserProfile, setCurrentUser } from './lib/storage';

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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const newUser: User = {
        id: userCredential.user.uid,
        name: formData.name,
        email: formData.email,
        address: formData.address,
        phone: formData.phone,
        cpf: formData.cpf,
        birthDate: formData.birthDate,
        role: 'user'
      };

      await updateUserProfile(newUser);
      setCurrentUser(newUser);
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-premium-black flex items-center justify-center p-2 py-12 relative overflow-hidden w-full">
      {/* Back to store button */}
      <Link 
        to="/" 
        className="absolute top-8 left-8 z-20 flex items-center gap-3 text-white/80 hover:text-gold transition-all group"
      >
        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-gold/10 group-hover:border-gold transition-all">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] hidden sm:block">Loja</span>
      </Link>
      
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 px-1">
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 ml-1">Nome Completo</label>
              <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl focus-within:ring-2 focus-within:ring-gold/20 focus-within:border-gold transition-all overflow-hidden">
                <div className="pl-4 pr-3 text-gray-300 flex-shrink-0">
                  <UserIcon size={16} />
                </div>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="flex-1 bg-transparent border-none h-[56px] pr-4 outline-none text-sm min-w-0 w-full font-medium" placeholder="Seu Nome Completo" />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 ml-1">E-mail</label>
              <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl focus-within:ring-2 focus-within:ring-gold/20 focus-within:border-gold transition-all overflow-hidden">
                <div className="pl-4 pr-3 text-gray-300 flex-shrink-0">
                  <Mail size={16} />
                </div>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="flex-1 bg-transparent border-none h-[56px] pr-4 outline-none text-sm min-w-0 w-full font-medium" placeholder="seu@email.com" />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 ml-1">CPF</label>
              <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl focus-within:ring-2 focus-within:ring-gold/20 focus-within:border-gold transition-all overflow-hidden">
                <div className="pl-4 pr-3 text-gray-300 flex-shrink-0">
                  <CreditCard size={16} />
                </div>
                <input required type="text" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} className="flex-1 bg-transparent border-none h-[56px] pr-4 outline-none text-sm min-w-0 w-full font-mono font-medium" placeholder="000.000.000-00" />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 ml-1">Senha</label>
              <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl focus-within:ring-2 focus-within:ring-gold/20 focus-within:border-gold transition-all overflow-hidden">
                <div className="pl-4 pr-3 text-gray-300 flex-shrink-0">
                  <Lock size={16} />
                </div>
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="flex-1 bg-transparent border-none h-[56px] pr-4 outline-none text-sm min-w-0 w-full font-medium" placeholder="••••••••" />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 ml-1">Telefone</label>
              <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl focus-within:ring-2 focus-within:ring-gold/20 focus-within:border-gold transition-all overflow-hidden">
                <div className="pl-4 pr-3 text-gray-300 flex-shrink-0">
                  <Phone size={16} />
                </div>
                <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="flex-1 bg-transparent border-none h-[56px] pr-4 outline-none text-sm min-w-0 w-full font-medium" placeholder="(00) 00000-0000" />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 ml-1">Data de Nascimento</label>
              <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl focus-within:ring-2 focus-within:ring-gold/20 focus-within:border-gold transition-all overflow-hidden">
                <div className="pl-4 pr-3 text-gray-300 flex-shrink-0">
                  <Calendar size={16} />
                </div>
                <input required type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="flex-1 bg-transparent border-none h-[56px] pr-4 outline-none text-sm min-w-0 w-full font-medium" />
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
              <CEPInput 
                value={formData.address} 
                onChange={(address) => setFormData({...formData, address})} 
                minimal={true}
                className="!p-0 !bg-transparent !border-none !shadow-none"
              />
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
