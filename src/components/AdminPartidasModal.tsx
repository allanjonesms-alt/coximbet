import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, Trophy, Save, Search } from 'lucide-react';
import { Time, Partida } from '../types';
import { supabase } from '../lib/supabase';

interface AdminPartidasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (partida: Omit<Partida, 'id'>) => Promise<void>;
}

export default function AdminPartidasModal({ isOpen, onClose, onSave }: AdminPartidasModalProps) {
  const [dataPartida, setDataPartida] = useState('');
  const [horaPartida, setHoraPartida] = useState('');
  const [timeCasa, setTimeCasa] = useState('');
  const [timeFora, setTimeFora] = useState('');
  const [margem, setMargem] = useState('10');
  const [prCasa, setPrCasa] = useState<number>(50);
  const [prFora, setPrFora] = useState<number>(50);
  const [isSaving, setIsSaving] = useState(false);
  
  const [calculatedOdds, setCalculatedOdds] = useState<{casa: number, fora: number, empate: number} | null>(null);
  const [allTeams, setAllTeams] = useState<Time[]>([]);
  const [filteredCasa, setFilteredCasa] = useState<Time[]>([]);
  const [filteredFora, setFilteredFora] = useState<Time[]>([]);
  const [showCasaSuggestions, setShowCasaSuggestions] = useState(false);
  const [showForaSuggestions, setShowForaSuggestions] = useState(false);

  const casaRef = useRef<HTMLDivElement>(null);
  const foraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      const { data } = await supabase.from('times').select('*').order('nome');
      if (data) setAllTeams(data);
    };
    if (isOpen) fetchTeams();
  }, [isOpen]);

  const calculateOdds = (prCasa: number, prFora: number, margin: number) => {
    // 1. Raw Probabilities (Weights)
    const totalWeight = prCasa + prFora;
    const wA = prCasa / totalWeight;
    const wB = prFora / totalWeight;
    
    // 2. Draw Probability (ProbEmpate)
    // Fluctuates between 20% (desequilibrado) and 30% (equilibrado)
    const probEmpate = 0.20 + (0.10 * (1 - Math.abs(wA - wB)));
    
    // 3. Distribution of the Rest
    const probA = (1.0 - probEmpate) * wA;
    const probB = (1.0 - probEmpate) * wB;
    
    // 4. Apply Margin (Overround)
    const overround = 1 + (margin / 100);
    
    const oddCasa = 1 / (probA * overround);
    const oddFora = 1 / (probB * overround);
    const oddEmpate = 1 / (probEmpate * overround);
    
    return { 
      casa: Math.max(1.01, parseFloat(oddCasa.toFixed(2))), 
      fora: Math.max(1.01, parseFloat(oddFora.toFixed(2))),
      empate: Math.max(1.01, parseFloat(oddEmpate.toFixed(2)))
    };
  };

  useEffect(() => {
    const teamCasa = allTeams.find(t => t.nome === timeCasa);
    if (teamCasa) setPrCasa(teamCasa.power_ranking);
  }, [timeCasa, allTeams]);

  useEffect(() => {
    const teamFora = allTeams.find(t => t.nome === timeFora);
    if (teamFora) setPrFora(teamFora.power_ranking);
  }, [timeFora, allTeams]);

  useEffect(() => {
    if (timeCasa && timeFora) {
      const odds = calculateOdds(prCasa, prFora, parseFloat(margem));
      setCalculatedOdds(odds);
    } else {
      setCalculatedOdds(null);
    }
  }, [timeCasa, timeFora, prCasa, prFora, margem]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (casaRef.current && !casaRef.current.contains(event.target as Node)) {
        setShowCasaSuggestions(false);
      }
      if (foraRef.current && !foraRef.current.contains(event.target as Node)) {
        setShowForaSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchCasa = (val: string) => {
    setTimeCasa(val);
    if (val.trim()) {
      const filtered = allTeams.filter(t => 
        t.nome.toLowerCase().includes(val.toLowerCase())
      );
      setFilteredCasa(filtered);
      setShowCasaSuggestions(true);
    } else {
      setFilteredCasa([]);
      setShowCasaSuggestions(false);
    }
  };

  const handleSearchFora = (val: string) => {
    setTimeFora(val);
    if (val.trim()) {
      const filtered = allTeams.filter(t => 
        t.nome.toLowerCase().includes(val.toLowerCase())
      );
      setFilteredFora(filtered);
      setShowForaSuggestions(true);
    } else {
      setFilteredFora([]);
      setShowForaSuggestions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!timeCasa || !timeFora || !dataPartida || !horaPartida || !calculatedOdds) return;

    setIsSaving(true);
    try {
      await onSave({
        time_casa: timeCasa,
        time_fora: timeFora,
        volume_casa: 0,
        volume_fora: 0,
        volume_empate: 0,
        odd_casa: calculatedOdds.casa,
        odd_fora: calculatedOdds.fora,
        odd_empate: calculatedOdds.empate,
        last_odd_casa: calculatedOdds.casa,
        last_odd_fora: calculatedOdds.fora,
        last_odd_empate: calculatedOdds.empate,
        margem: parseFloat(margem),
        data_partida: dataPartida,
        horario: horaPartida,
        status: 'ATIVO'
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving match:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-[24px] overflow-hidden shadow-2xl"
          >
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#bef264]/10 rounded-lg flex items-center justify-center border border-[#bef264]/20">
                    <Trophy className="w-5 h-5 text-[#bef264]" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Nova Partida</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-1.5 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Data</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                      <input
                        type="date"
                        required
                        value={dataPartida}
                        onChange={(e) => setDataPartida(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#bef264] outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Horário</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                      <input
                        type="time"
                        required
                        value={horaPartida}
                        onChange={(e) => setHoraPartida(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#bef264] outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1 relative" ref={casaRef}>
                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Time da Casa</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                      <input
                        type="text"
                        required
                        value={timeCasa}
                        onChange={(e) => handleSearchCasa(e.target.value)}
                        onFocus={() => timeCasa && setShowCasaSuggestions(true)}
                        placeholder="Buscar time..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:ring-2 focus:ring-[#bef264] outline-none transition-all"
                      />
                    </div>
                    <AnimatePresence>
                      {showCasaSuggestions && filteredCasa.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 w-full mt-1 bg-[#222] border border-white/10 rounded-xl overflow-hidden shadow-xl max-h-32 overflow-y-auto"
                        >
                          {filteredCasa.map(team => (
                            <button
                              key={team.id}
                              type="button"
                              onClick={() => {
                                setTimeCasa(team.nome);
                                setShowCasaSuggestions(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-[#bef264]/10 hover:text-[#bef264] transition-colors text-xs font-medium border-b border-white/5 last:border-0"
                            >
                              {team.nome}
                              <span className="float-right text-[9px] opacity-40">PR {team.power_ranking.toFixed(1)}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-1 relative" ref={foraRef}>
                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Time de Fora</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                      <input
                        type="text"
                        required
                        value={timeFora}
                        onChange={(e) => handleSearchFora(e.target.value)}
                        onFocus={() => timeFora && setShowForaSuggestions(true)}
                        placeholder="Buscar time..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:ring-2 focus:ring-[#bef264] outline-none transition-all"
                      />
                    </div>
                    <AnimatePresence>
                      {showForaSuggestions && filteredFora.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 w-full mt-1 bg-[#222] border border-white/10 rounded-xl overflow-hidden shadow-xl max-h-32 overflow-y-auto"
                        >
                          {filteredFora.map(team => (
                            <button
                              key={team.id}
                              type="button"
                              onClick={() => {
                                setTimeFora(team.nome);
                                setShowForaSuggestions(false);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-[#bef264]/10 hover:text-[#bef264] transition-colors text-xs font-medium border-b border-white/5 last:border-0"
                            >
                              {team.nome}
                              <span className="float-right text-[9px] opacity-40">PR {team.power_ranking.toFixed(1)}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {timeCasa && timeFora && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center ml-1">
                        <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Força Casa</label>
                        <span className="text-[10px] font-black text-[#bef264]">{prCasa.toFixed(0)}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        step="1"
                        value={prCasa}
                        onChange={(e) => setPrCasa(parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#bef264]"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center ml-1">
                        <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Força Fora</label>
                        <span className="text-[10px] font-black text-[#bef264]">{prFora.toFixed(0)}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        step="1"
                        value={prFora}
                        onChange={(e) => setPrFora(parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#bef264]"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Margem (%)</label>
                    <span className="text-xs font-black text-[#bef264]">{margem}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={margem}
                    onChange={(e) => setMargem(e.target.value)}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#bef264]"
                  />
                </div>

                {calculatedOdds && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2"
                  >
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-1.5 bg-white/5 rounded-lg border border-white/5">
                        <p className="text-[8px] text-white/40 uppercase font-bold">Casa</p>
                        <p className="text-sm font-black text-[#bef264]">{calculatedOdds.casa.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-1.5 bg-white/5 rounded-lg border border-white/5">
                        <p className="text-[8px] text-white/40 uppercase font-bold">Empate</p>
                        <p className="text-sm font-black text-[#bef264]">{calculatedOdds.empate.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-1.5 bg-white/5 rounded-lg border border-white/5">
                        <p className="text-[8px] text-white/40 uppercase font-bold">Fora</p>
                        <p className="text-sm font-black text-[#bef264]">{calculatedOdds.fora.toFixed(2)}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isSaving || !calculatedOdds}
                  className="w-full bg-[#bef264] text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:scale-100 text-sm"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Confirmar Partida
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
