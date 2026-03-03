import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'widgets/bet365_header.dart';
import 'models/bet_models.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Substitua pelas suas credenciais do Supabase
  await Supabase.initialize(
    url: 'SUA_URL_DO_SUPABASE',
    anonKey: 'SUA_ANON_KEY_DO_SUPABASE',
  );

  runApp(const CoximBetApp());
}

class CoximBetApp extends StatelessWidget {
  const CoximBetApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CoximBet',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        textTheme: GoogleFonts.interTextTheme(),
        primaryColor: const Color(0xFF003B2F),
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  Usuario? _currentUser;
  List<Partida> _partidas = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() => _isLoading = true);
    try {
      final response = await Supabase.instance.client
          .from('partidas')
          .select()
          .order('created_at', ascending: false);
      
      setState(() {
        _partidas = (response as List).map((p) => Partida.fromJson(p)).toList();
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Erro ao carregar dados: $e');
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: Bet365Header(
        user: _currentUser,
        onLogin: () {
          // Navegar para tela de login
        },
        onRegister: () {
          // Navegar para tela de cadastro
        },
        onLogout: () {
          setState(() => _currentUser = null);
        },
        onAdmin: () {
          // Navegar para Admin
        },
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: Color(0xFF003B2F)))
        : RefreshIndicator(
            onRefresh: _fetchData,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (_currentUser == null)
                  _buildWelcomeCard(),
                const SizedBox(height: 24),
                _buildSectionHeader('PARTIDAS EM ANDAMENTO', isLive: true),
                const SizedBox(height: 16),
                ..._partidas.map((p) => _buildPartidaCard(p)),
              ],
            ),
          ),
    );
  }

  Widget _buildWelcomeCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.black.withOpacity(0.05)),
      ),
      child: Column(
        children: [
          const Text(
            'Sua melhor aposta em Coxim',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
          ),
          const SizedBox(height: 4),
          const Text(
            'Acompanhe os jogos do Coxim Atlético Clube e muito mais.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 14, color: Color(0xFF64748B)),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, {bool isLive = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF1E293B)),
        ),
        if (isLive)
          Row(
            children: [
              Container(
                width: 6,
                height: 6,
                decoration: const BoxDecoration(color: Colors.emerald, shape: BoxShape.circle),
              ),
              const SizedBox(width: 4),
              const Text(
                'AO VIVO',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.emerald),
              ),
            ],
          ),
      ],
    );
  }

  Widget _buildPartidaCard(Partida partida) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'VOLUME: R\$ ${partida.volumeTotal.toStringAsFixed(0)}',
                style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.black26),
              ),
              Text(
                '${partida.horario}',
                style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.black26),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _buildOddButton(partida.timeCasa, 'CASA', partida.oddCasa),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 8),
                child: Text('VS', style: TextStyle(fontStyle: FontStyle.italic, fontWeight: FontWeight.w900, color: Colors.black12)),
              ),
              _buildOddButton('Empate', 'X', partida.oddEmpate),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 8),
                child: Text('VS', style: TextStyle(fontStyle: FontStyle.italic, fontWeight: FontWeight.w900, color: Colors.black12)),
              ),
              _buildOddButton(partida.timeFora, 'FORA', partida.oddFora),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildOddButton(String team, String label, double odd) {
    return Expanded(
      child: Column(
        children: [
          Text(
            team,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
          ),
          const SizedBox(height: 8),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 12),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFF1F5F9)),
            ),
            child: Column(
              children: [
                Text(label, style: const TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Colors.black26)),
                Text(
                  odd.toStringAsFixed(2),
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF003B2F)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
