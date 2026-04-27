import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hammer, Clock, AlertTriangle, Terminal, X, Lock } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './lib/firebase';
import { getUserProfile, setCurrentUser } from './lib/storage';

interface MaintenanceModeProps {
  time?: string;
  reason?: string;
}

export const MaintenanceMode: React.FC<MaintenanceModeProps> = ({ time, reason }) => {
  const [showDevLogin, setShowDevLogin] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const profile = await getUserProfile(userCredential.user.uid);
      
      if (profile && profile.role === 'dev') {
        setCurrentUser(profile);
        window.location.reload(); // Recarrega para aplicar o estado logado
      } else {
        setError('Acesso negado. Credenciais inválidas ou sem privilégios DEV.');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err: any) {
      setError('Acesso negado. Credenciais inválidas.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-mono text-white selection:bg-gold selection:text-black">
      {/* Immersive Background Layer */}
      <div className="absolute inset-0 z-0">
        {/* Animated Cyber Grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #C5A572 1px, transparent 1px), linear-gradient(to bottom, #C5A572 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
          }}
        />
        
        {/* Dynamic Light Orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-gold/20 rounded-full blur-[120px]"
        />
        
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.05, 0.1, 0.05],
            x: [0, -40, 0],
            y: [0, 60, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px]"
        />

        {/* Scanlines Effect */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none z-20" />
      </div>

      <AnimatePresence mode="wait">
        {!showDevLogin ? (
          <motion.div 
            key="maintenance-card"
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(15px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(15px)' }}
            transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
            className="max-w-2xl w-full bg-[#0A0A0A]/80 backdrop-blur-3xl border border-white/5 p-12 rounded-[3rem] relative z-30 shadow-[0_40px_100px_rgba(0,0,0,0.9)] overflow-hidden"
          >
            {/* Top Border Glow */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

            <div className="text-center space-y-12">
              <motion.div 
                animate={{ 
                  y: [0, -10, 0],
                  filter: ["drop-shadow(0 0 10px rgba(197,165,114,0.1))", "drop-shadow(0 0 25px rgba(197,165,114,0.3))", "drop-shadow(0 0 10px rgba(197,165,114,0.1))"]
                }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="w-28 h-28 bg-gradient-to-br from-gold/10 to-transparent text-gold rounded-[2rem] flex items-center justify-center mx-auto border border-gold/20 relative"
              >
                <Hammer size={48} strokeWidth={1} />
                <div className="absolute inset-0 rounded-[2rem] bg-gold/5 animate-ping opacity-20" />
              </motion.div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-gold/50 text-[10px] uppercase tracking-[0.6em] font-black"
                  >
                    System Override Active
                  </motion.p>
                  <h1 className="text-5xl md:text-7xl font-serif text-white tracking-tighter leading-tight italic">
                    Protocolo <span className="text-gold not-italic">Chronos</span>
                  </h1>
                </div>

                {/* Aesthetic Progress Bar */}
                <div className="max-w-xs mx-auto space-y-3">
                  <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden relative">
                    <motion.div 
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-gold to-transparent"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[8px] uppercase tracking-widest text-gold/30 font-bold">
                    <span>Sync Link: Estabilizando</span>
                    <motion.span 
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      Buscando Dados...
                    </motion.span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/[0.01] p-8 rounded-[2rem] border border-white/5 text-left group hover:border-gold/10 hover:bg-white/[0.03] transition-all duration-500"
                >
                  <div className="flex items-center gap-3 text-gold/40 mb-4">
                    <Clock size={16} strokeWidth={1.5} />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">Restabelecimento</span>
                  </div>
                  <p className="text-2xl text-white font-serif italic">{time || "T-Minus: Indefinido"}</p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/[0.01] p-8 rounded-[2rem] border border-white/5 text-left group hover:border-gold/10 hover:bg-white/[0.03] transition-all duration-500"
                >
                  <div className="flex items-center gap-3 text-blue-400/40 mb-4">
                    <AlertTriangle size={16} strokeWidth={1.5} />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">Diretriz Atual</span>
                  </div>
                  <p className="text-[13px] text-gray-500 leading-relaxed font-sans font-medium line-clamp-2">
                    {reason || "Reconfiguração de protocolos de segurança e otimização de cache global Chronos."}
                  </p>
                </motion.div>
              </div>

              <div className="pt-8 flex flex-col items-center gap-8">
                <motion.button 
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDevLogin(true)}
                  className="group relative flex items-center gap-4 text-[10px] text-gray-400 hover:text-white transition-all uppercase tracking-[0.3em] font-black py-4 px-10 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-gold/50 shadow-[0_0_0_rgba(197,165,114,0)] hover:shadow-[0_0_40px_rgba(197,165,114,0.15)]"
                >
                  <Terminal size={14} className="group-hover:text-gold transition-colors" />
                  Terminal de Acesso Dev
                  {/* Subtle highlight inner effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
                
                <div className="flex flex-col items-center gap-2">
                  <div className="h-[1px] w-8 bg-gold/10" />
                  <p className="text-[8px] text-gray-700 uppercase tracking-[0.4em] font-black">
                    Secure Cloud Infrastructure // Node.CS-99
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="login-card"
            initial={{ opacity: 0, scale: 0.9, y: 50, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.1, y: -50, filter: 'blur(20px)' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[420px] w-full bg-[#080808]/95 backdrop-blur-3xl border border-gold/30 p-10 rounded-[2.5rem] relative z-40 shadow-[0_0_120px_rgba(0,0,0,1)] overflow-hidden"
          >
            {/* Animated Glow behind card */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-gold/10 rounded-full blur-[60px]" />
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
            
            <div className="flex justify-between items-start mb-12">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gold animate-pulse">
                  <Lock size={12} strokeWidth={2.5} />
                  <span className="text-[9px] uppercase tracking-[0.4em] font-black">Level 0 Override</span>
                </div>
                <h2 className="text-3xl font-serif text-white italic tracking-tight">Câmera Fria</h2>
                <div className="h-0.5 w-12 bg-gold/30 rounded-full" />
              </div>
              <motion.button 
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowDevLogin(false)}
                className="p-3 bg-white/[0.03] hover:bg-gold/10 rounded-full transition-all text-gray-600 hover:text-gold border border-transparent hover:border-gold/20"
              >
                <X size={20} />
              </motion.button>
            </div>

            <form onSubmit={handleDevLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-[0.4em] text-gray-500 font-black ml-1">E-Mail do Sistema</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 px-6 text-sm focus:border-gold/50 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(197,165,114,0.05)] outline-none transition-all placeholder:text-gray-800"
                  placeholder="admin.dev@chronos.io"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-[0.4em] text-gray-500 font-black ml-1">Assinatura Digital</label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 px-6 text-sm focus:border-gold/50 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(197,165,114,0.05)] outline-none transition-all placeholder:text-gray-800"
                  placeholder="••••••••••••"
                  required
                />
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl"
                >
                  <p className="text-[10px] text-red-500/80 text-center font-black uppercase tracking-widest">
                    Falha na Autenticação
                  </p>
                </motion.div>
              )}

              <button 
                type="submit"
                className="w-full bg-gold hover:bg-white text-black font-black text-[12px] uppercase tracking-[0.3em] py-5 rounded-2xl transition-all shadow-[0_20px_40px_rgba(197,165,114,0.2)] active:scale-[0.98] mt-4 relative overflow-hidden group"
              >
                <span className="relative z-10">Bypassar Segurança</span>
                <div className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
              </button>
            </form>

            <div className="mt-12 flex flex-col items-center gap-4">
               <div className="flex gap-2">
                 {[1,2,3,4].map(i => (
                   <motion.div 
                    key={i} 
                    animate={{ opacity: [0.1, 0.4, 0.1] }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
                    className="w-2 h-0.5 bg-gold/40 rounded-full" 
                   />
                 ))}
               </div>
               <p className="text-[7px] text-gray-700 uppercase tracking-[0.5em]">Encryption Standard AES-256</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
