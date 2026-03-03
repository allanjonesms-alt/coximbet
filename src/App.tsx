/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Wallet, 
  Calendar, 
  Trophy, 
  X, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ChevronRight,
  Filter,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  LogOut,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StatusAposta, Aposta, Partida, Usuario, Administrador } from './types';
import LoginScreen from './components/LoginScreen';
import CadastroScreen from './components/CadastroScreen';
import GerenciarAdminsScreen from './components/GerenciarAdminsScreen';
import AdminDashboard from './components/AdminDashboard';
import AdminTimesScreen from './components/AdminTimesScreen';
import AdminPartidasScreen from './components/AdminPartidasScreen';
import AdminFinanceiroScreen from './components/AdminFinanceiroScreen';
import UserHomeScreen from './components/UserHomeScreen';
import { supabase } from './lib/supabase';
import { githubService } from './services/githubService';

// State
export default function App() {
  const [view, setView] = useState<'dashboard' | 'admin' | 'cadastro' | 'login_cliente' | 'admin_manage' | 'admin_times' | 'admin_partidas' | 'admin_financeiro' | 'user_home'>(() => {
    if (window.location.pathname === '/admin') return 'admin';
    if (sessionStorage.getItem('coximbet_auth_client') === 'true') return 'user_home';
    return 'dashboard';
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('coximbet_auth') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<Usuario | null>(() => {
    const saved = localStorage.getItem('coximbet_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [bets, setBets] = useState<Aposta[]>([]);
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartida, setSelectedPartida] = useState<Partida | null>(null);
  const [filter, setFilter] = useState<StatusAposta | 'Todos'>('Todos');
  const [clientLoginCpf, setClientLoginCpf] = useState('');
  const [clientLoginError, setClientLoginError] = useState('');
  const [githubToken, setGithubToken] = useState<string | null>(() => {
    return localStorage.getItem('coximbet_github_token');
  });
  const [githubUser, setGithubUser] = useState<any>(null);
  const [githubRepo, setGithubRepo] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    timeCasa: '',
    timeFora: '',
    valor: '',
    odd: '',
    data: new Date().toISOString().split('T')[0],
    status: StatusAposta.PENDENTE,
    timeEscolhido: 'Casa' as 'Casa' | 'Fora' | 'Empate',
  });

  const fetchData = async () => {
    try {
      const [partidasRes, betsRes] = await Promise.all([
        supabase.from('partidas').select('*').order('data_partida', { ascending: true }),
        supabase.from('apostas').select('*').order('data_aposta', { ascending: false })
      ]);
      
      if (partidasRes.data) setPartidas(partidasRes.data);
      if (betsRes.data) setBets(betsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll for updates every 5 seconds to simulate real-time between apps
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('coximbet_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('coximbet_user');
    }
  }, [currentUser]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin is from AI Studio preview or localhost
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      
      if (event.data?.type === 'GITHUB_AUTH_SUCCESS') {
        const token = event.data.token;
        setGithubToken(token);
        localStorage.setItem('coximbet_github_token', token);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (githubToken) {
      const fetchGithubData = async () => {
        try {
          const [user, repo] = await Promise.all([
            githubService.getUserInfo(githubToken),
            githubService.getRepoInfo(githubToken, import.meta.env.VITE_GITHUB_REPO_URL || 'https://github.com/allanjonesms-alt/coximbet')
          ]);
          setGithubUser(user);
          setGithubRepo(repo);
        } catch (error) {
          console.error('Error fetching GitHub data:', error);
          // If token is invalid, clear it
          if ((error as any).response?.status === 401) {
            setGithubToken(null);
            localStorage.removeItem('coximbet_github_token');
          }
        }
      };
      fetchGithubData();
    }
  }, [githubToken]);

  const activePartidas = useMemo(() => {
    return partidas.filter(p => p.status === 'ATIVO');
  }, [partidas]);

  const handleAddBet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setView('login_cliente');
      setIsModalOpen(false);
      return;
    }

    const valorNum = parseFloat(formData.valor);
    const oddNum = parseFloat(formData.odd);
    
    const newBet: any = {
      partida_id: selectedPartida?.id,
      usuario_id: currentUser.id,
      time_casa: formData.timeCasa,
      time_fora: formData.timeFora,
      valor: valorNum,
      odd_no_momento: oddNum,
      status: formData.status,
      time_escolhido: formData.timeEscolhido,
    };

    try {
      const { error } = await supabase.from('apostas').insert([newBet]);
      
      if (!error) {
        // Update volume in partida
        const volumeField = formData.timeEscolhido === 'Casa' ? 'volume_casa' : 
                          formData.timeEscolhido === 'Fora' ? 'volume_fora' : 'volume_empate';
        
        const currentVolume = formData.timeEscolhido === 'Casa' ? selectedPartida!.volume_casa : 
                             formData.timeEscolhido === 'Fora' ? selectedPartida!.volume_fora : selectedPartida!.volume_empate;
        
        await supabase.from('partidas')
          .update({ [volumeField]: currentVolume + valorNum })
          .eq('id', selectedPartida!.id);

        await fetchData();
        setIsModalOpen(false);
        setSelectedPartida(null);
        setFormData({
          timeCasa: '',
          timeFora: '',
          valor: '',
          odd: '',
          data: new Date().toISOString().split('T')[0],
          status: StatusAposta.PENDENTE,
          timeEscolhido: 'Casa',
        });
      }
    } catch (error) {
      console.error('Error saving bet:', error);
    }
  };

  const handleOpenBetModal = (partida: Partida, time: 'Casa' | 'Fora' | 'Empate') => {
    if (!currentUser) {
      setView('login_cliente');
      return;
    }
    setSelectedPartida(partida);
    const odd = time === 'Casa' ? partida.odd_casa : 
                time === 'Fora' ? partida.odd_fora : partida.odd_empate;
    
    setFormData({
      timeCasa: partida.time_casa,
      timeFora: partida.time_fora,
      valor: '',
      odd: odd.toString(),
      data: new Date().toISOString().split('T')[0],
      status: StatusAposta.PENDENTE,
      timeEscolhido: time,
    });
    setIsModalOpen(true);
  };

  const handleLogin = (admin: Administrador) => {
    setIsAuthenticated(true);
    sessionStorage.setItem('coximbet_auth', 'true');
    sessionStorage.setItem('coximbet_admin', JSON.stringify(admin));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('coximbet_auth');
    setView('dashboard');
    window.history.pushState({}, '', '/');
  };

  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientLoginError('');
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('cpf', clientLoginCpf)
        .single();

      if (data && !error) {
        setCurrentUser(data);
        sessionStorage.setItem('coximbet_auth_client', 'true');
        setView('user_home');
      } else {
        setClientLoginError('Usuário não encontrado. Verifique o CPF ou cadastre-se.');
      }
    } catch (error) {
      setClientLoginError('Erro ao conectar com o servidor.');
    }
  };

  const handleClientLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('coximbet_auth_client');
    setView('dashboard');
  };

  const filteredBets = bets.filter(bet => filter === 'Todos' || bet.status === filter);

  const getStatusIcon = (status: StatusAposta) => {
    switch (status) {
      case StatusAposta.GREEN: return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case StatusAposta.RED: return <XCircle className="w-5 h-5 text-rose-500" />;
      default: return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStatusColor = (status: StatusAposta) => {
    switch (status) {
      case StatusAposta.GREEN: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case StatusAposta.RED: return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  if (view === 'cadastro') {
    return <CadastroScreen 
      onBack={() => setView('dashboard')} 
      onSuccess={(user) => {
        setCurrentUser(user);
        sessionStorage.setItem('coximbet_auth_client', 'true');
        setView('user_home');
      }} 
    />;
  }

  if (view === 'login_cliente') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 border border-slate-100"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Entrar no CoximBet</h2>
            <p className="text-slate-500 text-sm mt-1">Use seu CPF para acessar sua conta</p>
          </div>

          <form onSubmit={handleClientLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">CPF</label>
              <input 
                type="text"
                placeholder="000.000.000-00"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                value={clientLoginCpf}
                onChange={(e) => setClientLoginCpf(e.target.value)}
              />
            </div>

            {clientLoginError && (
              <p className="text-rose-500 text-xs font-medium text-center">{clientLoginError}</p>
            )}

            <button 
              type="submit"
              className="w-full bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-[0.98] transition-all"
            >
              Entrar
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">Não tem uma conta?</p>
            <button 
              onClick={() => setView('cadastro')}
              className="text-emerald-600 font-bold mt-1 hover:underline"
            >
              Cadastre-se agora
            </button>
          </div>

          <button 
            onClick={() => setView('dashboard')}
            className="w-full mt-4 text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors"
          >
            Voltar para o Início
          </button>
        </motion.div>
      </div>
    );
  }

  if (view === 'user_home' && currentUser) {
    return (
      <UserHomeScreen 
        user={currentUser}
        partidas={activePartidas}
        bets={bets}
        onLogout={handleClientLogout}
        onPlaceBet={handleOpenBetModal}
        githubUser={githubUser}
        githubRepo={githubRepo}
        onConnectGithub={async () => {
          const { url } = await githubService.getAuthUrl();
          window.open(url, 'github_oauth', 'width=600,height=700');
        }}
      />
    );
  }

  if (view.startsWith('admin')) {
    if (!isAuthenticated) {
      return <LoginScreen 
        onLogin={handleLogin} 
        onBack={() => {
          setView('dashboard');
          window.history.pushState({}, '', '/');
        }} 
      />;
    }

    const adminData = JSON.parse(sessionStorage.getItem('coximbet_admin') || '{}');

    if (view === 'admin_manage') {
      return <GerenciarAdminsScreen onBack={() => setView('admin')} />;
    }

    if (view === 'admin_times') {
      return <AdminTimesScreen onBack={() => setView('admin')} />;
    }

    if (view === 'admin_partidas') {
      return <AdminPartidasScreen 
        onBack={() => setView('admin')} 
        onNewMatch={() => {}} // Not used anymore as modal is inside AdminPartidasScreen
        partidas={partidas}
        onRefresh={fetchData}
      />;
    }

    if (view === 'admin_financeiro') {
      return <AdminFinanceiroScreen onBack={() => setView('admin')} />;
    }

    return (
      <AdminDashboard 
        admin={adminData}
        onLogout={handleLogout}
        onBack={() => {
          setView('dashboard');
          window.history.pushState({}, '', '/');
        }}
        onNavigate={(target) => {
          if (target === 'times') setView('admin_times');
          if (target === 'partidas') setView('admin_partidas');
          if (target === 'financeiro') setView('admin_financeiro');
          if (target === 'admins') setView('admin_manage');
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      {/* Bet365 Style Header */}
      <header className="bg-[#003b2f] text-white sticky top-0 z-50 shadow-lg">
        {/* Top Bar */}
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => {
              if (currentUser) {
                // Stay on user screen if logged in
              } else {
                setView('public');
              }
            }}
          >
            <img 
              src="https://lh3.googleusercontent.com/d/1ciMvikb-Gd_2pWvDp-XMd40HCyn5-uUz" 
              alt="Logo" 
              className="w-8 h-8 rounded-lg object-cover border border-white/20"
              referrerPolicy="no-referrer"
            />
            <h1 className="text-xl font-black tracking-tighter">CoximBet</h1>
          </div>

          <div className="flex items-center gap-3">
            {!currentUser ? (
              <>
                <button 
                  onClick={() => setView('cadastro')}
                  className="text-[#bef264] text-[11px] font-bold uppercase tracking-wider hover:text-white transition-colors"
                >
                  Registrar-se
                </button>
                <button 
                  onClick={() => setView('login_cliente')}
                  className="bg-[#bef264] text-[#003b2f] px-4 py-1.5 rounded font-black text-[11px] uppercase tracking-wider hover:bg-[#d9f99d] transition-all active:scale-95"
                >
                  Entrar
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <p className="text-[11px] font-bold text-white/90">{currentUser.nome_completo.split(' ')[0]}</p>
                <button 
                  onClick={handleClientLogout}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <LogOut className="w-4 h-4 text-white/60" />
                </button>
              </div>
            )}
            <button 
              onClick={() => {
                setView('admin');
                window.history.pushState({}, '', '/admin');
              }}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
              title="Painel Admin"
            >
              <Settings className="w-5 h-5 text-white/40" />
            </button>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="bg-[#005a4b] border-t border-white/5 shadow-inner">
          <div className="max-w-md mx-auto px-4 flex gap-6 h-11 items-center overflow-x-auto no-scrollbar">
            <button className="text-[11px] font-bold uppercase tracking-widest text-white border-b-2 border-[#bef264] h-full px-1 flex items-center">
              Todos os Jogos
            </button>
            <button className="text-[11px] font-bold uppercase tracking-widest text-white/60 hover:text-white h-full px-1 flex items-center transition-colors">
              Partidas ao Vivo
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 space-y-6">
        {/* Welcome Section */}
        {!currentUser && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center"
          >
            <h2 className="text-lg font-bold text-slate-800">Sua melhor aposta em Coxim</h2>
            <p className="text-slate-500 text-sm mt-1">Acompanhe os jogos do Coxim Atlético Clube e muito mais.</p>
          </motion.div>
        )}

        {/* Partidas Ativas Section */}
        <section className="space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            Partidas Ativas
          </h3>
          <div className="space-y-4">
            {activePartidas.map(partida => (
              <div key={partida.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Volume Total: R$ {(partida.volume_casa + partida.volume_fora).toLocaleString('pt-BR')}</span>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Ao Vivo</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 text-center space-y-2">
                    <p className="font-bold text-slate-800 text-sm">{partida.time_casa}</p>
                    <button 
                      onClick={() => handleOpenBetModal(partida, 'Casa')}
                      className="w-full bg-slate-50 hover:bg-primary/5 border border-slate-100 rounded-xl p-3 transition-colors group"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-lg font-black text-primary">{partida.odd_casa.toFixed(2)}</span>
                        {partida.odd_casa > partida.last_odd_casa ? (
                          <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                        ) : partida.odd_casa < partida.last_odd_casa ? (
                          <ArrowDownRight className="w-4 h-4 text-rose-500" />
                        ) : null}
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Vol: R$ {partida.volume_casa.toLocaleString('pt-BR')}</p>
                    </button>
                  </div>
                  <div className="text-slate-300 font-black text-xl italic">VS</div>
                  <div className="flex-1 text-center space-y-2">
                    <p className="font-bold text-slate-800 text-sm">{partida.time_fora}</p>
                    <button 
                      onClick={() => handleOpenBetModal(partida, 'Fora')}
                      className="w-full bg-slate-50 hover:bg-primary/5 border border-slate-100 rounded-xl p-3 transition-colors group"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-lg font-black text-primary">{partida.odd_fora.toFixed(2)}</span>
                        {partida.odd_fora > partida.last_odd_fora ? (
                          <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                        ) : partida.odd_fora < partida.last_odd_fora ? (
                          <ArrowDownRight className="w-4 h-4 text-rose-500" />
                        ) : null}
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Vol: R$ {partida.volume_fora.toLocaleString('pt-BR')}</p>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Filters and List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              Histórico de Apostas
            </h3>
            <div className="flex gap-2">
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="Todos">Todos</option>
                <option value={StatusAposta.GREEN}>Green</option>
                <option value={StatusAposta.RED}>Red</option>
                <option value={StatusAposta.PENDENTE}>Pendente</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredBets.map((bet) => (
                <motion.div
                  key={bet.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl border ${getStatusColor(bet.status)}`}>
                      {getStatusIcon(bet.status)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{bet.time_casa} x {bet.time_fora}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(bet.data_aposta).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                          @{bet.odd_no_momento.toFixed(2)}
                        </span>
                        {bet.time_escolhido && (
                          <span className="text-[10px] font-bold text-primary uppercase">Escolha: {bet.time_escolhido}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">R$ {bet.valor.toFixed(2)}</p>
                    <p className={`text-xs font-bold mt-0.5 ${
                      bet.status === StatusAposta.GREEN ? 'text-emerald-600' : 
                      bet.status === StatusAposta.RED ? 'text-rose-600' : 'text-amber-600'
                    }`}>
                      {bet.status === StatusAposta.PENDENTE ? 'Pendente' : 
                       (bet.status === StatusAposta.GREEN ? `+R$ ${(bet.valor * bet.odd_no_momento - bet.valor).toFixed(2)}` : `-R$ ${bet.valor.toFixed(2)}`)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredBets.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <p>Nenhuma aposta encontrada.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => {
          setSelectedPartida(null);
          setFormData({
            timeCasa: '',
            timeFora: '',
            valor: '',
            odd: '',
            data: new Date().toISOString().split('T')[0],
            status: StatusAposta.PENDENTE,
            timeEscolhido: 'Casa',
          });
          setIsModalOpen(true);
        }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-40"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] p-8 z-50 max-w-md mx-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">{selectedPartida ? 'Apostar na Partida' : 'Nova Aposta Manual'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAddBet} className="space-y-4">
                {selectedPartida && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Partida Selecionada</p>
                    <p className="font-bold text-slate-800">{selectedPartida.time_casa} x {selectedPartida.time_fora}</p>
                    <p className="text-sm text-primary font-bold mt-1">Apostando em: {formData.timeEscolhido} (@{formData.odd})</p>
                  </div>
                )}

                {!selectedPartida && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Time Casa</label>
                      <input 
                        required
                        type="text"
                        placeholder="Ex: Coxim AC"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                        value={formData.timeCasa}
                        onChange={e => setFormData({...formData, timeCasa: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Time Fora</label>
                      <input 
                        required
                        type="text"
                        placeholder="Ex: Operário"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                        value={formData.timeFora}
                        onChange={e => setFormData({...formData, timeFora: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Valor (R$)</label>
                    <input 
                      required
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                      value={formData.valor}
                      onChange={e => setFormData({...formData, valor: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Odd (Cotação)</label>
                    <input 
                      required
                      disabled={!!selectedPartida}
                      type="number"
                      step="0.01"
                      placeholder="1.00"
                      className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none ${selectedPartida ? 'opacity-50' : ''}`}
                      value={formData.odd}
                      onChange={e => setFormData({...formData, odd: e.target.value})}
                    />
                  </div>
                </div>

                {!selectedPartida && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Data</label>
                      <input 
                        required
                        type="date"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                        value={formData.data}
                        onChange={e => setFormData({...formData, data: e.target.value})}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Escolha</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Casa', 'Empate', 'Fora'] as const).map((choice) => (
                          <button
                            key={choice}
                            type="button"
                            onClick={() => setFormData({...formData, timeEscolhido: choice})}
                            className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${
                              formData.timeEscolhido === choice 
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {choice}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Status</label>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.values(StatusAposta).map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setFormData({...formData, status})}
                            className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${
                              formData.status === status 
                                ? (status === StatusAposta.GREEN ? 'bg-emerald-500 text-white border-emerald-500' : 
                                   status === StatusAposta.RED ? 'bg-rose-500 text-white border-rose-500' : 
                                   'bg-amber-500 text-white border-amber-500')
                                : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <button 
                  type="submit"
                  className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-[0.98] transition-all mt-4"
                >
                  {selectedPartida ? 'Confirmar Aposta' : 'Salvar Aposta Manual'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
