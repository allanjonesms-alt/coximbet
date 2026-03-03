import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Save } from 'lucide-react';
import { Time } from '../types';

interface AdminTimesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (time: Omit<Time, 'id' | 'created_at'>) => Promise<void>;
}

export default function AdminTimesModal({ isOpen, onClose, onSave }: AdminTimesModalProps) {
  const [nome, setNome] = useState('');
  const [powerRanking, setPowerRanking] = useState('5.0');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    setIsSaving(true);
    try {
      await onSave({
        nome: nome.trim(),
        power_ranking: parseFloat(powerRanking)
      });
      setNome('');
      setPowerRanking('5.0');
      onClose();
    } catch (error) {
      console.error('Error saving team:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#bef264]/10 rounded-xl flex items-center justify-center border border-[#bef264]/20">
                    <Trophy className="w-6 h-6 text-[#bef264]" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Novo Time</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white/40" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Nome do Time</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Coxim AC"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-[#bef264] outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Power Ranking (1-10)</label>
                    <span className="text-sm font-black text-[#bef264]">{parseFloat(powerRanking).toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.1"
                    value={powerRanking}
                    onChange={(e) => setPowerRanking(e.target.value)}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#bef264]"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-white/20 uppercase px-1">
                    <span>Iniciante</span>
                    <span>Elite</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-[#bef264] text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Salvar Time
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
