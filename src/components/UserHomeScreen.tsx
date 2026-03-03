import React from 'react';
import { motion } from 'motion/react';
import { 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  FileText, 
  User, 
  LogOut,
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Github,
  GitBranch,
  Star,
  ExternalLink
} from 'lucide-react';
import { Usuario, Partida, Aposta, StatusAposta } from '../types';

interface UserHomeScreenProps {
  user: Usuario;
  partidas: Partida[];
  bets: Aposta[];
  onLogout: () => void;
  onPlaceBet: (partida: Partida, time: 'Casa' | 'Fora' | 'Empate') => void;
  githubUser?: any;
  githubRepo?: any;
  onConnectGithub: () => void;
}

export default function UserHomeScreen({ 
  user, 
  partidas, 
  bets, 
  onLogout, 
  onPlaceBet,
  githubUser,
  githubRepo,
  onConnectGithub
}: UserHomeScreenProps) {
  const openBets = bets.filter(b => b.status === StatusAposta.PENDENTE);
  const closedBets = bets.filter(b => b.status !== StatusAposta.PENDENTE);

  const getStatusIcon = (status: StatusAposta) => {
    switch (status) {
      case StatusAposta.GREEN: return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case StatusAposta.RED: return <XCircle className="w-4 h-4 text-rose-500" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusColor = (status: StatusAposta) => {
    switch (status) {
      case StatusAposta.GREEN: return 'bg-emerald-50 border-emerald-100 text-emerald-700';
      case StatusAposta.RED: return 'bg-rose-50 border-rose-100 text-rose-700';
      default: return 'bg-amber-50 border-amber-100 text-amber-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      {/* Bet365 Style Header */}
      <header className="bg-[#003b2f] text-white sticky top-0 z-50 shadow-lg">
        {/* Top Bar */}
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="https://lh3.googleusercontent.com/d/1ciMvikb-Gd_2pWvDp-XMd40HCyn5-uUz" 
              alt="Logo" 
              className="w-8 h-8 rounded-lg object-cover border border-white/20"
              referrerPolicy="no-referrer"
            />
            <h1 className="text-xl font-black tracking-tighter">CoximBet</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <div className="text-right">
                <p className="text-[9px] text-white/50 uppercase font-bold leading-none">Saldo</p>
                <p className="text-[11px] font-black text-[#bef264]">R$ {user.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="w-px h-6 bg-white/10 mx-1" />
              <button 
                onClick={onLogout}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4 text-white/60" />
              </button>
            </div>
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

      <main className="max-w-md mx-auto px-4 pt-6 space-y-6 relative z-20">
        {/* Quick Actions Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="grid grid-cols-4 gap-2">
            <button className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all border border-slate-100">
                <ArrowUpCircle className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-500">Depósito</span>
            </button>
            <button className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all border border-slate-100">
                <ArrowDownCircle className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-500">Saque</span>
            </button>
            <button className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all border border-slate-100">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-500">Extrato</span>
            </button>
            <button className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all border border-slate-100">
                <User className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-500">Perfil</span>
            </button>
          </div>
        </div>

        {/* GitHub Integration Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Github className="w-5 h-5" />
              Integração GitHub
            </h3>
          </div>

          {!githubUser ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                <Github className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Conecte seu GitHub</p>
                <p className="text-xs text-slate-500 mt-1">Sincronize sua conta para acompanhar o desenvolvimento do CoximBet.</p>
              </div>
              <button 
                onClick={onConnectGithub}
                className="w-full bg-[#24292e] text-white font-bold py-3 rounded-xl hover:bg-[#1b1f23] transition-all flex items-center justify-center gap-2"
              >
                <Github className="w-4 h-4" />
                Conectar GitHub
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center gap-4">
                <img 
                  src={githubUser.avatar_url} 
                  alt={githubUser.login} 
                  className="w-12 h-12 rounded-full border border-slate-100"
                />
                <div>
                  <p className="text-sm font-bold text-slate-800">{githubUser.name || githubUser.login}</p>
                  <p className="text-xs text-slate-500">@{githubUser.login}</p>
                </div>
                <div className="ml-auto bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-100 uppercase">
                  Conectado
                </div>
              </div>

              {githubRepo && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-slate-700">{githubRepo.name}</span>
                    </div>
                    <a 
                      href={githubRepo.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-primary transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{githubRepo.description}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-[10px] font-bold text-slate-600">{githubRepo.stargazers_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitBranch className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-600">{githubRepo.forks_count}</span>
                    </div>
                    <div className="ml-auto text-[9px] text-slate-400 font-medium">
                      Atualizado: {new Date(githubRepo.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
        {/* Partidas Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              Partidas em Andamento
            </h3>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Ao Vivo</span>
            </div>
          </div>
          <div className="space-y-4">
            {partidas.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
                <Trophy className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Nenhuma partida no momento.</p>
              </div>
            ) : (
              partidas.map(partida => (
                <div key={partida.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4 hover:border-primary/30 transition-all">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Volume: R$ {(partida.volume_casa + partida.volume_fora + partida.volume_empate).toLocaleString('pt-BR')}</span>
                      <span className="text-[9px] text-slate-400 font-medium">{partida.data_partida.split('-').reverse().join('/')} - {partida.horario}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 text-center space-y-2">
                      <p className="font-bold text-slate-800 text-[10px] truncate">{partida.time_casa}</p>
                      <button 
                        onClick={() => onPlaceBet(partida, 'Casa')}
                        className="w-full bg-slate-50 hover:bg-primary/5 border border-slate-100 rounded-xl p-2 transition-colors group"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">Casa</span>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-black text-primary">{partida.odd_casa.toFixed(2)}</span>
                            {partida.odd_casa > partida.last_odd_casa ? (
                              <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                            ) : partida.odd_casa < partida.last_odd_casa ? (
                              <ArrowDownRight className="w-3 h-3 text-rose-500" />
                            ) : null}
                          </div>
                        </div>
                      </button>
                    </div>

                    <div className="flex-1 text-center space-y-2">
                      <p className="font-bold text-slate-400 text-[10px] uppercase">Empate</p>
                      <button 
                        onClick={() => onPlaceBet(partida, 'Empate')}
                        className="w-full bg-slate-50 hover:bg-primary/5 border border-slate-100 rounded-xl p-2 transition-colors group"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">X</span>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-black text-primary">{partida.odd_empate.toFixed(2)}</span>
                            {partida.odd_empate > partida.last_odd_empate ? (
                              <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                            ) : partida.odd_empate < partida.last_odd_empate ? (
                              <ArrowDownRight className="w-3 h-3 text-rose-500" />
                            ) : null}
                          </div>
                        </div>
                      </button>
                    </div>

                    <div className="flex-1 text-center space-y-2">
                      <p className="font-bold text-slate-800 text-[10px] truncate">{partida.time_fora}</p>
                      <button 
                        onClick={() => onPlaceBet(partida, 'Fora')}
                        className="w-full bg-slate-50 hover:bg-primary/5 border border-slate-100 rounded-xl p-2 transition-colors group"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">Fora</span>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-black text-primary">{partida.odd_fora.toFixed(2)}</span>
                            {partida.odd_fora > partida.last_odd_fora ? (
                              <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                            ) : partida.odd_fora < partida.last_odd_fora ? (
                              <ArrowDownRight className="w-3 h-3 text-rose-500" />
                            ) : null}
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Apostas em Aberto */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Minhas Apostas em Aberto</h3>
            <span className="text-[10px] font-bold text-amber-600 uppercase bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
              {openBets.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {openBets.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm">Nenhuma aposta em aberto.</p>
              </div>
            ) : (
              openBets.map(bet => (
                <motion.div 
                  key={bet.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 rounded-xl">
                      <Clock className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{bet.time_casa} x {bet.time_fora}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Escolha: {bet.time_escolhido}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-primary">R$ {bet.valor.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400 font-bold">Odd {bet.odd_no_momento.toFixed(2)}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Apostas Encerradas */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Histórico de Apostas</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded-md">
              {closedBets.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {closedBets.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm">Nenhuma aposta encerrada.</p>
              </div>
            ) : (
              closedBets.map(bet => (
                <motion.div 
                  key={bet.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between opacity-80"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${bet.status === StatusAposta.GREEN ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                      {getStatusIcon(bet.status)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{bet.time_casa} x {bet.time_fora}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status: {bet.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${bet.status === StatusAposta.GREEN ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {bet.status === StatusAposta.GREEN ? '+' : '-'} R$ {bet.status === StatusAposta.GREEN ? (bet.valor * bet.odd_no_momento).toFixed(2) : bet.valor.toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
