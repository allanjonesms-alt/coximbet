import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface AdminFinanceiroScreenProps {
  onBack: () => void;
}

export default function AdminFinanceiroScreen({ onBack }: AdminFinanceiroScreenProps) {
  return (
    <div className="min-h-screen bg-[#121212] text-white pb-20">
      <header className="p-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-[#bef264]" />
          </button>
          <h1 className="text-xl font-bold tracking-tight">Dados Financeiros</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <Wallet className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-white/40 font-bold text-[10px] uppercase tracking-widest">Saldo em Caixa</span>
            </div>
            <h2 className="text-3xl font-black text-white">R$ 0,00</h2>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#bef264]/10 rounded-xl">
                <TrendingUp className="w-5 h-5 text-[#bef264]" />
              </div>
              <span className="text-white/40 font-bold text-[10px] uppercase tracking-widest">Entradas (Hoje)</span>
            </div>
            <h2 className="text-3xl font-black text-white">R$ 0,00</h2>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/10 rounded-xl">
                <TrendingDown className="w-5 h-5 text-rose-500" />
              </div>
              <span className="text-white/40 font-bold text-[10px] uppercase tracking-widest">Saídas (Hoje)</span>
            </div>
            <h2 className="text-3xl font-black text-white">R$ 0,00</h2>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center space-y-4">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
            <DollarSign className="w-10 h-10 text-white/20" />
          </div>
          <h2 className="text-xl font-bold">Sem movimentações recentes</h2>
          <p className="text-white/40 text-sm max-w-xs mx-auto">
            Os dados financeiros detalhados aparecerão aqui conforme as apostas forem realizadas.
          </p>
        </div>
      </main>
    </div>
  );
}
