import { Link } from "react-router-dom";
import { ArrowLeft, Save, Sliders, Database, Gamepad2 } from "lucide-react";

export default function Settings() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden">
      
      {/* Top Navbar */}
      <div className="bg-teal-700 text-white flex items-center gap-4 px-4 py-4 shadow-md sticky top-0 z-10">
         <Link to="/" className="text-white hover:text-teal-200 transition">
           <ArrowLeft size={24} />
         </Link>
         <h1 className="text-xl font-bold tracking-tight">Configurações</h1>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-8 pb-32">
          
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-teal-700 flex items-center gap-2 uppercase tracking-tight">
             <Gamepad2 size={18} /> Simulação
          </h3>
          
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="font-bold text-slate-700 mb-1 text-sm">Velocidade Padrão</span>
              <select className="bg-white border text-sm border-slate-300 rounded-lg px-3 py-2.5 text-slate-700 font-medium focus:outline-none focus:border-teal-500 transition shadow-sm appearance-none">
                <option>Normal (Tempo real Mapeado)</option>
                <option>Rápido</option>
                <option>Instantâneo (Resultado Imediato)</option>
              </select>
            </div>

            <div className="flex flex-col">
              <span className="font-bold text-slate-700 mb-1 text-sm">Dificuldade da Carreira</span>
              <select className="bg-white border text-sm border-slate-300 rounded-lg px-3 py-2.5 text-slate-700 font-medium focus:outline-none focus:border-teal-500 transition shadow-sm appearance-none">
                <option>Amador</option>
                <option>Profissional</option>
                <option>World Class</option>
                <option>Lenda (Modo Hardcore)</option>
              </select>
            </div>
            
            <div className="flex flex-col">
              <span className="font-bold text-slate-700 mb-1 text-sm">Moeda do Jogo</span>
              <select className="bg-white border text-sm border-slate-300 rounded-lg px-3 py-2.5 text-slate-700 font-medium focus:outline-none focus:border-teal-500 transition shadow-sm appearance-none">
                <option>Dólar ($)</option>
                <option>Euro (€)</option>
                <option>Real (R$)</option>
                <option>Libra (£)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-teal-700 flex items-center gap-2 uppercase tracking-tight">
             <Database size={18} /> Mecânicas de Jogo
          </h3>
          
          <div className="space-y-3">
            <label className="flex items-center gap-4 p-4 bg-white border border-slate-200 shadow-sm rounded-xl cursor-pointer hover:border-teal-500 transition group">
              <div className="relative flex items-center justify-center">
                <input type="checkbox" defaultChecked className="peer sr-only" />
                <div className="w-5 h-5 bg-slate-100 border-2 border-slate-300 rounded peer-checked:bg-teal-600 peer-checked:border-teal-600 transition"></div>
                <div className="absolute opacity-0 peer-checked:opacity-100 text-white pointer-events-none">
                   <svg width="12" height="9" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                   </svg>
                </div>
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-800 group-hover:text-teal-700 transition text-sm">Lesões e Fadiga</div>
                <div className="text-xs text-slate-500 mt-0.5 leading-tight">Atletas sofrem fadiga e lesões durante partidas e rotina de treinos.</div>
              </div>
            </label>

            <label className="flex items-center gap-4 p-4 bg-white border border-slate-200 shadow-sm rounded-xl cursor-pointer hover:border-teal-500 transition group">
              <div className="relative flex items-center justify-center">
                <input type="checkbox" defaultChecked className="peer sr-only" />
                <div className="w-5 h-5 bg-slate-100 border-2 border-slate-300 rounded peer-checked:bg-teal-600 peer-checked:border-teal-600 transition"></div>
                <div className="absolute opacity-0 peer-checked:opacity-100 text-white pointer-events-none">
                   <svg width="12" height="9" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                   </svg>
                </div>
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-800 group-hover:text-teal-700 transition text-sm">Mercado IA Dinâmico</div>
                <div className="text-xs text-slate-500 mt-0.5 leading-tight">Clubes rivais negociam jogadores independentemente.</div>
              </div>
            </label>
          </div>
        </div>

      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-end z-20">
         <Link to="/" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg">
           <Save size={18} /> Salvar e Voltar
         </Link>
      </div>

       <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
      `}</style>
    </div>
  );
}
