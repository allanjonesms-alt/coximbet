import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Trophy, Plus, Trash2 } from 'lucide-react';
import { Partida } from '../types';
import AdminPartidasModal from './AdminPartidasModal';
import { supabase } from '../lib/supabase';

interface AdminPartidasScreenProps {
  onBack: () => void;
  onNewMatch: () => void;
  partidas: Partida[];
  onRefresh: () => void;
}

export default function AdminPartidasScreen({ onBack, onNewMatch, partidas, onRefresh }: AdminPartidasScreenProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSavePartida = async (newPartida: Omit<Partida, 'id'>) => {
    try {
      const { error } = await supabase
        .from('partidas')
        .insert([newPartida]);

      if (error) throw error;
      onRefresh();
    } catch (error) {
      console.error('Error saving match:', error);
      alert('Erro ao salvar a partida.');
    }
  };

  const handleDeletePartida = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta partida?')) return;

    try {
      const { error } = await supabase
        .from('partidas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      onRefresh();
    } catch (error) {
      console.error('Error deleting match:', error);
      alert('Erro ao excluir a partida.');
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white pb-20">
      <header className="p-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-[#bef264]" />
          </button>
          <h1 className="text-xl font-bold tracking-tight">Gerenciar Partidas</h1>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#bef264] text-black px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" />
          Nova Partida
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {partidas.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <Trophy className="w-10 h-10 text-white/20" />
            </div>
            <h2 className="text-xl font-bold">Nenhuma partida ativa</h2>
            <p className="text-white/40 text-sm max-w-xs mx-auto">
              Crie uma nova partida para que os clientes possam começar a apostar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partidas.map(partida => (
              <div key={partida.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between group hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#bef264]/10 rounded-xl flex items-center justify-center border border-[#bef264]/20">
                    <Trophy className="w-6 h-6 text-[#bef264]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{partida.time_casa} x {partida.time_fora}</h4>
                    <p className="text-[10px] text-white/40 font-medium mt-0.5">{partida.data_partida.split('-').reverse().join('/')} - {partida.horario}</p>
                    <div className="flex items-center gap-3 mt-1 opacity-40 text-[10px] font-bold uppercase tracking-wider">
                      <span>Odd Casa: {partida.odd_casa.toFixed(2)}</span>
                      <span>Odd Fora: {partida.odd_fora.toFixed(2)}</span>
                      <span className={`px-2 py-0.5 rounded-full border ${
                        partida.status === 'ATIVO' ? 'border-emerald-500/50 text-emerald-500' : 
                        partida.status === 'FINALIZADO' ? 'border-blue-500/50 text-blue-500' : 
                        'border-rose-500/50 text-rose-500'
                      }`}>
                        {partida.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeletePartida(partida.id)}
                  className="p-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                  title="Excluir Partida"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <AdminPartidasModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePartida}
      />
    </div>
  );
}
