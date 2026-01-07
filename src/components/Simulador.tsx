'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2, XCircle, BrainCircuit, TrendingUp, History, Filter, Sparkles, ChevronRight, BarChart3, GraduationCap } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"

interface Questao {
    id: string
    enunciado: string
    alternativas: string[]
    alternativaCorreta: number
    explicacao: string
    dificuldade: string
    fonte: string
    ano: number
    topico?: string
    probabilidadeCair?: string
    precisao?: string
    totalQuestoesAnalisadas?: number
    tendenciaAno?: string
}

interface SimuladoOptions {
    disciplinas: string[]
    tiposProva: string[]
}

export function Simulador() {
    const [options, setOptions] = useState<SimuladoOptions>({ disciplines: [], tiposProva: [] } as any)
    const [loadingOptions, setLoadingOptions] = useState(true)

    const [config, setConfig] = useState({
        disciplina: '',
        tipoProva: '',
        dificuldade: 'Todas',
        probabilidade: 'Todas',
        modo: 'padrao'
    })

    const [loadingSimulado, setLoadingSimulado] = useState(false)
    const [questoes, setQuestoes] = useState<Questao[]>([])
    const [analiseIA, setAnaliseIA] = useState<any>(null)
    const [respostas, setRespostas] = useState<Record<string, number>>({})
    const [showResult, setShowResult] = useState(false)
    const [showReportModal, setShowReportModal] = useState(false)

    // Dicas de Ouro (Macetes) por Matéria
    const DICAS_POR_MATERIA: Record<string, string> = {
        'Matemática': "Em Análise Combinatória, sempre se pergunte: 'A ordem importa?'. Se SIM = Arranjo (Pódio). Se NÃO = Combinação (Salada de Frutas). Na dúvida, desenhe as possibilidades!",
        'Física': "Sempre converta as unidades para o Sistema Internacional (SI) antes de jogar na fórmula. Km/h ÷ 3,6 = m/s. Atenção: 'Partiu do repouso' significa V0 = 0.",
        'Química': "PH + POH = 14. Se o PH é baixo (<7), é Ácido. Se é alto (>7), é Básico. Lembra: 'Ácido' começa com A, de 'Azedo' (como limão).",
        'Biologia': "O 'Dogma Central': DNA → RNA → Proteína. Mitocôndria = Energia (Respiração). Cloroplasto = Fotossíntese. Ribossomo = Proteína. Lisossomo = Digestão.",
        'História': "Era Vargas (1930-45): Industrialização + Leis Trabalhistas (CLT) + Propaganda. Ditadura (1964-85): Milagre Econômico + Censura + Bipartidarismo.",
        'Geografia': "Urbanização brasileira foi rápida e desordenada (macrocefalia urbana). El Niño = Aquecimento do Pacífico (Seca no Norte/NE, Chuva no Sul).",
        'Língua Portuguesa': "Crase: Troque a palavra feminina por uma masculina. Se der 'ao', tem crase. Ex: 'Vou à praia' (Vou ao clube).",
        'Inglês': "Falsos Cognatos: 'Pretend' não é pretender (é fingir). 'Intend' é pretender. 'Push' é empurrar, não puxar (pull).",
        'Espanhol': "'Embarazada' não é embaraçada, é Grávida! 'Exquisito' não é estranho, é Delicioso. Cuidado com o portunhol.",
        'Filosofia': "Sócrates: 'Só sei que nada sei' (Maiêutica). Platão: Mundo das Ideias (Mito da Caverna). Aristóteles: Ética do Meio-Termo (Virtude).",
        'Sociologia': "Durkheim: Fato Social (Coercitivo, Exterior, Geral). Marx: Luta de Classes (Burguesia x Proletariado). Weber: Ação Social."
    }

    useEffect(() => {
        fetch('/api/gerar-simulado')
            .then(res => res.json())
            .then(data => {
                setOptions(data)
                setLoadingOptions(false)
                if (data.disciplinas?.length) setConfig(prev => ({ ...prev, disciplina: data.disciplinas[0] }))
                if (data.tiposProva?.length) setConfig(prev => ({ ...prev, tipoProva: data.tiposProva[0] }))
            })
            .catch(err => {
                console.error("Erro ao carregar opções", err)
                setLoadingOptions(false)
            })
    }, [])

    const gerarSimulado = async (overrideConfig?: Partial<typeof config>) => {
        const activeConfig = { ...config, ...overrideConfig }
        setLoadingSimulado(true)
        setQuestoes([])
        setAnaliseIA(null)
        setRespostas({})
        setShowResult(false)
        setShowReportModal(false)

        try {
            const res = await fetch('/api/gerar-simulado', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    disciplina: activeConfig.disciplina,
                    tipoProva: activeConfig.tipoProva,
                    dificuldade: activeConfig.dificuldade,
                    probabilidade: activeConfig.probabilidade,
                    modo: activeConfig.modo
                })
            })

            const data = await res.json()
            if (data.simulado && data.simulado.questoes) {
                setQuestoes(data.simulado.questoes)
                setAnaliseIA(data.simulado.analiseIA)
                if (overrideConfig) {
                    toast.success("Modo 'O Que Mais Cai' ativado com sucesso!")
                }
            } else {
                toast.error("Não foi possível gerar o simulado.")
            }
        } catch (error) {
            console.error(error)
            toast.error("Erro ao conectar com o servidor.")
        } finally {
            setLoadingSimulado(false)
        }
    }

    const handleTrendMode = () => {
        const trendConfig = { dificuldade: 'Difícil', probabilidade: 'Alta' }
        setConfig(prev => ({ ...prev, ...trendConfig }))
        gerarSimulado(trendConfig)
    }

    const handleResposta = (questaoId: string, alternativaIndex: number) => {
        if (showResult) return
        setRespostas(prev => ({ ...prev, [questaoId]: alternativaIndex }))
    }

    const finalizarSimulado = () => {
        setShowResult(true)
        setShowReportModal(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const calcularAcertos = () => {
        let acertos = 0
        questoes.forEach(q => {
            if (respostas[q.id] === q.alternativaCorreta) acertos++
        })
        return acertos
    }

    if (loadingOptions) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-zinc-900" />
                <p className="text-zinc-500 font-light animate-pulse">Carregando sistema...</p>
            </div>
        )
    }

    return (
        <div className="w-full space-y-12">

            {/* Configuração Card - Glassmorphism */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <div className="relative group">
                    {/* Glow Effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-zinc-200 to-zinc-100 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>

                    <Card className="relative border-0 bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden ring-1 ring-zinc-900/5">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-900" />

                        <CardContent className="p-8 md:p-10 grid gap-8">
                            <div className="flex items-center justify-between border-b border-zinc-100 pb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                                        <GraduationCap className="h-6 w-6" />
                                        Configuração
                                    </h2>
                                    <p className="text-zinc-500 mt-1">Defina os parâmetros para a IA gerar sua prova.</p>
                                </div>
                                <div className="hidden md:flex items-center gap-2 text-xs font-medium px-3 py-1 bg-zinc-100 rounded-full text-zinc-600">
                                    <Sparkles className="h-3 w-3" />
                                    AI Powered
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <div className="space-y-2 group/input">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-400 group-hover/input:text-zinc-900 transition-colors">Disciplina</Label>
                                    <Select
                                        value={config.disciplina}
                                        onValueChange={(v) => setConfig(prev => ({ ...prev, disciplina: v }))}
                                    >
                                        <SelectTrigger className="h-12 bg-zinc-50/50 border-zinc-200 focus:ring-2 focus:ring-zinc-900/10 transition-all hover:bg-zinc-50">
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {options.disciplinas?.map(d => (
                                                <SelectItem key={d} value={d}>{d}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2 group/input">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-400 group-hover/input:text-zinc-900 transition-colors">Banca</Label>
                                    <Select
                                        value={config.tipoProva}
                                        onValueChange={(v) => setConfig(prev => ({ ...prev, tipoProva: v }))}
                                    >
                                        <SelectTrigger className="h-12 bg-zinc-50/50 border-zinc-200 focus:ring-2 focus:ring-zinc-900/10 transition-all hover:bg-zinc-50">
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {options.tiposProva?.map(t => (
                                                <SelectItem key={t} value={t}>{t}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2 group/input">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-400 group-hover/input:text-zinc-900 transition-colors">Dificuldade</Label>
                                    <Select
                                        value={config.dificuldade}
                                        onValueChange={(v) => setConfig(prev => ({ ...prev, dificuldade: v }))}
                                    >
                                        <SelectTrigger className="h-12 bg-zinc-50/50 border-zinc-200 focus:ring-2 focus:ring-zinc-900/10 transition-all hover:bg-zinc-50">
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Todas">Todas</SelectItem>
                                            <SelectItem value="Fácil">Fácil</SelectItem>
                                            <SelectItem value="Média">Média</SelectItem>
                                            <SelectItem value="Difícil">Difícil</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2 group/input">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-400 group-hover/input:text-zinc-900 transition-colors">Probabilidade</Label>
                                    <Select
                                        value={config.probabilidade}
                                        onValueChange={(v) => setConfig(prev => ({ ...prev, probabilidade: v }))}
                                    >
                                        <SelectTrigger className="h-12 bg-zinc-50/50 border-zinc-200 focus:ring-2 focus:ring-zinc-900/10 transition-all hover:bg-zinc-50">
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Todas">Todas</SelectItem>
                                            <SelectItem value="Alta">Alta Probabilidade</SelectItem>
                                            <SelectItem value="Média">Média Probabilidade</SelectItem>
                                            <SelectItem value="Baixa">Baixa Probabilidade</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4">
                                <div className="flex flex-col gap-2 w-full md:w-auto">
                                    <Button
                                        variant="outline"
                                        onClick={handleTrendMode}
                                        className="w-full border-red-200 hover:bg-red-50 text-red-700 hover:text-red-800 transition-colors justify-start"
                                    >
                                        <TrendingUp className="mr-2 h-4 w-4" />
                                        Modo: O Que Mais Cai 🔥
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => gerarSimulado({ modo: 'maratona', probabilidade: 'Alta' })}
                                        className="w-full border-blue-200 hover:bg-blue-50 text-blue-700 hover:text-blue-800 transition-colors justify-start"
                                    >
                                        <History className="mr-2 h-4 w-4" />
                                        Maratona 100 Questões ⚡
                                    </Button>
                                </div>

                                <Button
                                    onClick={() => gerarSimulado()}
                                    disabled={loadingSimulado}
                                    className="relative overflow-hidden bg-zinc-900 hover:bg-zinc-800 text-white px-8 h-14 text-base font-medium rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-zinc-900/20 w-full md:w-auto group"
                                >
                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    {loadingSimulado ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Processando Dados...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <BrainCircuit className="h-5 w-5" />
                                            Gerar Simulado Agora
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>

            {/* Análise da IA - Dark Mode Card */}
            <AnimatePresence>
                {analiseIA && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-zinc-900 rounded-2xl p-1 shadow-2xl ring-1 ring-white/10">
                            <div className="bg-zinc-950/50 rounded-xl p-8 border border-white/5 backdrop-blur-md">
                                <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-500/10 rounded-lg">
                                                <TrendingUp className="h-5 w-5 text-green-500" />
                                            </div>
                                            <span className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Análise Preditiva</span>
                                        </div>
                                        <p className="text-xl md:text-2xl font-light leading-relaxed text-zinc-100">
                                            {analiseIA.mensagem}
                                        </p>
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {analiseIA.topicosQuentes.map((t: string) => (
                                                <Badge key={t} variant="outline" className="border-zinc-700 text-zinc-300 bg-zinc-800/50 px-3 py-1.5 text-sm font-normal hover:bg-zinc-800 transition-colors">
                                                    {t}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right hidden md:block border-l border-zinc-800 pl-8">
                                        <div className="flex flex-col items-end gap-1">
                                            <BarChart3 className="h-5 w-5 text-zinc-500 mb-2" />
                                            <p className="text-zinc-500 text-xs uppercase tracking-wider">Base de Dados</p>
                                            <p className="text-3xl font-bold text-white tracking-tight">{analiseIA.totalAnalisado}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Lista de Questões */}
            {questoes.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-8"
                >
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-3xl font-light tracking-tight text-zinc-900 flex items-center gap-3">
                            <span className="w-8 h-[1px] bg-zinc-300 block" />
                            Questões
                        </h2>
                        {showResult && (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-lg font-medium text-white bg-zinc-900 px-6 py-2 rounded-full shadow-lg"
                            >
                                Resultado: {calcularAcertos()} / {questoes.length}
                            </motion.div>
                        )}
                    </div>

                    <div className="grid gap-8">
                        {questoes.map((q, index) => {
                            const isCorrect = respostas[q.id] === q.alternativaCorreta
                            const isSelected = respostas[q.id] !== undefined

                            let cardStyle = "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm hover:shadow-xl transition-all duration-300"
                            if (showResult) {
                                if (isCorrect) cardStyle = "bg-green-50/50 border-green-200 shadow-none"
                                else if (isSelected) cardStyle = "bg-red-50/50 border-red-200 shadow-none"
                                else cardStyle = "bg-zinc-50/50 border-zinc-200 opacity-60"
                            }

                            return (
                                <motion.div
                                    key={q.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, type: "spring", stiffness: 50 }}
                                >
                                    <Card className={`border-0 ring-1 ring-inset ${showResult ? (isCorrect ? 'ring-green-200' : (isSelected ? 'ring-red-200' : 'ring-zinc-200')) : 'ring-zinc-200'} ${cardStyle} overflow-hidden rounded-2xl`}>
                                        <CardContent className="p-8">
                                            <div className="flex justify-between items-start gap-4 mb-6">
                                                <div className="space-y-4 w-full">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 border-0 font-medium px-3 py-1">
                                                            {q.topico}
                                                        </Badge>
                                                        {q.probabilidadeCair && (
                                                            <Badge className={`border-0 font-medium px-3 py-1 shadow-sm ${q.probabilidadeCair.includes('Muito Alta') ? 'bg-red-600 text-white' :
                                                                q.probabilidadeCair.includes('Alta') ? 'bg-orange-500 text-white' :
                                                                    'bg-blue-600 text-white'
                                                                }`}>
                                                                {q.probabilidadeCair}
                                                            </Badge>
                                                        )}
                                                        <Badge variant="outline" className="text-zinc-400 border-zinc-200 font-normal gap-1">
                                                            <BarChart3 className="h-3 w-3" />
                                                            Precisão: {Number(q.precisao) * 100}%
                                                        </Badge>
                                                        <Badge variant="outline" className="text-zinc-400 border-zinc-200 font-normal gap-1">
                                                            <History className="h-3 w-3" />
                                                            Base: {q.totalQuestoesAnalisadas} questões
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
                                                            <span>Questão {index + 1}</span>
                                                            <span className="text-blue-300 font-light">|</span>
                                                            <span className="text-zinc-500 font-medium text-sm uppercase tracking-wide">({q.fonte})</span>
                                                        </div>
                                                        <h3 className="text-xl font-medium leading-relaxed text-zinc-800">
                                                            {q.enunciado}
                                                        </h3>
                                                    </div>
                                                </div>
                                            </div>

                                            <RadioGroup
                                                value={respostas[q.id]?.toString()}
                                                onValueChange={(val) => handleResposta(q.id, parseInt(val))}
                                                disabled={showResult}
                                                className="space-y-3"
                                            >
                                                {q.alternativas.map((alt, idx) => {
                                                    let itemClass = "relative flex items-center space-x-4 p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer group overflow-hidden"

                                                    if (showResult) {
                                                        if (idx === q.alternativaCorreta) itemClass += " bg-green-50 border-green-500 text-green-900"
                                                        else if (respostas[q.id] === idx && idx !== q.alternativaCorreta) itemClass += " bg-red-50 border-red-500 text-red-900"
                                                        else itemClass += " border-transparent opacity-50 bg-zinc-50"
                                                    } else {
                                                        if (respostas[q.id] === idx) itemClass += " bg-zinc-50 border-zinc-900 text-zinc-900 shadow-md transform scale-[1.01]"
                                                        else itemClass += " bg-white border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-600"
                                                    }

                                                    return (
                                                        <motion.div key={idx} whileTap={{ scale: 0.98 }}>
                                                            <Label
                                                                htmlFor={`q${q.id}-opt${idx}`}
                                                                className={itemClass}
                                                            >
                                                                <RadioGroupItem value={idx.toString()} id={`q${q.id}-opt${idx}`} className="sr-only" />

                                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${respostas[q.id] === idx
                                                                    ? (showResult ? (idx === q.alternativaCorreta ? "border-green-600 bg-green-600" : "border-red-600 bg-red-600") : "border-zinc-900 bg-zinc-900")
                                                                    : "border-zinc-300 group-hover:border-zinc-400"
                                                                    }`}>
                                                                    {respostas[q.id] === idx && <div className="w-2 h-2 rounded-full bg-white" />}
                                                                </div>

                                                                <span className="text-base font-normal">{alt}</span>
                                                            </Label>
                                                        </motion.div>
                                                    )
                                                })}
                                            </RadioGroup>

                                            <AnimatePresence>
                                                {showResult && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                        animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                                                        className="bg-zinc-900 rounded-xl p-6 text-zinc-100 shadow-lg"
                                                    >
                                                        <p className="font-semibold mb-2 flex items-center gap-2 text-white">
                                                            {isCorrect ? <CheckCircle2 className="text-green-400 h-5 w-5" /> : <XCircle className="text-red-400 h-5 w-5" />}
                                                            Explicação
                                                        </p>
                                                        <p className="text-zinc-300 leading-relaxed font-light">{q.explicacao}</p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )
                        })}
                    </div>

                    {!showResult && (
                        <div className="flex justify-end pt-12">
                            <Button
                                size="lg"
                                onClick={finalizarSimulado}
                                className="bg-zinc-900 hover:bg-zinc-800 text-white px-12 h-16 text-lg rounded-full shadow-2xl shadow-zinc-900/30 transition-all hover:scale-105 active:scale-95 group"
                            >
                                Finalizar Simulado
                                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    )}
                </motion.div>
            )}
            {/* Resultado e Análise de Desempenho */}
            <AnimatePresence>
                {showReportModal && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ y: 50 }}
                            animate={{ y: 0 }}
                            className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8 relative"
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900"
                                onClick={() => setShowReportModal(false)}
                            >
                                <XCircle className="h-6 w-6" />
                            </Button>

                            <div className="text-center space-y-6">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-4 animate-bounce">
                                    <Sparkles className="h-10 w-10" />
                                </div>

                                <div>
                                    <h2 className="text-3xl font-bold text-zinc-900">Simulado Finalizado!</h2>
                                    <p className="text-zinc-500 mt-2">Aqui está a análise da nossa IA sobre seu desempenho.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                                        <div className="text-4xl font-bold text-zinc-900 mb-1">{calcularAcertos()} / {questoes.length}</div>
                                        <div className="text-sm text-zinc-500 font-medium uppercase tracking-wider">Acertos</div>
                                    </div>
                                    <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                                        <div className={`text-4xl font-bold mb-1 ${(calcularAcertos() / questoes.length) >= 0.7 ? 'text-green-600' :
                                            (calcularAcertos() / questoes.length) >= 0.5 ? 'text-orange-500' : 'text-red-500'
                                            }`}>
                                            {Math.round((calcularAcertos() / questoes.length) * 100)}%
                                        </div>
                                        <div className="text-sm text-zinc-500 font-medium uppercase tracking-wider">Aproveitamento</div>
                                    </div>
                                </div>

                                <div className="bg-zinc-900 text-white p-6 rounded-2xl text-left space-y-4 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                                    <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-wider text-xs">
                                        <BrainCircuit className="h-4 w-4" />
                                        Análise de Inteligência Artificial
                                    </div>

                                    <div className="space-y-2">
                                        <p className="font-medium text-lg">
                                            {(calcularAcertos() / questoes.length) >= 0.8 ? "Excelente! Você domina este conteúdo." :
                                                (calcularAcertos() / questoes.length) >= 0.5 ? "Bom trabalho, mas há espaço para evoluir." :
                                                    "Atenção! Este tópico precisa de revisão urgente."}
                                        </p>
                                        <p className="text-zinc-400 text-sm leading-relaxed">
                                            {(calcularAcertos() / questoes.length) >= 0.8 ?
                                                "Sua precisão indica que você está pronto para questões de nível Difícil. Tente o 'Modo Maratona' para testar sua resistência." :
                                                (calcularAcertos() / questoes.length) >= 0.5 ?
                                                    "Você acertou a base, mas deslizou em detalhes específicos. Revise os conceitos fundamentais antes de avançar." :
                                                    "Recomendamos focar na teoria básica antes de tentar novos simulados. Use a explicação das questões erradas como roteiro de estudo."}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-white/10">
                                        <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm mb-2">
                                            <Sparkles className="h-4 w-4" />
                                            Dica de Ouro (Macete)
                                        </div>
                                        <p className="text-zinc-300 text-sm italic">
                                            "{DICAS_POR_MATERIA[config.disciplina] || 'Revise os conceitos fundamentais e pratique com mais questões desta matéria.'}"
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => setShowReportModal(false)}
                                    className="w-full h-14 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors"
                                >
                                    Revisar Questões
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
