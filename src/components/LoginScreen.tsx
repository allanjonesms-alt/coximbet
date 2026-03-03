/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, ChevronLeft, AlertCircle, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Administrador } from '../types';

interface LoginScreenProps {
  onLogin: (admin: Administrador) => void;
  onBack: () => void;
}

export default function LoginScreen({ onLogin, onBack }: LoginScreenProps) {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Tenta buscar o admin. 
      // Nota: Se o RLS estiver ativado no Supabase, certifique-se de ter uma política de SELECT.
      const { data, error: supabaseError } = await supabase
        .from('administradores')
        .select('*')
        .eq('cpf', cpf.trim())
        .eq('senha', password.trim())
        .single();

      if (supabaseError) {
        console.error('Erro na autenticação:', supabaseError);
        setError('CPF ou Senha incorretos ou erro de permissão.');
      } else if (data) {
        onLogin(data);
      } else {
        setError('CPF ou Senha incorretos.');
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Erro ao conectar com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      <header className="p-6">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-[#bef264]" />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 pb-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm space-y-8 text-center"
        >
          <div className="mx-auto w-20 h-20 bg-[#bef264]/10 rounded-3xl flex items-center justify-center border border-[#bef264]/20">
            <Lock className="w-10 h-10 text-[#bef264]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Acesso Restrito</h1>
            <p className="text-white/40 text-sm">Digite suas credenciais administrativas</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-4">CPF</label>
              <div className="relative">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input 
                  type="text"
                  placeholder="000.000.000-00"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-sm focus:ring-2 focus:ring-[#bef264] outline-none transition-all placeholder:text-white/10"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-4">Senha</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input 
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-sm focus:ring-2 focus:ring-[#bef264] outline-none transition-all placeholder:text-white/10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#bef264] text-black font-black py-5 rounded-2xl shadow-2xl shadow-[#bef264]/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest mt-4 disabled:opacity-50"
            >
              {isLoading ? 'Autenticando...' : 'Entrar no Painel'}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
