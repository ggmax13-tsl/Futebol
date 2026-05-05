import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import { Home, Calendar, Play, FastForward, CheckCircle2, ChevronRight, Activity, Users } from "lucide-react";
import db, { Team, Player } from "../db/database";
import { simulateMatch, MatchEvent } from "../lib/matchSimulation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type MatchState = 'PREMATCH' | 'PLAYING' | 'POSTMATCH';

export default function MatchScreen() {
  const navigate = useNavigate();
  const { currentSaveId, currentDate, advanceDate } = useGameStore();
  
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [oppTeam, setOppTeam] = useState<Team | null>(null);
  
  const [myPlayers, setMyPlayers] = useState<string[]>([]);
  const [oppPlayers, setOppPlayers] = useState<string[]>([]);

  const [matchState, setMatchState] = useState<MatchState>('PREMATCH');
  const [minute, setMinute] = useState(0);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [visibleEvents, setVisibleEvents] = useState<MatchEvent[]>([]);
  const [speed, setSpeed] = useState(300); // ms per minute

  const [activeTab, setActiveTab] = useState<'partida'|'eventos'|'estatisticas'|'escalacao'>('partida');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const eventsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentSaveId) {
      navigate("/");
      return;
    }

    async function loadData() {
      const save = await db.saves.get(currentSaveId!);
      if (!save || !save.currentTeamId) {
        navigate("/");
        return;
      }

      const mTeam = await db.teams.get(save.currentTeamId);
      if (!mTeam) return;
      setMyTeam(mTeam);

      const mPlayers = await db.players.where({ teamId: mTeam.id }).toArray();
      setMyPlayers(mPlayers.length > 0 ? mPlayers.map(p => p.name) : ["Jogador " + mTeam.name]);

      const allTeams = await db.teams.where({ leagueId: mTeam.leagueId }).toArray();
      const opponents = allTeams.filter(t => t.id !== mTeam.id);
      
      let oTeam: Team;
      if (opponents.length > 0) {
        oTeam = opponents[Math.floor(Math.random() * opponents.length)];
      } else {
        const fallback = await db.teams.toArray();
        const fallbacks = fallback.filter(t => t.id !== mTeam.id);
        if (fallbacks.length > 0) {
             oTeam = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        } else {
             oTeam = {
                 id: 99999, name: "Adversário", leagueId: mTeam.leagueId, color: "#ccc", logo: "https://ui-avatars.com/api/?name=ADV", money: 0, reputation: 1000, overallForce: 60
             };
        }
      }
      setOppTeam(oTeam);

      if (oTeam.id && oTeam.id !== 99999) {
          const oPlayers = await db.players.where({ teamId: oTeam.id }).toArray();
          setOppPlayers(oPlayers.length > 0 ? oPlayers.map(p => p.name) : ["Jogador " + oTeam.name]);
      } else {
          setOppPlayers(["Adversário 1", "Adversário 2"]);
      }
    }

    loadData();
  }, [currentSaveId, navigate]);

  useEffect(() => {
    if (eventsEndRef.current) {
        eventsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [visibleEvents]);

  const startMatch = () => {
    if (!myTeam || !oppTeam) return;

    // Simulate entire match instantly
    const result = simulateMatch(
        { id: myTeam.id!, name: myTeam.name, force: myTeam.overallForce },
        { id: oppTeam.id!, name: oppTeam.name, force: oppTeam.overallForce },
        myPlayers,
        oppPlayers
    );

    setEvents(result.events);
    setMatchState('PLAYING');
    setMinute(0);
    setHomeScore(0);
    setAwayScore(0);
    setVisibleEvents([]);
  };

  useEffect(() => {
    if (matchState === 'PLAYING') {
      const interval = setInterval(() => {
        setMinute(prev => {
          if (prev >= 90) return prev;
          return prev + 1;
        });
      }, speed);
      return () => clearInterval(interval);
    }
  }, [matchState, speed]);

  useEffect(() => {
    if (matchState !== 'PLAYING') return;

    const currentEvents = events.filter(e => e.minute === minute);
    if (currentEvents.length > 0) {
        setVisibleEvents(ve => {
            const newEvents = currentEvents.filter(ce => !ve.some(v => v.minute === ce.minute && v.text === ce.text));
            return [...ve, ...newEvents];
        });
    }

    if (minute >= 90) {
        setMatchState('POSTMATCH');
        advanceDate(7); // advance week
        
        // Update stats
        if (myTeam && oppTeam) {
            db.transaction('rw', db.teams, async () => {
                const mt = await db.teams.get(myTeam.id!);
                const ot = await db.teams.get(oppTeam.id!);
                if(mt && ot) {
                    mt.played = (mt.played || 0) + 1;
                    ot.played = (ot.played || 0) + 1;
                    
                    const finalHomeScore = events.filter(e => (e.type === 'GOAL' || e.type === 'PENALTY') && e.teamId === myTeam.id && e.text.includes('GOL')).length;
                    const finalAwayScore = events.filter(e => (e.type === 'GOAL' || e.type === 'PENALTY') && e.teamId === oppTeam.id && e.text.includes('GOL')).length;

                    mt.goalsFor = (mt.goalsFor || 0) + finalHomeScore;
                    mt.goalsAgainst = (mt.goalsAgainst || 0) + finalAwayScore;
                    ot.goalsFor = (ot.goalsFor || 0) + finalAwayScore;
                    ot.goalsAgainst = (ot.goalsAgainst || 0) + finalHomeScore;

                    if (finalHomeScore > finalAwayScore) {
                        mt.wins = (mt.wins || 0) + 1;
                        mt.points = (mt.points || 0) + 3;
                        ot.losses = (ot.losses || 0) + 1;
                    } else if (finalHomeScore < finalAwayScore) {
                        ot.wins = (ot.wins || 0) + 1;
                        ot.points = (ot.points || 0) + 3;
                        mt.losses = (mt.losses || 0) + 1;
                    } else {
                        mt.draws = (mt.draws || 0) + 1;
                        mt.points = (mt.points || 0) + 1;
                        ot.draws = (ot.draws || 0) + 1;
                        ot.points = (ot.points || 0) + 1;
                    }
                    await db.teams.put(mt);
                    await db.teams.put(ot);
                }
            }).catch(console.error);
        }
    }
  }, [minute, matchState, events, advanceDate]);

  useEffect(() => {
     let h = 0, a = 0;
     for (const ev of visibleEvents) {
         if (ev.type === 'GOAL' || (ev.type === 'PENALTY' && ev.text.includes('GOL'))) {
             if (ev.teamId === myTeam?.id) h++; else a++;
         }
     }
     setHomeScore(h);
     setAwayScore(a);
  }, [visibleEvents, myTeam?.id]);

  const EventIcon = ({ type }: { type: MatchEvent['type'] }) => {
    switch (type) {
      case 'GOAL': return <div className="w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center text-[10px] text-white">⚽</div>;
      case 'CARD_YELLOW': return <div className="w-3.5 h-4.5 bg-yellow-400 rounded-sm shadow-sm" />;
      case 'CARD_RED': return <div className="w-3.5 h-4.5 bg-red-600 rounded-sm shadow-sm" />;
      case 'PENALTY': return <div className="w-5 h-5 bg-slate-800 rounded flex items-center justify-center text-[10px] text-white">🅟</div>;
      case 'FOUL': return <div className="w-5 h-5 text-orange-500 font-bold">⚠️</div>;
      case 'SHOT': return <div className="w-5 h-5 text-slate-400 font-bold">👟</div>;
      default: return null;
    }
  };

  if (!myTeam || !oppTeam) return <div className="h-screen bg-slate-50 flex items-center justify-center text-teal-600 font-bold animate-pulse">Carregando Partida...</div>;

  const parsedDate = new Date(currentDate);
  const formattedDate = format(parsedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="flex flex-col h-screen bg-slate-100 text-slate-800 font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden">
      
      {/* Top Navbar */}
      <div className="bg-teal-700 text-teal-100 flex items-center justify-between px-4 py-3 shadow-md z-20 relative">
         <Link to="/dashboard" className="p-2 -ml-2 text-white hover:bg-teal-600 rounded-full transition"><Home size={20} /></Link>
         <h1 className="font-bold text-white tracking-widest text-sm uppercase">DIA DE JOGO</h1>
         <div className="w-8"></div>
      </div>

      <div className="bg-white px-4 py-6 border-b border-slate-200 z-10 shadow-sm relative">
         <div className="flex justify-center mb-4">
             <div className="bg-slate-100 px-3 py-1 rounded-full flex items-center gap-2 text-xs font-bold text-slate-500">
                 <Calendar size={14} className="text-teal-600" /> {formattedDate}
             </div>
         </div>

         <div className="flex items-center justify-between">
             <div className="flex flex-col items-center flex-1">
                 <img src={myTeam.logo} className="w-16 h-16 rounded-full border-2 border-slate-100 shadow-md bg-white object-cover mb-2" />
                 <span className="font-bold text-slate-800 text-center leading-tight truncate w-full px-2" title={myTeam.name}>{myTeam.name}</span>
                 <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded mt-1">CASA</span>
             </div>

             <div className="flex flex-col items-center justify-center px-4 w-24">
                 {matchState === 'PREMATCH' ? (
                     <div className="text-3xl font-black text-slate-300">VS</div>
                 ) : (
                     <>
                        <div className="flex items-center gap-2 text-4xl font-black text-teal-700 tracking-tighter">
                            <span>{homeScore}</span>
                            <span className="text-slate-300 -mt-1">-</span>
                            <span>{awayScore}</span>
                        </div>
                        <div className={`mt-2 font-bold text-xs uppercase px-2 py-1 rounded ${matchState === 'POSTMATCH' ? 'bg-slate-800 text-white' : 'bg-red-600 text-white animate-pulse'}`}>
                            {matchState === 'POSTMATCH' ? 'FIM' : `${minute}'`}
                        </div>
                     </>
                 )}
             </div>

             <div className="flex flex-col items-center flex-1">
                 <img src={oppTeam.logo} className="w-16 h-16 rounded-full border-2 border-slate-100 shadow-md bg-white object-cover mb-2" />
                 <span className="font-bold text-slate-800 text-center leading-tight truncate w-full px-2" title={oppTeam.name}>{oppTeam.name}</span>
                 <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded mt-1">FORA</span>
             </div>
          </div>
      </div>

      {/* Match Tabs */}
      <div className="bg-white border-b border-slate-200 flex shadow-sm z-10 sticky top-0 overflow-x-auto text-[10px] md:text-xs">
         <button onClick={() => setActiveTab('partida')} className={`px-4 py-3 font-bold uppercase tracking-wider border-b-2 whitespace-nowrap ${activeTab === 'partida' ? 'border-teal-600 text-teal-700 bg-teal-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Em Campo</button>
         <button onClick={() => setActiveTab('eventos')} className={`px-4 py-3 font-bold uppercase tracking-wider border-b-2 whitespace-nowrap ${activeTab === 'eventos' ? 'border-teal-600 text-teal-700 bg-teal-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Eventos</button>
         <button onClick={() => setActiveTab('escalacao')} className={`px-4 py-3 font-bold uppercase tracking-wider border-b-2 whitespace-nowrap ${activeTab === 'escalacao' ? 'border-teal-600 text-teal-700 bg-teal-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Escalação</button>
         <button onClick={() => setActiveTab('estatisticas')} className={`px-4 py-3 font-bold uppercase tracking-wider border-b-2 whitespace-nowrap ${activeTab === 'estatisticas' ? 'border-teal-600 text-teal-700 bg-teal-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Estatísticas</button>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 relative custom-scrollbar">
         {activeTab === 'partida' && (
             matchState === 'PREMATCH' ? (
                 <div className="p-8 flex flex-col items-center justify-center h-full animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-6">
                        <Activity size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Pronto para o apito inicial?</h2>
                    <p className="text-sm text-slate-500 text-center mb-8">Defina sua tática, confira o elenco e inicie a simulação.</p>
                    <button onClick={startMatch} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold uppercase tracking-widest py-4 px-6 rounded-2xl shadow-xl shadow-teal-600/20 transition flex justify-center items-center gap-2 transform active:scale-95">
                        <Play size={20} fill="currentColor" /> Iniciar Partida
                    </button>
                 </div>
             ) : (
                <div className="p-6 flex flex-col items-center justify-center h-full animate-in fade-in zoom-in duration-500">
                   <div className="w-full aspect-[4/3] bg-emerald-600 border-4 border-white inset-0 shadow-lg relative overflow-hidden rounded-lg flex flex-col">
                      {/* Field lines */}
                      <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/40"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-white/40"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white/80 rounded-full"></div>
                      {/* Penalty Areas */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-28 border-2 border-l-0 border-white/40"></div>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-16 h-28 border-2 border-r-0 border-white/40"></div>

                      <div className="flex-1 flex items-center justify-center text-white/70 font-black tracking-widest uppercase text-xl shadow-black/10 text-shadow-sm z-10 text-center px-4">
                         {matchState === 'PLAYING' ? <span className="animate-pulse">Bola Rolando...</span> : 'Fim de Jogo'}
                      </div>
                   </div>
                   
                   {matchState === 'POSTMATCH' && (
                       <div className="bg-slate-800 text-white rounded-xl p-6 flex flex-col items-center text-center mt-6 w-full">
                          <CheckCircle2 size={40} className="text-teal-400 mb-3" />
                          <h3 className="font-black text-2xl mb-1">Fim de Jogo!</h3>
                          <Link to="/dashboard" className="bg-white text-slate-900 font-bold uppercase tracking-widest text-sm py-3 px-6 rounded-xl hover:bg-slate-100 transition w-full flex justify-center items-center gap-2 mt-4">
                             Continuar <ChevronRight size={18} />
                          </Link>
                       </div>
                   )}
                </div>
             )
         )}

         {activeTab === 'eventos' && (
             <div className="p-4 flex flex-col gap-3">
                 {visibleEvents.length === 0 && <div className="text-center text-slate-400 font-bold py-10 uppercase text-xs tracking-wider">Nenhum evento registrado.</div>}
                 {visibleEvents.map((ev, i) => (
                     <div key={i} className="bg-white border text-sm border-slate-200 rounded-xl p-3 flex gap-3 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                         <div className="font-black text-teal-700 w-6 shrink-0">{ev.minute}'</div>
                         <div className="shrink-0 flex items-center justify-center">
                             <EventIcon type={ev.type} />
                         </div>
                         <div className="flex-1">
                            <span className="font-bold text-slate-800 mr-1">{ev.playerName}</span> 
                            <span className="text-slate-600 leading-snug">{ev.text.replace(ev.playerName, '')}</span>
                         </div>
                     </div>
                 ))}
                 <div ref={eventsEndRef} />
             </div>
         )}

         {activeTab === 'escalacao' && (
            <div className="p-4 grid grid-cols-2 gap-4">
               <div>
                  <h3 className="font-bold text-[10px] uppercase tracking-wider text-teal-600 mb-2 truncate" title={myTeam.name}>{myTeam.name}</h3>
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200 divide-y divide-slate-100">
                     {myPlayers.map(p => <div key={p} className="p-2 text-xs font-semibold text-slate-700 truncate">{p}</div>)}
                  </div>
               </div>
               <div>
                  <h3 className="font-bold text-[10px] uppercase tracking-wider text-slate-500 mb-2 truncate" title={oppTeam.name}>{oppTeam.name}</h3>
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200 divide-y divide-slate-100">
                     {oppPlayers.map(p => <div key={p} className="p-2 text-xs font-semibold text-slate-700 truncate">{p}</div>)}
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'estatisticas' && (
            <div className="p-4">
               <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
                   <h3 className="text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-4">Estatísticas do Jogo</h3>
                   
                   <div className="flex justify-between items-center text-sm text-slate-800 mb-4">
                      <span className="w-8 font-black text-teal-700">{matchState === 'PREMATCH' ? 0 : homeScore + Math.floor(Math.random() * 4)}</span>
                      <span className="font-bold text-slate-500 uppercase text-[10px] flex-1">Chutes a Gol</span>
                      <span className="w-8 font-black text-slate-700">{matchState === 'PREMATCH' ? 0 : awayScore + Math.floor(Math.random() * 4)}</span>
                   </div>
                   
                   <div className="flex justify-between items-center text-sm text-slate-800 mb-4">
                      <span className="w-8 font-black text-teal-700">{matchState === 'PREMATCH' ? '50%' : `${50 + (homeScore - awayScore) * 2}%`}</span>
                      <span className="font-bold text-slate-500 uppercase text-[10px] flex-1">Posse de Bola</span>
                      <span className="w-8 font-black text-slate-700">{matchState === 'PREMATCH' ? '50%' : `${50 - (homeScore - awayScore) * 2}%`}</span>
                   </div>
                   
                   <div className="flex justify-between items-center text-sm text-slate-800 mb-4">
                      <span className="w-8 font-black text-teal-700">{matchState === 'PREMATCH' ? 0 : Math.floor(Math.random() * 15 + 5)}</span>
                      <span className="font-bold text-slate-500 uppercase text-[10px] flex-1">Faltas</span>
                      <span className="w-8 font-black text-slate-700">{matchState === 'PREMATCH' ? 0 : Math.floor(Math.random() * 15 + 5)}</span>
                   </div>
               </div>
            </div>
         )}
      </div>

      {/* Speed Controls for Live Match */}
      {matchState === 'PLAYING' && (
          <div className="bg-white p-4 border-t border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] sticky bottom-0 z-20 flex justify-center gap-2">
             <button onClick={() => setSpeed(500)} className={`flex-1 py-3 rounded-lg font-bold text-xs uppercase transition flex justify-center items-center gap-1 border ${speed === 500 ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-white border-slate-200 text-slate-500'}`}>
                 1X Normal
             </button>
             <button onClick={() => setSpeed(100)} className={`flex-1 py-3 rounded-lg font-bold text-xs uppercase transition flex justify-center items-center gap-1 border ${speed === 100 ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-white border-slate-200 text-slate-500'}`}>
                 <FastForward size={14} /> 2X Rápido
             </button>
             <button onClick={() => setSpeed(10)} className={`flex-1 py-3 rounded-lg font-bold text-xs uppercase transition flex justify-center items-center gap-1 border ${speed === 10 ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-white border-slate-200 text-slate-500'}`}>
                 <FastForward size={14} fill="currentColor" /> Simular
             </button>
          </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
        .text-shadow-sm { text-shadow: 0px 1px 2px rgba(0,0,0,0.3); }
      `}</style>
    </div>
  );
}
