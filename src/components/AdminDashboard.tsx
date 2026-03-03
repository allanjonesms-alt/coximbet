import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Trophy, 
  DollarSign, 
  Shield, 
  LogOut, 
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';
import { Administrador } from '../types';

interface AdminDashboardProps {
  admin: Administrador;
  onLogout: () => void;
  onNavigate: (view: 'times' | 'partidas' | 'financeiro' | 'admins') => void;
  onBack: () => void;
}

export default function AdminDashboard({ admin, onLogout, onNavigate, onBack }: AdminDashboardProps) {
  const menuItems = [
    { 
      id: 'times', 
      label: 'Times', 
      icon: Users, 
      color: 'text-blue-400', 
      bg: 'bg-blue-400/10',
      description: 'Gerencie os times de futebol'
    },
    { 
      id: 'partidas', 
      label: 'Partidas', 
      icon: Trophy, 
      color: 'text-[#bef264]', 
      bg: 'bg-[#bef264]/10',
      description: 'Crie e gerencie partidas ativas'
    },
    { 
      id: 'financeiro', 
      label: 'Dados Financeiros', 
      icon: DollarSign, 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-400/10',
      description: 'Acompanhe lucros e prejuízos'
    },
    { 
      id: 'admins', 
      label: 'Gerenciar Admins', 
      icon: Shield, 
      color: 'text-purple-400', 
      bg: 'bg-purple-400/10',
      description: 'Controle de acesso da equipe'
    },
  ];

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      <header className="p-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#bef264]/10 rounded-xl flex items-center justify-center border border-[#bef264]/20">
            <LayoutDashboard className="w-6 h-6 text-[#bef264]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Painel Admin</h1>
            <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">CoximBet v2.0</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-white/40 uppercase font-bold leading-none">Logado como</p>
            <p className="text-sm font-bold text-white">{admin.nome_completo.split(' ')[0]}</p>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-full transition-colors"
            title="Sair"
          >
            <LogOut className="w-5 h-5 text-rose-500" />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-6 space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Bem-vindo, {admin.nome_completo.split(' ')[0]}</h2>
          <p className="text-white/40 text-sm">O que você deseja gerenciar hoje?</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onNavigate(item.id as any)}
              className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between group hover:bg-white/10 hover:border-[#bef264]/30 transition-all"
            >
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white">{item.label}</h3>
                  <p className="text-white/40 text-xs">{item.description}</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-white/20 group-hover:text-[#bef264] transition-colors" />
            </motion.button>
          ))}
        </div>

        <button 
          onClick={onBack}
          className="w-full py-4 text-white/20 text-sm font-bold uppercase tracking-widest hover:text-white/40 transition-colors"
        >
          Voltar para o Site
        </button>
      </main>
    </div>
  );
}
