import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { ChevronRight, ArrowLeft, Loader2, Play } from "lucide-react";
import db from "../db/database";
import { useGameStore } from "../store/gameStore";

export default function NewGame() {
  const navigate = useNavigate();
  const setSave = useGameStore(state => state.setSave);
  
  const [step, setStep] = useState(1);
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [managerName, setManagerName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const leagues = useLiveQuery(() => db.leagues.toArray());
  const teams = useLiveQuery(() => 
    selectedLeague ? db.teams.where({ leagueId: selectedLeague }).toArray() : []
  , [selectedLeague]);

  const handleStartGame = async () => {
    if (!selectedTeam || !managerName) return;
    setIsGenerating(true);

    try {
      const team = await db.teams.get(selectedTeam);
      
      const saveId = await db.saves.add({
        name: `${team?.name} Era`,
        managerName,
        currentTeamId: selectedTeam,
        currentDate: new Date('2024-07-01').toISOString(),
      });

      setSave(saveId as number, new Date('2024-07-01').toISOString());
      navigate("/dashboard");

    } catch (error) {
      console.error(error);
      alert("Erro ao criar o jogo.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-teal-700 p-6 flex items-center justify-between text-white relative z-10 shadow-md">
          <div className="flex items-center gap-4">
            {step > 1 ? (
              <button 
                onClick={() => setStep(step - 1)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-teal-100 hover:text-white hover:bg-teal-600 transition"
              >
                <ArrowLeft size={20} />
              </button>
            ) : (
               <button 
                onClick={() => navigate('/')}
                className="w-10 h-10 rounded-full flex items-center justify-center text-teal-100 hover:text-white hover:bg-teal-600 transition"
               >
                 <ArrowLeft size={20} />
               </button>
            )}
            <div>
              <h2 className="text-2xl font-bold tracking-tight uppercase">NOVO JOGO</h2>
              <div className="text-teal-200 text-xs font-bold tracking-widest uppercase mt-1">PASSO {step} DE 3</div>
            </div>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-2 rounded-full transition-all duration-500 bg-white ${s === step ? 'w-12 opacity-100' : s < step ? 'w-4 opacity-50' : 'w-4 opacity-20'}`} />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 relative z-10 min-h-[400px] bg-slate-50">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 text-center">Selecione a Liga Alvo</h3>
              
              <div className="mb-8">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-4 border-b border-slate-200 pb-2">Ligas Nacionais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leagues?.filter(l => !l.type || l.type === 'league').map(league => (
                    <button
                      key={league.id}
                      onClick={() => { setSelectedLeague(league.id!); setStep(2); }}
                      className="group bg-white border border-slate-200 hover:border-teal-500 p-4 rounded-xl flex items-center justify-between transition-all hover:shadow-md text-left"
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center bg-slate-50 overflow-hidden shrink-0">
                          {league.logo ? <img src={league.logo} className="object-cover w-full h-full" alt="logo" /> : <div className="text-slate-400 font-bold text-xs">LG</div>}
                        </div>
                        <div>
                          <div className="font-bold text-lg text-slate-800 tracking-tight">{league.name}</div>
                          <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{league.country} • DIV {league.level}</div>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-teal-600 group-hover:text-white transition shrink-0">
                        <ChevronRight size={18} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {leagues?.some(l => l.type === 'competition') && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-4 border-b border-slate-200 pb-2">Competições / Copas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {leagues?.filter(l => l.type === 'competition').map(league => (
                      <button
                        key={league.id}
                        onClick={() => { setSelectedLeague(league.id!); setStep(2); }}
                        className="group bg-white border border-slate-200 hover:border-teal-500 p-4 rounded-xl flex items-center justify-between transition-all hover:shadow-md text-left"
                      >
                        <div className="flex items-center gap-4 text-left">
                          <div className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center bg-slate-50 overflow-hidden shrink-0">
                            {league.logo ? <img src={league.logo} className="object-cover w-full h-full" alt="logo" /> : <div className="text-slate-400 font-bold text-xs">LG</div>}
                          </div>
                          <div>
                            <div className="font-bold text-lg text-slate-800 tracking-tight">{league.name}</div>
                            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{league.country}</div>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-teal-600 group-hover:text-white transition shrink-0">
                          <ChevronRight size={18} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 text-center">Assine o Contrato com Seu Clube</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                {teams?.map(team => (
                  <button
                    key={team.id}
                    onClick={() => { setSelectedTeam(team.id!); setStep(3); }}
                    className="group bg-white border border-slate-200 hover:border-teal-500 p-4 rounded-xl flex items-center gap-4 transition-all hover:shadow-md text-left relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-2 opacity-80" style={{ backgroundColor: team.color }}></div>
                    
                    <img src={team.logo} alt={team.name} className="w-14 h-14 rounded-full border shadow-sm bg-white object-cover ml-2" />
                    
                    <div className="flex-1">
                      <div className="font-bold text-slate-800 text-lg tracking-tight leading-tight truncate">{team.name}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1 mb-2">Caixa: ${(team.money / 1000000).toFixed(1)}M</div>
                      
                      <div className="flex gap-2">
                        <div className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-500 font-bold flex items-center gap-1">
                           <span className="text-slate-700">{team.overallForce}</span> GER
                        </div>
                        <div className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-500 font-bold flex items-center gap-1">
                           <span className="text-slate-700">{team.reputation}</span> REP
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-300 max-w-md mx-auto mt-8">
              
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
                <img src={teams?.find(t => t.id === selectedTeam)?.logo} alt="Logo" className="w-20 h-20 rounded-full border shadow-md object-cover mx-auto mb-4" />
                <h4 className="font-bold text-slate-800 text-2xl leading-tight mb-6">{teams?.find(t => t.id === selectedTeam)?.name}</h4>

                <div className="space-y-6 text-left">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-2 tracking-widest pl-1">Nome do Treinador</label>
                    <input 
                      type="text" 
                      value={managerName}
                      onChange={e => setManagerName(e.target.value)}
                      placeholder="Seu Nome"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition uppercase"
                      autoFocus
                    />
                  </div>

                  <button 
                    onClick={handleStartGame}
                    disabled={!managerName || isGenerating}
                    className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-widest py-4 px-6 rounded-xl transition flex items-center justify-center gap-2 mt-4 shadow-md"
                  >
                    {isGenerating ? (
                       <><Loader2 className="animate-spin" /> CRIANDO SAVE...</>
                    ) : (
                       <><Play size={18} fill="currentColor" /> ASSINAR CONTRATO</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #94a3b8; }
      `}</style>
    </div>
  );
}
