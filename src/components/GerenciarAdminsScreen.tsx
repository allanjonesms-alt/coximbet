import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, UserPlus, Shield, Trash2, Mail, CreditCard, Phone } from 'lucide-react';
import { Administrador } from '../types';
import { supabase } from '../lib/supabase';

interface GerenciarAdminsScreenProps {
  onBack: () => void;
}

export default function GerenciarAdminsScreen({ onBack }: GerenciarAdminsScreenProps) {
  const [admins, setAdmins] = useState<Administrador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    cpf: '',
    senha: '',
    celular: '',
  });
  const [error, setError] = useState<string | null>(null);

  const fetchAdmins = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('administradores').select('*');
    if (data) setAdmins(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { error } = await supabase.from('administradores').insert([formData]);
      if (!error) {
        setIsAdding(false);
        setFormData({ nome_completo: '', email: '', cpf: '', senha: '', celular: '' });
        fetchAdmins();
      } else {
        setError(error.message);
      }
    } catch (err) {
      setError('Erro ao salvar administrador.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este administrador?')) {
      await supabase.from('administradores').delete().eq('id', id);
      fetchAdmins();
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white pb-20">
      <header className="p-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-[#bef264]" />
          </button>
          <h1 className="text-xl font-bold tracking-tight">Gerenciar Administradores</h1>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-[#bef264] text-black px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <UserPlus className="w-4 h-4" />
          {isAdding ? 'Cancelar' : 'Novo Admin'}
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4"
          >
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#bef264]" />
              Cadastrar Novo Administrador
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Nome Completo</label>
                <input 
                  required
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#bef264] outline-none"
                  value={formData.nome_completo}
                  onChange={e => setFormData({...formData, nome_completo: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">E-mail</label>
                <input 
                  required
                  type="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#bef264] outline-none"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">CPF</label>
                <input 
                  required
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#bef264] outline-none"
                  value={formData.cpf}
                  onChange={e => setFormData({...formData, cpf: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Senha</label>
                <input 
                  required
                  type="password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#bef264] outline-none"
                  value={formData.senha}
                  onChange={e => setFormData({...formData, senha: e.target.value})}
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Celular</label>
                <input 
                  required
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#bef264] outline-none"
                  value={formData.celular}
                  onChange={e => setFormData({...formData, celular: e.target.value})}
                />
              </div>
              {error && <p className="text-rose-500 text-xs font-bold md:col-span-2">{error}</p>}
              <button type="submit" className="md:col-span-2 bg-[#bef264] text-black font-black py-4 rounded-xl hover:bg-[#d9ff99] transition-colors">
                Salvar Administrador
              </button>
            </form>
          </motion.div>
        )}

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest ml-1">Administradores Ativos</h3>
          {isLoading ? (
            <div className="text-center py-10 opacity-50">Carregando...</div>
          ) : (
            admins.map(admin => (
              <div key={admin.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#bef264]/10 rounded-xl flex items-center justify-center border border-[#bef264]/20">
                    <Shield className="w-6 h-6 text-[#bef264]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{admin.nome_completo}</h4>
                    <div className="flex items-center gap-3 mt-1 opacity-40 text-[10px] font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {admin.email}</span>
                      <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> {admin.cpf}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(admin.id)}
                  className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
