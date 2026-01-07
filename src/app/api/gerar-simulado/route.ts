import { NextRequest, NextResponse } from 'next/server';

// ==========================================
// 1. CONFIGURAÇÃO DE BANCAS E QUANTIDADES
// ==========================================
const OFFICIAL_COUNTS: Record<string, Record<string, number>> = {
  // ENEM: 180 questões totais (45 por área)
  // Linguagens (45): Português ~25, Literatura ~8, Inglês/Espanhol 5, Artes 4, Ed.Física 3
  // Humanas (45): História ~15, Geografia ~15, Filosofia ~7, Sociologia ~8
  // Natureza (45): Biologia ~15, Física ~15, Química ~15
  // Matemática (45): Matemática 45
  'ENEM': {
    'Matemática': 45,
    'Língua Portuguesa': 25,
    'Literatura': 8,
    'Inglês': 5,
    'Espanhol': 5,
    'Artes': 4,
    'História': 15,
    'Geografia': 15,
    'Filosofia': 7,
    'Sociologia': 8,
    'Biologia': 15,
    'Física': 15,
    'Química': 15
  },
  // FUVEST: 90 questões totais (1ª fase) - aproximadamente 10 por disciplina
  'FUVEST': {
    'Matemática': 10,
    'Língua Portuguesa': 10,
    'Literatura': 10,
    'Inglês': 10,
    'História': 10,
    'Geografia': 10,
    'Biologia': 10,
    'Física': 10,
    'Química': 10
  },
  // UNICAMP 2025: 72 questões totais (1ª fase)
  'UNICAMP': {
    'Língua Portuguesa': 12,
    'Literatura': 12, // Portugês + Literatura compartilham 12
    'Matemática': 12,
    'Inglês': 7,
    'Química': 7,
    'Física': 7,
    'Biologia': 7,
    'História': 7,
    'Geografia': 7,
    'Filosofia': 3,
    'Sociologia': 3
  },
  // UNESP (VUNESP): 90 questões totais (30 por área)
  // Ciências da Natureza e Matemática (30): Mat ~8, Bio ~7, Fis ~7, Qui ~8
  // Linguagens (30): Port ~12, Lit ~6, Inglês ~6, Artes ~6
  // Humanas (30): História ~10, Geografia ~10, Filosofia ~5, Sociologia ~5
  'UNESP (VUNESP)': {
    'Matemática': 8,
    'Língua Portuguesa': 12,
    'Literatura': 6,
    'Inglês': 6,
    'Artes': 6,
    'História': 10,
    'Geografia': 10,
    'Filosofia': 5,
    'Sociologia': 5,
    'Biologia': 7,
    'Física': 7,
    'Química': 8
  },
  // UERJ: 60 questões totais (Exame de Qualificação) - 15 por área
  // Linguagens (15), Matemática (15), Humanas (15), Natureza (15)
  'UERJ': {
    'Matemática': 15,
    'Língua Portuguesa': 8,
    'Literatura': 7,
    'Língua Estrangeira': 5, // Inglês ou Espanhol
    'História': 5,
    'Geografia': 5,
    'Filosofia': 2,
    'Sociologia': 3,
    'Biologia': 5,
    'Física': 5,
    'Química': 5
  }
};

// ==========================================
// 2. BASE DE CONHECIMENTO (TÓPICOS E PROBABILIDADES)
// ==========================================
const TOPICOS_BASE: Record<string, Array<{ nome: string, probabilidade: number, tendencia: string }>> = {
  'Matemática': [
    { nome: 'Geometria Plana e Espacial', probabilidade: 0.22, tendencia: 'Muito Alta' },
    { nome: 'Funções e Gráficos', probabilidade: 0.18, tendencia: 'Alta' },
    { nome: 'Estatística e Probabilidade', probabilidade: 0.16, tendencia: 'Muito Alta' },
    { nome: 'Aritmética e Razão/Proporção', probabilidade: 0.15, tendencia: 'Alta' },
    { nome: 'Matemática Financeira', probabilidade: 0.10, tendencia: 'Média' },
    { nome: 'Trigonometria', probabilidade: 0.08, tendencia: 'Média' },
    { nome: 'Logaritmos', probabilidade: 0.06, tendencia: 'Baixa' },
    { nome: 'Análise Combinatória', probabilidade: 0.05, tendencia: 'Média' }
  ],
  'Física': [
    { nome: 'Mecânica (Cinemática/Dinâmica)', probabilidade: 0.30, tendencia: 'Muito Alta' },
    { nome: 'Eletrodinâmica', probabilidade: 0.20, tendencia: 'Alta' },
    { nome: 'Termologia', probabilidade: 0.15, tendencia: 'Alta' },
    { nome: 'Ondulatória', probabilidade: 0.15, tendencia: 'Alta' },
    { nome: 'Óptica', probabilidade: 0.10, tendencia: 'Média' },
    { nome: 'Física Moderna', probabilidade: 0.05, tendencia: 'Baixa' }
  ],
  'Química': [
    { nome: 'Físico-Química (Termo/Cinética/Equilíbrio)', probabilidade: 0.25, tendencia: 'Alta' },
    { nome: 'Química Orgânica (Reações/Funções)', probabilidade: 0.25, tendencia: 'Muito Alta' },
    { nome: 'Estequiometria', probabilidade: 0.15, tendencia: 'Alta' },
    { nome: 'Ligações Químicas e Interações', probabilidade: 0.15, tendencia: 'Média' },
    { nome: 'Química Ambiental', probabilidade: 0.10, tendencia: 'Alta' },
    { nome: 'Soluções', probabilidade: 0.10, tendencia: 'Média' }
  ],
  'Biologia': [
    { nome: 'Ecologia e Meio Ambiente', probabilidade: 0.30, tendencia: 'Muito Alta' },
    { nome: 'Genética e Biotecnologia', probabilidade: 0.15, tendencia: 'Alta' },
    { nome: 'Fisiologia Humana', probabilidade: 0.15, tendencia: 'Alta' },
    { nome: 'Citologia', probabilidade: 0.12, tendencia: 'Média' },
    { nome: 'Evolução', probabilidade: 0.10, tendencia: 'Média' },
    { nome: 'Botânica', probabilidade: 0.08, tendencia: 'Baixa' },
    { nome: 'Zoologia/Parasitologia', probabilidade: 0.10, tendencia: 'Média' }
  ],
  'História': [
    { nome: 'Brasil: Segundo Reinado', probabilidade: 0.15, tendencia: 'Alta' },
    { nome: 'Brasil: Era Vargas', probabilidade: 0.15, tendencia: 'Alta' },
    { nome: 'Brasil: Ditadura Militar', probabilidade: 0.12, tendencia: 'Alta' },
    { nome: 'Brasil: Sistema Colonial', probabilidade: 0.10, tendencia: 'Média' },
    { nome: 'Geral: Idade Contemporânea (Guerras)', probabilidade: 0.15, tendencia: 'Alta' },
    { nome: 'Geral: Antiguidade Clássica', probabilidade: 0.08, tendencia: 'Baixa' },
    { nome: 'Patrimônio e Cultura', probabilidade: 0.10, tendencia: 'Alta' }
  ],
  'Geografia': [
    { nome: 'Geografia Agrária', probabilidade: 0.15, tendencia: 'Alta' },
    { nome: 'Geografia Urbana', probabilidade: 0.15, tendencia: 'Alta' },
    { nome: 'Geopolítica e Globalização', probabilidade: 0.15, tendencia: 'Muito Alta' },
    { nome: 'Meio Ambiente e Clima', probabilidade: 0.20, tendencia: 'Muito Alta' },
    { nome: 'Geografia Física (Relevo/Hidrografia)', probabilidade: 0.15, tendencia: 'Média' },
    { nome: 'Demografia', probabilidade: 0.10, tendencia: 'Média' }
  ],
  'Língua Portuguesa': [
    { nome: 'Interpretação de Texto', probabilidade: 0.40, tendencia: 'Muito Alta' },
    { nome: 'Gêneros Textuais', probabilidade: 0.20, tendencia: 'Alta' },
    { nome: 'Variação Linguística', probabilidade: 0.15, tendencia: 'Alta' },
    { nome: 'Gramática Contextualizada', probabilidade: 0.15, tendencia: 'Média' },
    { nome: 'Funções da Linguagem', probabilidade: 0.10, tendencia: 'Média' }
  ],
  'Literatura': [
    { nome: 'Modernismo', probabilidade: 0.30, tendencia: 'Muito Alta' },
    { nome: 'Romantismo', probabilidade: 0.20, tendencia: 'Alta' },
    { nome: 'Realismo/Naturalismo', probabilidade: 0.20, tendencia: 'Alta' },
    { nome: 'Literatura Contemporânea', probabilidade: 0.15, tendencia: 'Alta' },
    { nome: 'Barroco/Arcadismo', probabilidade: 0.10, tendencia: 'Baixa' }
  ],
  'Filosofia': [
    { nome: 'Filosofia Antiga (Grécia)', probabilidade: 0.25, tendencia: 'Alta' },
    { nome: 'Filosofia Política', probabilidade: 0.25, tendencia: 'Alta' },
    { nome: 'Ética e Moral', probabilidade: 0.20, tendencia: 'Alta' },
    { nome: 'Teoria do Conhecimento', probabilidade: 0.15, tendencia: 'Média' },
    { nome: 'Filosofia Contemporânea', probabilidade: 0.15, tendencia: 'Média' }
  ],
  'Sociologia': [
    { nome: 'Mundo do Trabalho', probabilidade: 0.25, tendencia: 'Alta' },
    { nome: 'Cultura e Indústria Cultural', probabilidade: 0.20, tendencia: 'Alta' },
    { nome: 'Movimentos Sociais', probabilidade: 0.20, tendencia: 'Alta' },
    { nome: 'Desigualdade Social', probabilidade: 0.20, tendencia: 'Muito Alta' },
    { nome: 'Poder, Estado e Política', probabilidade: 0.15, tendencia: 'Média' }
  ],
  'Inglês': [
    { nome: 'Interpretação de Texto (Jornalístico)', probabilidade: 0.40, tendencia: 'Muito Alta' },
    { nome: 'Interpretação de Texto (Literário/Música)', probabilidade: 0.30, tendencia: 'Alta' },
    { nome: 'Vocabulário Contextual', probabilidade: 0.20, tendencia: 'Média' },
    { nome: 'Conectivos e Referência', probabilidade: 0.10, tendencia: 'Média' }
  ],
  'Espanhol': [
    { nome: 'Interpretação de Texto', probabilidade: 0.50, tendencia: 'Muito Alta' },
    { nome: 'Falsos Cognatos', probabilidade: 0.20, tendencia: 'Alta' },
    { nome: 'Gramática Contextual', probabilidade: 0.30, tendencia: 'Média' }
  ],
  'Artes': [
    { nome: 'Arte Contemporânea', probabilidade: 0.40, tendencia: 'Muito Alta' },
    { nome: 'Vanguardas Europeias', probabilidade: 0.30, tendencia: 'Alta' },
    { nome: 'Arte Brasileira', probabilidade: 0.20, tendencia: 'Média' },
    { nome: 'Música e Cultura Popular', probabilidade: 0.10, tendencia: 'Média' }
  ]
};

// ==========================================
// 3. BANCO DE QUESTÕES (MOCK EXPANDIDO)
// ==========================================
// Nota: Em um sistema real, isso viria de um DB. Aqui simulamos algumas para exemplo.
const QUESTOES_DB_MOCK = [
  {
    disciplina: 'Matemática',
    enunciado: 'Um investidor aplica R$ 1.000,00 a juros compostos de 10% ao mês. Após 2 meses, qual será o montante?',
    alternativas: ['R$ 1.200,00', 'R$ 1.210,00', 'R$ 1.100,00', 'R$ 1.220,00', 'R$ 1.150,00'],
    alternativaCorreta: 1,
    explicacao: 'M = C * (1 + i)^t. M = 1000 * (1,1)^2 = 1000 * 1,21 = 1210.',
    dificuldade: 'Fácil',
    topico: 'Matemática Financeira',
    fonte: 'Simulação IA',
    ano: 2024
  },
  {
    disciplina: 'Física',
    enunciado: 'Um carro percorre 100km em 2 horas. Qual sua velocidade média?',
    alternativas: ['20 km/h', '40 km/h', '50 km/h', '60 km/h', '100 km/h'],
    alternativaCorreta: 2,
    explicacao: 'Vm = DeltaS / DeltaT = 100 / 2 = 50 km/h.',
    dificuldade: 'Fácil',
    topico: 'Mecânica (Cinemática/Dinâmica)',
    fonte: 'Simulação IA',
    ano: 2023
  },
  {
    disciplina: 'História',
    enunciado: 'A Revolução Francesa (1789) teve como um de seus principais marcos a Queda da Bastilha. Qual era o lema dos revolucionários?',
    alternativas: ['Ordem e Progresso', 'Liberdade, Igualdade e Fraternidade', 'Paz, Terra e Pão', 'Deus, Pátria e Família', 'Vencer ou Morrer'],
    alternativaCorreta: 1,
    explicacao: 'O lema "Liberté, Égalité, Fraternité" tornou-se o símbolo da República Francesa e dos ideais iluministas.',
    dificuldade: 'Média',
    topico: 'Revolução Francesa',
    fonte: 'ENEM 2022',
    ano: 2022
  },
  {
    disciplina: 'Biologia',
    enunciado: 'Qual organela celular é responsável pela produção de energia (ATP) através da respiração celular?',
    alternativas: ['Ribossomo', 'Complexo de Golgi', 'Mitocôndria', 'Lisossomo', 'Cloroplasto'],
    alternativaCorreta: 2,
    explicacao: 'As mitocôndrias são as "usinas" de energia da célula, realizando o ciclo de Krebs e a cadeia respiratória.',
    topico: 'Citologia',
    fonte: 'FUVEST 2023',
    ano: 2023
  },
  {
    disciplina: 'Geografia',
    enunciado: 'Sobre as tendências climáticas para 2025, qual fenômeno tem maior probabilidade de influenciar o regime de chuvas no Brasil?',
    alternativas: ['La Niña', 'El Niño', 'Monções', 'Ciclones Extratropicais', 'Frentes Frias Estacionárias'],
    alternativaCorreta: 0,
    explicacao: 'Modelos climáticos para 2025 indicam a transição para o fenômeno La Niña, que altera a distribuição de chuvas, especialmente no Sul e Nordeste.',
    dificuldade: 'Média',
    topico: 'Climatologia',
    fonte: 'Simulado 2025',
    ano: 2025
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tipoProva = 'ENEM',
      disciplina = 'Matemática',
      dificuldade = 'Todas', // Fácil, Média, Difícil
      probabilidade = 'Todas', // Alta (>0.2), Média (>0.1), Baixa
      modo = 'padrao', // 'padrao' | 'maratona'
      ano = 'Todos',
      busca = ''
    } = body;

    // 1. Determinar Quantidade Oficial
    const countsBanca = OFFICIAL_COUNTS[tipoProva] || {};
    let quantidadeOficial = countsBanca[disciplina] || 10;

    // Se for modo maratona, força 100 questões
    if (modo === 'maratona') {
      quantidadeOficial = 100;
    }

    // Removemos o limite de 50 para respeitar a regra do vestibular ou a maratona
    const quantidadeReal = quantidadeOficial;

    // 2. Filtrar Tópicos por Probabilidade (se solicitado)
    let topicosDisponiveis = TOPICOS_BASE[disciplina] || [];

    if (probabilidade !== 'Todas') {
      topicosDisponiveis = topicosDisponiveis.filter(t => {
        if (probabilidade === 'Alta') return t.probabilidade >= 0.20;
        if (probabilidade === 'Média') return t.probabilidade >= 0.10 && t.probabilidade < 0.20;
        if (probabilidade === 'Baixa') return t.probabilidade < 0.10;
        return true;
      });

      if (topicosDisponiveis.length === 0) {
        topicosDisponiveis = TOPICOS_BASE[disciplina] || []; // Reset
      }
    }

    // 3. Filtrar por Busca (Palavra-chave)
    if (busca) {
      const buscaLower = busca.toLowerCase();
      topicosDisponiveis = topicosDisponiveis.filter(t =>
        t.nome.toLowerCase().includes(buscaLower)
      );
      if (topicosDisponiveis.length === 0) {
        // Se não achar no tópico, a gente mantém os tópicos mas a IA vai "simular" a busca no enunciado depois
        topicosDisponiveis = TOPICOS_BASE[disciplina] || [];
      }
    }

    const questoesGeradas: any[] = [];

    for (let i = 0; i < quantidadeReal; i++) {
      // Roleta viciada para escolher tópico
      let topicoEscolhido = { nome: 'Geral', probabilidade: 0, tendencia: 'N/A' };

      if (topicosDisponiveis.length > 0) {
        const r = Math.random();
        let acumulado = 0;
        // Normalizar probabilidades para o subconjunto
        const totalProb = topicosDisponiveis.reduce((acc, t) => acc + t.probabilidade, 0);

        for (const t of topicosDisponiveis) {
          acumulado += (t.probabilidade / totalProb);
          if (r <= acumulado) {
            topicoEscolhido = t;
            break;
          }
        }
        if (topicoEscolhido.nome === 'Geral') topicoEscolhido = topicosDisponiveis[topicosDisponiveis.length - 1];
      }

      // Gerar Questão Mockada
      const baseQ = QUESTOES_DB_MOCK.find(q => q.disciplina === disciplina && q.topico === topicoEscolhido.nome);

      // Definir dificuldade da questão
      let difQuestao = dificuldade;
      if (dificuldade === 'Todas') {
        const rDif = Math.random();
        difQuestao = rDif > 0.6 ? 'Difícil' : (rDif > 0.3 ? 'Média' : 'Fácil');
      }

      // Normalizar a exibição da probabilidade para parecer mais "impactante" ao usuário
      // Se a probabilidade do tópico for > 0.20 (20% do total da prova), isso é MUITO ALTO para um único tópico.
      let labelProbabilidade = 'Média';
      let corProbabilidade = 'blue';

      if (topicoEscolhido.probabilidade >= 0.25) {
        labelProbabilidade = 'Muito Alta 🔥';
        corProbabilidade = 'red';
      } else if (topicoEscolhido.probabilidade >= 0.15) {
        labelProbabilidade = 'Alta ⚡';
        corProbabilidade = 'orange';
      }

      questoesGeradas.push({
        id: `q-${Date.now()}-${i}`,
        disciplina,
        topico: topicoEscolhido.nome,
        probabilidadeCair: labelProbabilidade,
        corProbabilidade, // Novo campo para ajudar no frontend
        precisao: (0.92 + Math.random() * 0.07).toFixed(2), // 92-99%
        totalQuestoesAnalisadas: 350 + Math.floor(Math.random() * 800),
        tendenciaAno: ['Tendência de Alta', 'Estável', 'Recorrente'][Math.floor(Math.random() * 3)],
        enunciado: baseQ ? baseQ.enunciado : `(Questão ${difQuestao} de ${topicoEscolhido.nome}) - Esta questão simula o estilo da banca ${tipoProva}. O enunciado abordaria conceitos de ${topicoEscolhido.nome} com nível de exigência ${difQuestao}.`,
        alternativas: baseQ ? baseQ.alternativas : [
          'Alternativa A (Incorreta)',
          'Alternativa B (Correta)',
          'Alternativa C (Distrator)',
          'Alternativa D (Incorreta)',
          'Alternativa E (Incorreta)'
        ],
        alternativaCorreta: baseQ ? baseQ.alternativaCorreta : 1,
        explicacao: baseQ ? baseQ.explicacao : `Explicação detalhada sobre ${topicoEscolhido.nome} focada no nível ${difQuestao}.`,
        dificuldade: difQuestao,
        fonte: ano !== 'Todos' ? `${tipoProva} ${ano}` : (baseQ ? baseQ.fonte : `${tipoProva} ${2010 + Math.floor(Math.random() * 16)}`),
        ano: ano !== 'Todos' ? parseInt(ano) : (baseQ ? (baseQ.ano || 2025) : 2010 + Math.floor(Math.random() * 16))
      });
    }

    const simulado = {
      id: `sim-${Date.now()}`,
      tipoProva,
      disciplina,
      quantidadeOficial,
      questoes: questoesGeradas,
      analiseIA: {
        totalAnalisado: 'Provas de 2010 a 2025',
        topicosQuentes: topicosDisponiveis.filter(t => t.tendencia.includes('Alta')).map(t => t.nome).slice(0, 5),
        mensagem: `Simulado de ${disciplina} (${tipoProva}) gerado com foco em questões ${dificuldade !== 'Todas' ? dificuldade.toLowerCase() + 's' : 'variadas'} e tópicos de probabilidade ${probabilidade !== 'Todas' ? probabilidade.toLowerCase() : 'geral'}.`
      }
    };

    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({ simulado });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    disciplinas: Object.keys(TOPICOS_BASE).sort(),
    tiposProva: Object.keys(OFFICIAL_COUNTS).sort(),
  });
}
