/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum StatusAposta {
  PENDENTE = 'Pendente',
  GREEN = 'Green',
  RED = 'Red',
}

export interface Partida {
  id: string;
  time_casa: string;
  time_fora: string;
  volume_casa: number;
  volume_fora: number;
  volume_empate: number;
  odd_casa: number;
  odd_fora: number;
  odd_empate: number;
  last_odd_casa: number;
  last_odd_fora: number;
  last_odd_empate: number;
  margem: number;
  data_partida: string;
  horario: string;
  status: string;
}

export interface Aposta {
  id: string;
  usuario_id?: string;
  partida_id?: string;
  time_casa: string;
  time_fora: string;
  valor: number;
  odd_no_momento: number;
  data_aposta: string;
  status: StatusAposta;
  time_escolhido: 'Casa' | 'Fora' | 'Empate';
}

export interface Usuario {
  id: string;
  nome_completo: string;
  email: string;
  cpf: string;
  endereco: string;
  celular: string;
  saldo: number;
}

export interface Administrador {
  id: string;
  nome_completo: string;
  email: string;
  cpf: string;
  senha?: string;
  celular: string;
}

export interface Time {
  id: string;
  nome: string;
  power_ranking: number;
  created_at?: string;
}

export interface DashboardStats {
  saldoTotal: number;
  lucroMensal: number;
  roi: number;
}
