import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Users, Plus, Trophy, Trash2 } from 'lucide-react';
import { Time } from '../types';
import { supabase } from '../lib/supabase';
import AdminTimesModal from './AdminTimesModal';

interface AdminTimesScreenProps {
  onBack: () => void;
}

export default function AdminTimesScreen({ onBack }: AdminTimesScreenProps) {
  const [times, setTimes] = useState<Time[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTimes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('times')
        .select('*')
        .order('nome', { ascending: true });
      
      if (error) throw error;
      if (data) setTimes(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimes();
  }, []);

  const handleSaveTime = async (newTime: Omit<Time, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('times')
        .insert([newTime])
        .select();

      if (error) throw error;
      if (data) {
        setTimes(prev => [...prev, data[0]].sort((a, b) => a.nome.localeCompare(b.nome)));
      }
    } catch (error) {
      console.error('Error saving team:', error);
      alert('Erro ao salvar o time. Verifique se a tabela "times" existe no seu Supabase.');
    }
  };

  const handleDeleteTime = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este time?')) return;

    try {
      const { error } = await supabase
        .from('times')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTimes(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white pb-20">
      <header className="p-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-[#bef264]" />
          </button>
          <h1 className="text-xl font-bold tracking-tight">Gerenciar Times</h1>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#bef264] text-black px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" />
          Novo Time
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#bef264]/20 border-t-[#bef264] rounded-full animate-spin" />
          </div>
        ) : times.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-10 h-10 text-white/20" />
            </div>
            <h2 className="text-xl font-bold">Nenhum time cadastrado</h2>
            <p className="text-white/40 text-sm max-w-xs mx-auto">
              Comece cadastrando os times que participarão das partidas da sua banca.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {times.map((time, index) => (
              <motion.div
                key={time.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between group hover:bg-white/10 hover:border-[#bef264]/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#bef264]/10 rounded-xl flex items-center justify-center border border-[#bef264]/20">
                    <Trophy className="w-6 h-6 text-[#bef264]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{time.nome}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-0.5">
                        {[...Array(10)].map((_, i) => (
                          <div 
                            key={i}
                            className={`w-1.5 h-3 rounded-full ${
                              i < Math.floor(time.power_ranking) 
                                ? 'bg-[#bef264]' 
                                : i < time.power_ranking 
                                  ? 'bg-[#bef264]/50' 
                                  : 'bg-white/10'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-black text-[#bef264] uppercase tracking-widest">
                        PR {time.power_ranking.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteTime(time.id)}
                  className="p-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                  title="Excluir Time"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <AdminTimesModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTime}
      />
    </div>
  );
}
