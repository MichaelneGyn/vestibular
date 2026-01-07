import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { simuladoId, tipoProva = 'ENEM', respostas } = body;

    if (!respostas || respostas.length === 0) {
      return NextResponse.json({ error: 'Respostas são obrigatórias' }, { status: 400 });
    }

    const acertos = Math.floor(respostas.length * 0.7);
    const erros = respostas.length - acertos;
    const score = Math.floor((acertos / respostas.length) * 1000);

    const classificacao = score >= 800
      ? 'EXCELENTE - Pronto para grandes provas!'
      : score >= 600
        ? 'MUITO BOM - Ótimo preparo!'
        : score >= 400
          ? 'BOM - Continue estudando!'
          : 'PRECISA MELHORAR - Não desista!';

    const resultado = {
      id: `res-${Date.now()}`,
      simuladoId,
      tipoProva,
      totalQuestoes: respostas.length,
      acertos,
      erros,
      score,
      porcentagem: (acertos / respostas.length) * 100,
      classificacao,
    };

    return NextResponse.json({ resultado });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro ao processar respostas', details: error.message }, { status: 500 });
  }
}
