import 'package:intl/intl.dart';

enum StatusAposta {
  pendente,
  green,
  red,
}

class Usuario {
  final String id;
  final String nomeCompleto;
  final String cpf;
  final double saldo;

  Usuario({
    required this.id,
    required this.nomeCompleto,
    required this.cpf,
    required this.saldo,
  });

  factory Usuario.fromJson(Map<String, dynamic> json) {
    return Usuario(
      id: json['id'],
      nomeCompleto: json['nome_completo'],
      cpf: json['cpf'],
      saldo: (json['saldo'] as num).toDouble(),
    );
  }
}

class Partida {
  final String id;
  final String timeCasa;
  final String timeFora;
  final double oddCasa;
  final double oddFora;
  final double oddEmpate;
  final double lastOddCasa;
  final double lastOddFora;
  final double lastOddEmpate;
  final String dataPartida;
  final String horario;
  final double volumeCasa;
  final double volumeFora;
  final double volumeEmpate;

  Partida({
    required this.id,
    required this.timeCasa,
    required this.timeFora,
    required this.oddCasa,
    required this.oddFora,
    required this.oddEmpate,
    required this.lastOddCasa,
    required this.lastOddFora,
    required this.lastOddEmpate,
    required this.dataPartida,
    required this.horario,
    required this.volumeCasa,
    required this.volumeFora,
    required this.volumeEmpate,
  });

  factory Partida.fromJson(Map<String, dynamic> json) {
    return Partida(
      id: json['id'],
      timeCasa: json['time_casa'],
      timeFora: json['time_fora'],
      oddCasa: (json['odd_casa'] as num).toDouble(),
      oddFora: (json['odd_fora'] as num).toDouble(),
      oddEmpate: (json['odd_empate'] as num).toDouble(),
      lastOddCasa: (json['last_odd_casa'] as num).toDouble(),
      lastOddFora: (json['last_odd_fora'] as num).toDouble(),
      lastOddEmpate: (json['last_odd_empate'] as num).toDouble(),
      dataPartida: json['data_partida'],
      horario: json['horario'],
      volumeCasa: (json['volume_casa'] as num).toDouble(),
      volumeFora: (json['volume_fora'] as num).toDouble(),
      volumeEmpate: (json['volume_empate'] as num).toDouble(),
    );
  }

  double get volumeTotal => volumeCasa + volumeFora + volumeEmpate;
}

class Aposta {
  final String id;
  final String usuarioId;
  final String partidaId;
  final String timeCasa;
  final String timeFora;
  final String timeEscolhido;
  final double valor;
  final double oddNoMomento;
  final StatusAposta status;
  final DateTime createdAt;

  Aposta({
    required this.id,
    required this.usuarioId,
    required this.partidaId,
    required this.timeCasa,
    required this.timeFora,
    required this.timeEscolhido,
    required this.valor,
    required this.oddNoMomento,
    required this.status,
    required this.createdAt,
  });

  factory Aposta.fromJson(Map<String, dynamic> json) {
    return Aposta(
      id: json['id'],
      usuarioId: json['usuario_id'],
      partidaId: json['partida_id'],
      timeCasa: json['time_casa'],
      timeFora: json['time_fora'],
      timeEscolhido: json['time_escolhido'],
      valor: (json['valor'] as num).toDouble(),
      oddNoMomento: (json['odd_no_momento'] as num).toDouble(),
      status: _parseStatus(json['status']),
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  static StatusAposta _parseStatus(String status) {
    switch (status.toUpperCase()) {
      case 'GREEN': return StatusAposta.green;
      case 'RED': return StatusAposta.red;
      default: return StatusAposta.pendente;
    }
  }
}
