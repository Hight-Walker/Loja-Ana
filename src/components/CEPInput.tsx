import React, { useState, useEffect } from 'react';
import { MapPin, Search, Loader2, Home, Hash, Info, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CEPInputProps {
  value: string; // The combined string: "Street, Number - Complement, Neighborhood, City - State, CEP"
  onChange: (address: string) => void;
  label?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  minimal?: boolean;
}

export const CEPInput: React.FC<CEPInputProps> = ({ 
  value, 
  onChange, 
  label = "Endereço de Entrega",
  className = "",
  minimal = false
}) => {
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [cityST, setCityST] = useState('');
  const [cep, setCep] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCepFound, setIsCepFound] = useState(false);

  // Update internal state when external value changes (mount only mainly to avoid feedback loops)
  useEffect(() => {
    if (value) {
      // Expected Format: "Street, Number - Complement, Neighborhood, City - State, CEP"
      const parts = value.split(', ').map(p => p.trim());
      if (parts.length >= 5) {
        setStreet(parts[0]);
        
        const numComp = parts[1].split(' - ');
        setNumber(numComp[0] || '');
        setComplement(numComp[1] || '');
        
        setNeighborhood(parts[2] || '');
        setCityST(parts[3] || '');
        const currentCep = parts[4] || '';
        setCep(currentCep);
        
        if (currentCep.replace(/\D/g, '').length === 8) {
          setIsCepFound(true);
        }
      } else {
        // Fallback for simpler strings (e.g., initial seed data or legacy data)
        setStreet(value);
      }
    }
  }, []); // Initial load only

  const updateParent = (s: string, n: string, co: string, b: string, cs: string, c: string) => {
    const formatted = `${s}, ${n || ''}${co ? ` - ${co}` : ''}, ${b}, ${cs}, ${c}`.trim().replace(/^, /, '');
    onChange(formatted);
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    
    let formatted = val;
    if (val.length > 5) {
      formatted = `${val.slice(0, 5)}-${val.slice(5)}`;
    }
    setCep(formatted);

    if (val.length === 8) {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch(`https://viacep.com.br/ws/${val}/json/`);
        const data = await response.json();
        
        if (data.erro) {
          setError('CEP não encontrado.');
          setIsCepFound(false);
        } else {
          setStreet(data.logradouro || '');
          setNeighborhood(data.bairro || '');
          setCityST(`${data.localidade} - ${data.uf}`);
          setError('');
          setIsCepFound(true);
          updateParent(data.logradouro || '', number, complement, data.bairro || '', `${data.localidade} - ${data.uf}`, formatted);
        }
      } catch (err) {
        setError('Erro ao buscar CEP.');
        setIsCepFound(false);
      } finally {
        setIsLoading(false);
      }
    } else {
       setIsCepFound(false);
       updateParent(street, number, complement, neighborhood, cityST, formatted);
    }
  };

  const handleFieldChange = (field: string, val: string) => {
    if (field === 'street') { setStreet(val); updateParent(val, number, complement, neighborhood, cityST, cep); }
    if (field === 'number') { setNumber(val); updateParent(street, val, complement, neighborhood, cityST, cep); }
    if (field === 'complement') { setComplement(val); updateParent(street, number, val, neighborhood, cityST, cep); }
    if (field === 'neighborhood') { setNeighborhood(val); updateParent(street, number, complement, val, cityST, cep); }
  };

  const containerClasses = minimal 
    ? `space-y-4 ${className}`
    : `space-y-4 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm ${className}`;

  return (
    <div className={containerClasses}>
      <div className="flex items-center justify-between px-1">
         <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-premium-black flex items-center gap-2">
           <MapPin size={12} className="text-gold" /> {label}
         </label>
         {isLoading && <Loader2 size={12} className="text-gold animate-spin" />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CEP Field */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1">Para começar, digite o seu CEP</label>
          <div className="flex items-center bg-gray-50 rounded-2xl focus-within:ring-2 focus-within:ring-gold/20 transition-all overflow-hidden border border-gray-200/50">
            <div className="pl-4 pr-3 text-gray-400">
              <Search size={15} />
            </div>
            <input 
              type="text" 
              value={cep} 
              onChange={handleCepChange} 
              className="flex-1 bg-transparent border-none h-[56px] pr-4 outline-none text-sm font-mono placeholder:text-gray-300" 
              placeholder="00000-000"
            />
          </div>
          {error && <p className="text-[9px] text-red-500 font-bold uppercase tracking-wider ml-1 mt-1">{error}</p>}
        </div>

        <AnimatePresence>
          {isCepFound && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden pt-2"
            >
              {/* Street Field */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1">Rua / Logradouro</label>
                <div className="flex items-center bg-gray-50 rounded-2xl focus-within:ring-2 focus-within:ring-gold/20 transition-all overflow-hidden border border-gray-200/50">
                  <div className="pl-4 pr-3 text-gray-400">
                    <Home size={15} />
                  </div>
                  <input 
                    required
                    type="text" 
                    value={street} 
                    onChange={e => handleFieldChange('street', e.target.value)} 
                    className="flex-1 bg-transparent border-none h-[56px] pr-4 outline-none text-sm placeholder:text-gray-300" 
                    placeholder="Ex: Av. Paulista"
                  />
                </div>
              </div>

              {/* Number and Complement */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1">Número</label>
                <div className="flex items-center bg-gray-50 rounded-2xl focus-within:ring-2 focus-within:ring-gold/20 transition-all overflow-hidden border border-gray-200/50">
                  <div className="pl-4 pr-3 text-gray-400">
                    <Hash size={15} />
                  </div>
                  <input 
                    required
                    type="text" 
                    value={number} 
                    onChange={e => handleFieldChange('number', e.target.value)} 
                    className="flex-1 bg-transparent border-none h-[56px] pr-4 outline-none text-sm placeholder:text-gray-300" 
                    placeholder="123"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1">Complemento</label>
                <div className="flex items-center bg-gray-50 rounded-2xl focus-within:ring-2 focus-within:ring-gold/20 transition-all overflow-hidden border border-gray-200/50">
                  <div className="pl-4 pr-3 text-gray-400">
                    <Info size={15} />
                  </div>
                  <input 
                    type="text" 
                    value={complement} 
                    onChange={e => handleFieldChange('complement', e.target.value)} 
                    className="flex-1 bg-transparent border-none h-[56px] pr-4 outline-none text-sm placeholder:text-gray-300" 
                    placeholder="Ex: Sala 402"
                  />
                </div>
              </div>

              {/* Neighborhood and City/State */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1">Bairro</label>
                <div className="flex items-center bg-gray-50 rounded-2xl focus-within:ring-2 focus-within:ring-gold/20 transition-all overflow-hidden border border-gray-200/50">
                  <div className="pl-4 pr-3 text-gray-400">
                    <Building2 size={15} />
                  </div>
                  <input 
                    required
                    type="text" 
                    value={neighborhood} 
                    onChange={e => handleFieldChange('neighborhood', e.target.value)} 
                    className="flex-1 bg-transparent border-none h-[56px] pr-4 outline-none text-sm placeholder:text-gray-300" 
                    placeholder="Bairro"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1">Cidade - UF</label>
                <div className="flex items-center bg-gray-100 rounded-2xl overflow-hidden border border-gray-200/50 cursor-not-allowed">
                  <div className="pl-4 pr-3 text-gray-400">
                    <MapPin size={15} />
                  </div>
                  <input 
                    readOnly
                    type="text" 
                    value={cityST} 
                    className="flex-1 bg-transparent border-none h-[56px] pr-4 outline-none text-sm text-gray-500 font-medium" 
                    placeholder="Cidade - UF"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
