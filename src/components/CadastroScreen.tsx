/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, CreditCard, MapPin, Phone, ChevronLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Usuario } from '../types';
import { supabase } from '../lib/supabase';

interface CadastroScreenProps {
  onBack: () => void;
  onSuccess: (user: Usuario) => void;
}

export default function CadastroScreen({ onBack, onSuccess }: CadastroScreenProps) {
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    cpf: '',
    endereco: '',
    celular: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic validation
    if (!formData.nome_completo || !formData.email || !formData.cpf || !formData.endereco || !formData.celular) {
      setError('Por favor, preencha todos os campos.');
      setIsLoading(false);
      return;
    }

    const newUser: any = {
      ...formData,
      saldo: 0,
    };

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .insert([newUser])
        .select()
        .single();

      if (!error && data) {
        onSuccess(data);
      } else {
        setError(error?.message || 'Erro ao realizar cadastro.');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 p-4 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">Criar Conta</h1>
      </header>

      <main className="flex-1 p-6 max-w-md mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Bem-vindo ao CoximBet</h2>
            <p className="text-slate-500 text-sm mt-1">Cadastre-se para começar a apostar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="text"
                  placeholder="Seu nome completo"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  value={formData.nome_completo}
                  onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="email"
                  placeholder="exemplo@email.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">CPF (Login)</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="text"
                  placeholder="000.000.000-00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Endereço</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="text"
                  placeholder="Rua, Número, Bairro"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Celular</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="tel"
                  placeholder="(67) 99999-9999"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  value={formData.celular}
                  onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-center gap-3 text-sm"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? 'Cadastrando...' : 'Finalizar Cadastro'}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
