import { Simulador } from "@/components/Simulador";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center py-20 px-4 relative overflow-hidden">

      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-zinc-200/50 to-transparent rounded-full blur-3xl opacity-50" />
      </div>

      <div className="w-full max-w-6xl mx-auto space-y-12 z-10">

        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-600 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-500"></span>
            </span>
            IA Preditiva v2.0 Ativada
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-zinc-900 bg-clip-text text-transparent bg-gradient-to-b from-zinc-900 to-zinc-600 pb-2">
            Simulador Vestibular
          </h1>

          <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto font-light leading-relaxed">
            Domine o ENEM e vestibulares com nossa inteligência artificial que analisa
            <span className="font-semibold text-zinc-900 mx-1">15 anos de histórico</span>
            para prever o que vai cair na sua prova.
          </p>
        </div>

        {/* Simulator Component */}
        <Simulador />

      </div>

      {/* Footer */}
      <footer className="mt-20 text-center text-sm text-zinc-400 font-light">
        <p>© 2026 Simulador Vestibular AI. Todos os direitos reservados.</p>
      </footer>
    </main>
  );
}