import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, Shield, Activity, Database, Server, Wifi, 
  Cpu, HardDrive, Search, Trash2, Play, Code, 
  ChevronRight, AlertTriangle, CheckCircle2, Info, X, 
  RefreshCw, Save, FileJson, Clock, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getUsers, getProducts, getOrders, getStoreConfig, saveProducts, saveUsers, saveOrders, saveStoreConfig, clearAllSessions } from './lib/storage';
import { cn } from './lib/utils';

// --- Types ---
interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'error' | 'success' | 'warning' | 'command';
  message: string;
}

interface MockAPI {
  name: string;
  endpoint: string;
  status: 'online' | 'offline' | 'warning';
  latency: number;
  uptime: string;
}

// --- Dev Dashboard Component ---

export const DevDashboard = () => {
  const [activeTab, setActiveTab] = useState<'console' | 'apis' | 'database' | 'system'>('console');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [command, setCommand] = useState('');
  const [isBooting, setIsBooting] = useState(true);
  const [apis, setApis] = useState<MockAPI[]>([
    { name: 'Core API', endpoint: '/api/v1', status: 'online', latency: 42, uptime: '99.9%' },
    { name: 'Auth Service', endpoint: '/api/auth', status: 'online', latency: 28, uptime: '100%' },
    { name: 'Payment Gateway', endpoint: '/api/payments', status: 'online', latency: 156, uptime: '99.5%' },
    { name: 'Inventory Sync', endpoint: '/api/inventory', status: 'warning', latency: 850, uptime: '98.2%' },
    { name: 'Analytics Engine', endpoint: '/api/stats', status: 'online', latency: 12, uptime: '100%' },
  ]);
  const [dbData, setDbData] = useState<any>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const logEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const user = getCurrentUser();

  // Redirect if not dev
  useEffect(() => {
    if (!user || user.role !== 'dev') {
      navigate('/login');
    }
  }, [user, navigate]);

  // Initial boot sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBooting(false);
      addLog('Sistema inicializado. Bem-vindo, Desenvolvedor.', 'success');
      addLog('Conectado à Nuvem Segura Chronos.', 'info');
      addLog('Monitorando 5 serviços ativos.', 'info');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Auto scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Load database data
  useEffect(() => {
    if (activeTab === 'database') {
      refreshDbData();
    }
  }, [activeTab]);

  const refreshDbData = async () => {
    setDbData({
      users: await getUsers(),
      products: await getProducts(),
      orders: await getOrders(),
      config: await getStoreConfig()
    });
  };

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    };
    setLogs(prev => [...prev.slice(-49), newLog]);
  };

  const executeCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    const cmd = command.toLowerCase().trim();
    addLog(`> ${command}`, 'command');
    setCommand('');

    // Handle commands
    if (cmd === 'help') {
      addLog('Comandos disponíveis: help, clear, status, restart, log-out, list-users, delete "nome", manutencao "tempo" "motivo", manutencao ok, reset-database', 'info');
    } else if (cmd === 'clear') {
      setLogs([]);
    } else if (cmd.startsWith('manutencao')) {
      if (cmd === 'manutencao ok') {
        const config = await getStoreConfig();
        config.maintenance = { enabled: false, time: '', reason: '' };
        await saveStoreConfig(config);
        addLog('SISTEMA RESTAURADO: Modo de manutenção desativado.', 'success');
        window.dispatchEvent(new Event('storeConfigUpdated'));
      } else {
        const args = command.match(/"([^"]+)"/g);
        if (args && args.length >= 2) {
          const tempo = args[0].replace(/"/g, '');
          const motivo = args[1].replace(/"/g, '');
          
          const config = await getStoreConfig();
          config.maintenance = { 
            enabled: true, 
            time: tempo, 
            reason: motivo 
          };
          await saveStoreConfig(config);
          addLog(`MODO MANUTENÇÃO ATIVADO: ${tempo} | Motivo: ${motivo}`, 'warning');
          addLog('Todos os acessos não-DEV foram bloqueados.', 'error');
          window.dispatchEvent(new Event('storeConfigUpdated'));
        } else {
          addLog('Erro de Sintaxe: manutencao "tempo" "motivo"', 'error');
          addLog('Exemplo: manutencao "2 horas" "Atualização de Banco"', 'info');
        }
      }
    } else if (cmd === 'delete' || cmd.startsWith('delete ')) {
      const nameToDelete = command.length > 6 ? command.slice(7).replace(/"/g, '').trim() : '';
      
      if (!nameToDelete) {
        const allUsers = await getUsers();
        const deletableUsers = allUsers.filter(u => u.role !== 'dev');
        addLog('Protocolo de Seleção: Qual usuário deseja deletar?', 'warning');
        addLog('Format: delete "Nome do Usuário"', 'info');
        if (deletableUsers.length === 0) {
          addLog('Nenhum usuário disponível para exclusão.', 'error');
        } else {
          deletableUsers.forEach(u => addLog(`- ${u.name} [${u.role}]`, 'info'));
        }
      } else {
        const users = await getUsers();
        const userToRemove = users.find(u => u.name.toLowerCase() === nameToDelete.toLowerCase());
        
        if (!userToRemove) {
          addLog(`Usuário '${nameToDelete}' não encontrado no banco de dados.`, 'error');
        } else if (userToRemove.role === 'dev') {
          addLog('Proteção de Sistema: Usuários com nível DEV não podem ser removidos.', 'error');
        } else {
          const newUsers = users.filter(u => u.id !== userToRemove.id);
          await saveUsers(newUsers);
          addLog(`Protocolo de Exclusão: Usuário '${userToRemove.name}' removido com sucesso.`, 'success');
          await refreshDbData();
        }
      }
    } else if (cmd === 'status') {
      addLog(`CPU: 12% | RAM: 512MB/2GB | DISCO: 14.2GB LIVRE`, 'info');
      addLog(`Rede: Estável (ping 24ms)`, 'success');
    } else if (cmd === 'restart') {
      addLog('Reiniciando serviços da aplicação...', 'warning');
      setTimeout(() => window.location.reload(), 1500);
    } else if (cmd === 'log-out') {
      clearAllSessions();
      // O App.tsx agora é reativo e redirecionará automaticamente
    } else if (cmd === 'list-users') {
      const users = await getUsers();
      addLog(`Encontrados ${users.length} usuários registrados:`, 'info');
      users.forEach(u => addLog(`- ${u.name} (${u.email}) [${u.role}]`, 'info'));
    } else if (cmd === 'reset-database') {
      addLog('AVISO: Isso irá apagar TODAS as modificações.', 'warning');
      addLog('Executando reset forçado...', 'error');
      localStorage.clear();
      setTimeout(() => window.location.reload(), 2000);
    } else {
      addLog(`Comando não reconhecido: ${cmd}. Digite 'help' para opções.`, 'error');
    }
  };

  const saveDbChange = async (key: string) => {
    try {
      const parsed = JSON.parse(editValue);
      if (key === 'users') await saveUsers(parsed);
      if (key === 'products') await saveProducts(parsed);
      if (key === 'orders') await saveOrders(parsed);
      if (key === 'config') await saveStoreConfig(parsed);
      
      addLog(`Banco de dados '${key}' atualizado com sucesso.`, 'success');
      setEditingKey(null);
      await refreshDbData();
    } catch (e) {
      addLog(`Falha ao converter JSON para '${key}': ${e}`, 'error');
    }
  };

  if (isBooting) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center font-mono">
        <div className="space-y-4 text-[#00FF00]">
          <div className="flex items-center gap-3">
            <RefreshCw size={24} className="animate-spin" />
            <span className="text-xl">INICIALIZANDO CONSOLE_DEV_V2...</span>
          </div>
          <div className="w-64 h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.8 }}
              className="h-full bg-[#00FF00]"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] font-mono flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-[#111] border-b md:border-b-0 md:border-r border-[#1A1A1A] p-6 flex flex-col gap-6">
        <div className="flex items-center gap-3 text-[#00FF00] mb-4">
          <Terminal size={24} />
          <h1 className="text-sm font-bold tracking-tighter uppercase italic">Dev_Control</h1>
        </div>

        <nav className="flex flex-col gap-1">
          <TabButton active={activeTab === 'console'} onClick={() => setActiveTab('console')} icon={<Terminal size={18} />} label="Log de Console" />
          <TabButton active={activeTab === 'apis'} onClick={() => setActiveTab('apis')} icon={<Wifi size={18} />} label="Instâncias de API" />
          <TabButton active={activeTab === 'database'} onClick={() => setActiveTab('database')} icon={<Database size={18} />} label="Explorador de Dados" />
          <TabButton active={activeTab === 'system'} onClick={() => setActiveTab('system')} icon={<Cpu size={18} />} label="Config. do Sistema" />
        </nav>

        <div className="mt-auto pt-6 border-t border-[#1A1A1A] space-y-4">
          <div className="px-3 py-2 bg-[#1A1A1A] rounded-lg border border-[#222]">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Permissão</p>
            <div className="flex items-center gap-2 text-[#00FF00] text-xs">
              <Shield size={12} />
              <span>ACESSO_DESENVOLVEDOR</span>
            </div>
          </div>
          <button 
            onClick={() => { clearAllSessions(); navigate('/login'); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all text-xs"
          >
            <Lock size={14} />
            Terminar Sessão
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Header */}
        <header className="h-16 border-bottom border-[#1A1A1A] flex items-center justify-between px-8 bg-[#0C0C0C]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00FF00] animate-pulse" />
              <span className="text-[10px] font-bold text-gray-500 uppercase">Status do Sistema: OK</span>
            </div>
            <div className="w-px h-4 bg-[#1A1A1A]" />
            <div className="flex items-center gap-2">
              <Clock size={12} className="text-gray-500" />
              <span className="text-[10px] font-bold text-gray-500 uppercase">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <HardDrive size={12} />
              <span>48% DISCO</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <Cpu size={12} />
              <span>12% CPU</span>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#050505]">
          <AnimatePresence mode="wait">
            {activeTab === 'console' && (
              <motion.div 
                key="console" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="h-full flex flex-col gap-4"
              >
                <div className="flex-1 bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl flex flex-col overflow-hidden">
                  <div className="px-4 py-2 bg-[#141414] border-b border-[#1A1A1A] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal size={12} className="text-gray-500" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Fluxo de Saída ao Vivo</span>
                    </div>
                    <button onClick={() => setLogs([])} className="text-[10px] text-gray-500 hover:text-white transition-colors">LIMPAR_LOGS</button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {logs.map(log => (
                      <div key={log.id} className="flex gap-4 text-xs group">
                        <span className="text-gray-600 shrink-0 select-none">[{log.timestamp}]</span>
                        <span className={cn(
                          "shrink-0 w-16 text-center select-none",
                          log.type === 'error' && "text-red-500",
                          log.type === 'warning' && "text-yellow-500",
                          log.type === 'success' && "text-green-500",
                          log.type === 'info' && "text-blue-500",
                          log.type === 'command' && "text-purple-500"
                        )}>
                          {log.type.toUpperCase()}
                        </span>
                        <span className={cn(
                          "break-all",
                          log.type === 'command' ? "text-[#00FF00]" : "text-[#D1D1D1]"
                        )}>
                          {log.message}
                        </span>
                      </div>
                    ))}
                    <div ref={logEndRef} />
                  </div>
                </div>

                <form onSubmit={executeCommand} className="relative group">
                  <ChevronRight size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00FF00]" />
                  <input 
                    type="text" 
                    value={command}
                    onChange={e => setCommand(e.target.value)}
                    placeholder="Digite um comando (ou 'help')..."
                    className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-4 pl-12 outline-none focus:border-[#00FF00] transition-colors text-sm text-[#00FF00]"
                    autoFocus
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#1A1A1A] rounded border border-[#222] text-[10px] text-gray-500 hidden sm:block">
                    PRESSIONE ENTER
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'apis' && (
              <motion.div 
                key="apis" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <StatWidget icon={<Server size={20} />} label="Total de Serviços" value="05" />
                  <StatWidget icon={<Activity size={20} />} label="Requisições Ativas/Min" value="128" />
                  <StatWidget icon={<Wifi size={20} />} label="Latência Média (Global)" value="82ms" />
                </div>

                <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#141414] border-b border-[#1A1A1A]">
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase">Nome do Serviço</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase">Endpoint</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase">Latência</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A1A1A]">
                      {apis.map(api => (
                        <tr key={api.name} className="hover:bg-[#111] transition-colors">
                          <td className="px-6 py-4 text-sm font-medium">{api.name}</td>
                          <td className="px-6 py-4 text-xs text-gray-500 font-mono">{api.endpoint}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                              api.status === 'online' && "bg-green-500/10 text-green-500",
                              api.status === 'warning' && "bg-yellow-500/10 text-yellow-500",
                              api.status === 'offline' && "bg-red-500/10 text-red-500"
                            )}>
                              {api.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-mono">{api.latency}ms</td>
                          <td className="px-6 py-4">
                            <button className="p-2 text-gray-500 hover:text-white hover:bg-[#1A1A1A] rounded-lg transition-all">
                              <RefreshCw size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'database' && (
              <motion.div 
                key="database" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Explorador de Armazenamento</h2>
                  <button onClick={refreshDbData} className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] hover:bg-[#222] rounded-lg border border-[#333] transition-all text-xs">
                    <RefreshCw size={14} /> ATUALIZAR_DADOS
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {['users', 'products', 'orders', 'config'].map(key => (
                    <div key={key} className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl flex flex-col h-[400px]">
                      <div className="px-4 py-3 border-b border-[#1A1A1A] flex items-center justify-between bg-[#141414]">
                        <div className="flex items-center gap-2">
                          <FileJson size={14} className="text-gold" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">TABELA_{key.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {editingKey === key ? (
                            <>
                              <button onClick={() => saveDbChange(key)} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg"><Save size={14} /></button>
                              <button onClick={() => setEditingKey(null)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><X size={14} /></button>
                            </>
                          ) : (
                            <button 
                              onClick={() => {
                                setEditingKey(key);
                                setEditValue(JSON.stringify(dbData?.[key], null, 2));
                              }} 
                              className="p-2 text-gray-500 hover:text-white hover:bg-[#222] rounded-lg"
                            >
                              <Edit2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 p-4 overflow-hidden">
                        {editingKey === key ? (
                          <textarea 
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            className="w-full h-full bg-[#050505] text-[#00FF00] font-mono text-xs border border-[#333] rounded-lg p-4 resize-none outline-none focus:border-gold"
                          />
                        ) : (
                          <pre className="w-full h-full overflow-auto text-[10px] text-gray-400 font-mono custom-scrollbar">
                            {JSON.stringify(dbData?.[key], null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'system' && (
              <motion.div 
                key="system" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <div className="space-y-6">
                  <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-6 space-y-4">
                    <h3 className="text-xs font-bold flex items-center gap-2 text-gold uppercase tracking-[0.2em]">
                      <Cpu size={16} /> Ambiente de Execução (Core)
                    </h3>
                    <div className="space-y-3">
                      <ConfigItem label="MODO_RUNTIME" value="Secure_Production" />
                      <ConfigItem label="HASH_COMPILAÇÃO" value="0x7f4e2a91b" />
                      <ConfigItem label="INSTÂNCIA_NODE" value="ais-runner-76" />
                      <ConfigItem label="CRIPTOGRAFIA" value="AES-256-GCM" />
                    </div>
                  </div>

                  <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-6 space-y-4">
                    <h3 className="text-xs font-bold flex items-center gap-2 text-[#00FF00] uppercase tracking-[0.2em]">
                      <Shield size={16} /> Protocolos de Segurança
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      <SecurityToggle label="Guarda de Integridade do Banco" active={true} />
                      <SecurityToggle label="Criptografia de Token JWT" active={true} />
                      <SecurityToggle label="Filtragem de Requisições do Cliente" active={true} />
                      <SecurityToggle label="Escudo de Injeção SQL" active={true} />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-6 space-y-6">
                    <h3 className="text-xs font-bold flex items-center gap-2 text-blue-500 uppercase tracking-[0.2em]">
                      <Activity size={16} /> Alocação de Memória
                    </h3>
                    <div className="space-y-4">
                      <ProgressBar label="Uso do Heap" value={34} color="#3b82f6" />
                      <ProgressBar label="Cache de Buffer" value={62} color="#f59e0b" />
                      <ProgressBar label="Rastro de Pilha (Stack)" value={14} color="#10b981" />
                    </div>
                  </div>

                  <div className="bg-[#0A0A0A] border border-red-500/20 rounded-xl p-6 space-y-4 shadow-[0_0_20px_rgba(239,68,68,0.05)]">
                    <h3 className="text-xs font-bold flex items-center gap-2 text-red-500 uppercase tracking-[0.2em]">
                      <AlertTriangle size={16} /> Zona_de_Perigo.sh
                    </h3>
                    <p className="text-[10px] text-gray-500 italic">
                      Aviso: Modificações estruturais no armazenamento persistente são irreversíveis.
                      Execute com cautela.
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      <button 
                        onClick={() => { if(confirm('SISTEMA SERÁ REINICIADO AO PADRÃO DE FÁBRICA. CONTINUAR?')) { localStorage.clear(); window.location.reload(); } }}
                        className="w-full flex items-center justify-between p-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-xl transition-all group"
                      >
                        <span className="text-[10px] font-bold text-red-500">FORMATAR_DADOS_STORAGE</span>
                        <Trash2 size={14} className="text-red-500 group-hover:scale-110 transition-transform" />
                      </button>
                      <button className="w-full flex items-center justify-between p-4 bg-[#1A1A1A] hover:bg-[#222] border border-[#333] rounded-xl transition-all group">
                        <span className="text-[10px] font-bold text-gray-500">LIMPEZA_FORÇADA_SESSÕES</span>
                        <RefreshCw size={14} className="text-gray-500 group-hover:rotate-180 transition-transform duration-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

// --- Subcomponents ---

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm",
      active 
        ? "bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/20" 
        : "text-gray-500 hover:bg-[#1A1A1A] hover:text-gray-300"
    )}
  >
    {icon}
    <span className="font-medium">{label}</span>
    {active && <div className="ml-auto w-1 h-1 rounded-full bg-[#00FF00] shadow-[0_0_8px_#00FF00]" />}
  </button>
);

const StatWidget = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="bg-[#0A0A0A] border border-[#1A1A1A] p-6 rounded-xl space-y-2">
    <div className="text-gold opacity-50">{icon}</div>
    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{label}</div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);

const ConfigItem = ({ label, value }: { label: string, value: string }) => (
  <div className="flex items-center justify-between p-4 bg-[#141414] rounded-xl border border-[#1A1A1A]">
    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
    <span className="text-sm font-mono text-gold">{value}</span>
  </div>
);

const SecurityToggle = ({ label, active }: { label: string, active: boolean }) => (
  <div className="flex items-center justify-between p-3 bg-[#111] rounded-lg border border-[#1A1A1A]">
    <span className="text-[10px] text-gray-400 font-mono">{label}</span>
    <div className="flex items-center gap-2">
      <span className={cn("text-[8px] font-bold uppercase", active ? "text-[#00FF00]" : "text-red-500")}>
        {active ? 'Ativo' : 'Desativado'}
      </span>
      <div className={cn("w-2 h-2 rounded-full", active ? "bg-[#00FF00] shadow-[0_0_5px_#00FF00]" : "bg-red-500")} />
    </div>
  </div>
);

const ProgressBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
      <span className="text-gray-500">{label}</span>
      <span style={{ color }}>{value}%</span>
    </div>
    <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  </div>
);

const Edit2 = ({ size, className }: { size: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);
