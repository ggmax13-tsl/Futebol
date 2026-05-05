import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Users, Trophy, Store, CircleDollarSign, Globe, Play, ChevronUp, Download, Edit2, LayoutDashboard, Target, ArrowLeft } from "lucide-react";
import db, { SaveGame, Team, League } from "../db/database";
import { useGameStore } from "../store/gameStore";

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentSaveId, currentDate } = useGameStore();
  
  const [save, setSave] = useState<SaveGame | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [league, setLeague] = useState<League | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  const players = useLiveQuery(
    () => (team ? db.players.where({ teamId: team.id }).toArray() : []),
    [team]
  );

  const marketPlayers = useLiveQuery(
    () => (team ? db.players.where('teamId').notEqual(team.id).toArray() : []),
    [team]
  );

  const leagueTeams = useLiveQuery(
    () => (league && league.id ? db.teams.where({ leagueId: league.id }).toArray() : []),
    [league]
  );

  useEffect(() => {
    if (!currentSaveId) {
      navigate("/");
      return;
    }
    db.saves.get(currentSaveId).then(s => {
      if (s) {
        setSave(s);
        if (s.currentTeamId) {
          db.teams.get(s.currentTeamId).then(t => {
            setTeam(t || null);
            if (t?.leagueId) {
              db.leagues.get(t.leagueId).then(l => setLeague(l || null));
            }
          });
        }
      }
    });
  }, [currentSaveId, navigate]);

  const [activeTab, setActiveTab] = useState<'plantel'|'taticas'|'tabela'|'financas'>('plantel');
  const [mainTab, setMainTab] = useState<'inicio'|'equipe'|'mercado'>('equipe');

  const [formation, setFormation] = useState('4-3-3');
  const [playStyle, setPlayStyle] = useState('Equilibrado');
  const [marking, setMarking] = useState('Média');

  const [negotiatingPlayer, setNegotiatingPlayer] = useState<Player | null>(null);
  const [offerValue, setOfferValue] = useState(0);
  const [transferType, setTransferType] = useState('Comprar');
  const [offerClause, setOfferClause] = useState('Nenhuma');

  if (!save || !team) return (
    <div className="flex items-center justify-center h-screen bg-slate-50 text-teal-600 animate-pulse font-bold">
      Carregando...
    </div>
  );

  const parsedDate = new Date(currentDate);
  const formattedDate = format(parsedDate, "dd MMM. yyyy", { locale: ptBR });

  // Function to determine overall circle color
  const getOverallColor = (ovr: number) => {
    if (ovr >= 80) return "bg-teal-600 text-white border-teal-600";
    if (ovr >= 70) return "bg-emerald-500 text-white border-emerald-500";
    return "bg-slate-500 text-white border-slate-500";
  };

  const sortedLeagueTeams = [...(leagueTeams || [])].sort((a, b) => {
     const ptsA = a.points || 0;
     const ptsB = b.points || 0;
     if (ptsA !== ptsB) return ptsB - ptsA;
     const sgA = (a.goalsFor || 0) - (a.goalsAgainst || 0);
     const sgB = (b.goalsFor || 0) - (b.goalsAgainst || 0);
     if (sgA !== sgB) return sgB - sgA;
     return (b.goalsFor || 0) - (a.goalsFor || 0);
  });

  const myRank = team ? sortedLeagueTeams.findIndex(t => t.id === team.id) + 1 : 0;
  const rodada = (team?.played || 0) + 1;

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden">
      
      {/* Top Navbar */}
      {mainTab === 'equipe' && (
        <div className="bg-teal-700 text-teal-100 flex items-center justify-between px-2 pt-2 text-xs font-bold uppercase tracking-wide">
           <button onClick={() => setActiveTab('plantel')} className={`p-3 flex-1 flex flex-col items-center gap-1 ${activeTab === 'plantel' ? 'text-white border-b-2 border-white' : 'hover:text-white'}`}>
             <Users size={18} /> Plantel
           </button>
           <button onClick={() => setActiveTab('taticas')} className={`p-3 flex-1 flex flex-col items-center gap-1 ${activeTab === 'taticas' ? 'text-white border-b-2 border-white' : 'hover:text-white'}`}>
             <LayoutDashboard size={18} /> Táticas
           </button>
           <button onClick={() => setActiveTab('tabela')} className={`p-3 flex-1 flex flex-col items-center gap-1 ${activeTab === 'tabela' ? 'text-white border-b-2 border-white' : 'hover:text-white'}`}>
             <Trophy size={18} /> Tabela
           </button>
           <button onClick={() => setActiveTab('financas')} className={`p-3 flex-1 flex flex-col items-center gap-1 ${activeTab === 'financas' ? 'text-white border-b-2 border-white' : 'hover:text-white'}`}>
             <CircleDollarSign size={18} /> Finanças
           </button>
        </div>
      )}

      {mainTab === 'mercado' && (
        <div className="bg-teal-700 text-white p-4 font-bold text-center uppercase tracking-wide shadow-md">
          Mercado de Transferências
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-20">
        
        {/* Banner Section */}
        {(mainTab === 'inicio' || mainTab === 'equipe') && (
          <div className="bg-white p-4 flex gap-3 shadow-sm relative z-10 border-b border-slate-200">
             {team.logo && <img src={team.logo} alt="logo" className="w-16 h-16 rounded border border-slate-200 shadow-sm object-cover" />}
             
             <div className="flex-1">
               <div className="flex justify-between items-start">
                 <div>
                   <h2 className="text-xl font-semibold text-teal-800 tracking-tight leading-none">{team.name}</h2>
                   <p className="text-xs text-slate-500 mt-1">{`${myRank}º ${league?.name || 'Liga'} Rodada ${rodada}`}</p>
                 </div>
                 
                 {/* Next Match Box */}
                 <div className="bg-white border text-center border-slate-200 shadow-sm rounded-lg p-2 min-w-[80px]">
                   <div className="flex items-center justify-center gap-1">
                     <img src={team.logo} className="w-4 h-4" />
                     <span className="text-xs font-bold text-slate-400">VS</span>
                     <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-[8px] text-white font-bold">R</div>
                   </div>
                   <div className="text-[10px] text-teal-600 font-bold mt-1">{formattedDate}</div>
                 </div>
               </div>
             </div>
          </div>
        )}

        {/* Stats Row */}
        {(mainTab === 'inicio' || mainTab === 'equipe') && (
          <div className="bg-white pb-3 px-4 shadow-sm relative z-10 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                 <div className="flex justify-between text-xs text-slate-500 font-medium mb-1">
                   <span>Confiança</span>
                   <span>90 <Users size={12} className="inline text-slate-400" /></span>
                 </div>
                 <div className="h-3 bg-slate-200 rounded-sm w-full overflow-hidden">
                   <div className="h-full bg-teal-600 w-[90%] rounded-sm"></div>
                 </div>
              </div>
              
              <div className="flex-1 flex items-center justify-between mt-5">
                 <div className="flex flex-col">
                   <span className="text-xs font-medium text-slate-500">{players?.length || 0}/29</span>
                   <span className="text-sm font-bold text-slate-700">$ {(team.money).toLocaleString()}</span>
                 </div>
                 <div className="flex gap-1">
                   <button className="bg-teal-600 text-white p-1.5 rounded-md shadow"><Trophy size={14} /></button>
                   <button onClick={() => setMainTab('mercado')} className="bg-teal-600 text-white p-1.5 rounded-md shadow"><Target size={14} /></button>
                 </div>
              </div>
            </div>
          </div>
        )}

        {mainTab === 'inicio' && (
          <div className="p-4 flex flex-col gap-4">
             <div className="bg-teal-700 text-white rounded-xl p-6 shadow-md relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-2xl font-black italic tracking-tighter mb-1">PROXIMO JOGO</h3>
                  <p className="text-teal-100 text-sm mb-4">Prepare-se para o embate na liga.</p>
                  <Link to="/match/1" className="bg-white text-teal-800 font-bold px-4 py-2 rounded-lg text-sm uppercase flex items-center gap-2 w-fit">
                    <Play size={16} fill="currentColor" /> Ir para a Partida
                  </Link>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-20">
                   <Trophy size={100} />
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
               <button onClick={() => setMainTab('mercado')} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-left hover:border-teal-500 transition">
                 <div className="text-slate-400 mb-1"><Target size={20} /></div>
                 <h4 className="font-bold text-slate-700">Mercado</h4>
                 <p className="text-[10px] text-slate-500 leading-tight mt-1">Busque reforços para seu time</p>
               </button>
               <Link to="/settings" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-left hover:border-teal-500 transition">
                 <div className="text-slate-400 mb-1"><Globe size={20} /></div>
                 <h4 className="font-bold text-slate-700">Configurações</h4>
                 <p className="text-[10px] text-slate-500 leading-tight mt-1">Ajuste o simulador</p>
               </Link>
               <button onClick={() => {
                  alert('Jogo salvo com sucesso no dispositivo!');
               }} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-left hover:border-teal-500 transition col-span-2 flex items-center justify-between">
                 <div>
                    <h4 className="font-bold text-slate-700">Salvar Progresso</h4>
                    <p className="text-[10px] text-slate-500 leading-tight mt-1">Sincroniza e garante seus dados na nuvem.</p>
                 </div>
                 <div className="text-teal-600 bg-teal-50 p-2 rounded-full"><Download size={20} /></div>
               </button>
             </div>
          </div>
        )}

        {mainTab === 'mercado' && !negotiatingPlayer && (
          <div className="p-4 flex flex-col gap-4">
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex gap-2">
                   <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar jogador..." className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500" />
                   <button className="bg-teal-600 text-white px-3 py-2 rounded-lg"><Target size={18} /></button>
                </div>
             </div>

             <div>
               <div className="mt-2 mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 flex justify-between">
                  <span>Destaques no Mercado</span>
               </div>
               
               <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                  {marketPlayers?.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 10).map(p => (
                    <div key={p.id} className="p-3 flex items-center gap-3 hover:bg-slate-50 transition">
                       <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden shrink-0">
                         {p.photo ? <img src={p.photo} alt={p.name} className="w-full h-full object-cover object-top" /> : null}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-700 text-sm truncate">{p.name}</div>
                          <div className="text-[10px] text-slate-500">
                            {p.position === 'ATK' ? 'ATA' : p.position === 'DEF' ? 'DEF' : p.position === 'MID' ? 'MEI' : 'GOL'} • {p.age} anos • Força {p.overall}
                          </div>
                       </div>
                       <div className="text-right shrink-0">
                          <div className="font-bold text-teal-600 text-sm">$ {(Math.floor(p.overall * 123)).toLocaleString()}</div>
                          <button onClick={() => {
                            setNegotiatingPlayer(p);
                            setOfferValue(Math.floor(p.overall * 120));
                          }} className="text-[10px] bg-teal-50 text-teal-600 border border-teal-200 font-bold px-2 py-1 rounded mt-1 hover:bg-teal-100 transition">Negociar</button>
                       </div>
                    </div>
                  ))}
                  {marketPlayers?.length === 0 && (
                    <div className="p-4 text-center text-sm text-slate-500">Nenhum jogador encontrado.</div>
                  )}
               </div>
             </div>

             <div>
                <div className="mt-2 mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Transferências Recentes</div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                   <div className="flex items-center gap-2 text-sm border-b border-slate-100 pb-2">
                       <div className="w-6 h-6 bg-blue-100 rounded-full flex justify-center items-center font-bold text-[10px] text-blue-700">M</div>
                       <div className="flex-1">
                          <span className="font-bold text-slate-700">Muller</span> vendido ao Real SC
                       </div>
                       <div className="font-bold text-teal-600">$ 45.000</div>
                   </div>
                   <div className="flex items-center gap-2 text-sm">
                       <div className="w-6 h-6 bg-red-100 rounded-full flex justify-center items-center font-bold text-[10px] text-red-700">J</div>
                       <div className="flex-1">
                          <span className="font-bold text-slate-700">João P.</span> emprestado ao AC City
                       </div>
                       <div className="font-bold text-slate-500 text-xs">Empréstimo</div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {mainTab === 'mercado' && negotiatingPlayer && (
           <div className="p-4 animate-in slide-in-from-right-4 duration-300">
              <button onClick={() => setNegotiatingPlayer(null)} className="text-teal-600 font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-1">
                <ChevronUp className="-rotate-90" size={16} /> Voltar ao Mercado
              </button>

              <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-slate-200 rounded-full overflow-hidden shadow">
                       {negotiatingPlayer.photo ? <img src={negotiatingPlayer.photo} className="w-full h-full object-cover object-top" /> : null}
                    </div>
                    <div>
                       <h2 className="text-xl font-bold text-slate-800 leading-tight">{negotiatingPlayer.name}</h2>
                       <div className="text-sm font-medium text-slate-500">{negotiatingPlayer.position} • {negotiatingPlayer.age} anos • OVR {negotiatingPlayer.overall}</div>
                       <div className="text-xs text-teal-600 font-bold mt-1">Valor Est.: $ {(Math.floor(negotiatingPlayer.overall * 123)).toLocaleString()}</div>
                    </div>
                 </div>

                 <div className="flex flex-col gap-4">
                    <label className="text-xs font-bold text-slate-600">
                       Tipo de Oferta
                       <select value={transferType} onChange={e => setTransferType(e.target.value)} className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500">
                          <option>Comprar (Definitivo)</option>
                          <option>Empréstimo (1 Temporada)</option>
                       </select>
                    </label>
                    <label className="text-xs font-bold text-slate-600">
                       Valor da Oferta ($)
                       <input type="number" value={offerValue} onChange={e => setOfferValue(parseInt(e.target.value) || 0)} className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </label>
                    <label className="text-xs font-bold text-slate-600">
                       Cláusulas Adicionais
                       <select value={offerClause} onChange={e => setOfferClause(e.target.value)} className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500">
                          <option>Nenhuma</option>
                          <option>10% da Próxima Venda</option>
                          <option>Pagamento Parcelado</option>
                       </select>
                    </label>

                    <button onClick={() => {
                       alert('Proposta enviada ao clube!');
                       setNegotiatingPlayer(null);
                    }} className="mt-4 w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl uppercase tracking-widest transition transform active:scale-95 shadow-lg shadow-teal-600/30">
                       Enviar Proposta
                    </button>
                 </div>
              </div>
           </div>
        )}

        {mainTab === 'equipe' && activeTab === 'plantel' && (
          <>
            {/* Filters / Labels */}
            <div className="flex text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-2 sticky top-0 bg-slate-50 z-20 border-b border-slate-200 shadow-sm">
              <div className="w-12 text-center"></div>{/* Photo space */}
              <div className="flex-1 text-sm font-normal normal-case text-slate-700">Jogadores</div>
              <div className="w-10 text-center text-teal-600">Posi ▼</div>
              <div className="w-12 text-right">Salário</div>
              <div className="w-8 text-center">Idd</div>
              <div className="w-12 text-right">Valor</div>
              <div className="w-10 text-center">Força</div>
            </div>

            {/* Player List */}
            <div className="divide-y divide-slate-200 bg-white shadow-sm border-b border-slate-200">
              {players?.map(p => (
                <div key={p.id} className="flex items-center px-2 py-2 hover:bg-slate-50 cursor-pointer">
                  {/* Photo */}
                  <div className="w-12 flex justify-center relative">
                    {p.photo ? (
                      <img src={p.photo} className="w-10 h-10 rounded-full object-cover border border-slate-200 object-top" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300"></div>
                    )}
                    {p.isPromise && <span className="absolute -top-1 right-0 text-yellow-500 text-xs text-shadow-sm">★</span>}
                  </div>
                  
                  {/* Name & Badges */}
                  <div className="flex-1 pl-2 relative">
                    <div className="inline-block border-b-2 border-teal-600 pb-0.5 mb-1">
                      <span className="font-semibold text-slate-700 text-sm whitespace-nowrap overflow-hidden text-ellipsis block max-w-[90px]">{p.name.split(' ').slice(0,2).join(' ')}</span>
                    </div>
                    <div className="flex gap-1">
                       {/* Fake Badges for style */}
                       {p.position === 'ATK' && <><span className="bg-blue-100 text-blue-700 px-1 py-0.5 text-[8px] rounded font-bold uppercase">Agi</span><span className="bg-purple-100 text-purple-700 px-1 py-0.5 text-[8px] rounded font-bold uppercase">Vel</span></>}
                       {p.position === 'MID' && <><span className="bg-emerald-100 text-emerald-700 px-1 py-0.5 text-[8px] rounded font-bold uppercase">Pas</span><span className="bg-red-100 text-red-700 px-1 py-0.5 text-[8px] rounded font-bold uppercase">Téc</span></>}
                       {p.position === 'DEF' && <><span className="bg-slate-200 text-slate-700 px-1 py-0.5 text-[8px] rounded font-bold uppercase">Fís</span><span className="bg-orange-100 text-orange-700 px-1 py-0.5 text-[8px] rounded font-bold uppercase">Des</span></>}
                       {p.position === 'GK'  && <><span className="bg-yellow-100 text-yellow-700 px-1 py-0.5 text-[8px] rounded font-bold uppercase">Ref</span></>}
                    </div>
                    {/* Fake Flag */}
                    <div className="w-3 h-2 bg-green-500 absolute top-1 -left-2 border shadow-sm"></div>
                  </div>

                  {/* Position */}
                  <div className="w-10 flex flex-col items-center">
                     <div className="bg-teal-100 text-teal-800 font-bold text-[10px] px-1 rounded uppercase">
                       {p.position === 'ATK' ? 'ATA' : p.position === 'DEF' ? 'DEF' : p.position === 'MID' ? 'MEI' : 'GOL'}
                     </div>
                     <div className="text-[9px] text-slate-400 font-bold mt-0.5 uppercase">{p.position==='ATK'?'PE':p.position==='MID'?'MC':p.position==='DEF'?'ZC':'GK'}</div>
                  </div>

                  {/* Salary */}
                  <div className="w-12 text-right text-xs font-medium text-slate-600">
                    {Math.floor(p.overall * 800).toLocaleString()}
                    <div className="text-[9px] text-teal-500">11/20</div>
                  </div>

                  {/* Age */}
                  <div className="w-8 text-center text-xs font-medium text-slate-600">{p.age}</div>

                  {/* Value */}
                  <div className="w-12 text-right text-xs font-medium text-slate-600">
                    {(p.overall * 123).toLocaleString()},{p.overall%10}
                  </div>

                  {/* Overall Circle */}
                  <div className="w-10 flex justify-center ml-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${getOverallColor(p.overall)}`}>
                      {p.overall}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {mainTab === 'equipe' && activeTab === 'taticas' && (
          <div className="p-4">
             <div className="bg-white shadow-sm border border-slate-200 rounded-xl mb-4 p-3 pr-4 flex items-center gap-3">
                <div className="font-bold text-xs text-slate-500 uppercase tracking-wider whitespace-nowrap pl-2">Formação</div>
                <select value={formation} onChange={e => setFormation(e.target.value)} className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm font-bold p-2 rounded-lg focus:outline-none focus:border-teal-500">
                   <option>4-3-3</option>
                   <option>4-4-2</option>
                   <option>3-5-2</option>
                   <option>4-2-3-1</option>
                   <option>5-3-2</option>
                </select>
             </div>

             <div className="bg-emerald-600 rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-4 border-[6px] border-emerald-700 shadow-inner" style={{ minHeight: '320px' }}>
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/30 -translate-x-1/2"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-white/30"></div>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-20 border-2 border-white/30 rounded-t-none"></div>
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-20 border-2 border-white/30 rounded-b-none"></div>

                <div className="z-10 bg-black/40 text-white rounded px-3 py-1 text-xs font-bold uppercase tracking-widest absolute top-2 right-2 backdrop-blur-sm">
                   {formation}
                </div>
                
                {/* Visual Fake Formation */}
                <div className="w-full flex justify-center gap-12 mt-6 z-10">
                   {players?.filter(p => p.position === 'ATK').slice(0, parseInt(formation.split('-')[2]) || 2).map(p => (
                      <div key={p.id} className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform">
                         <div className={`w-9 h-9 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center font-bold text-white text-xs ${p.isPromise ? 'ring-2 ring-yellow-400' : ''}`}>{p.overall}</div>
                         <div className="bg-black/60 text-white text-[9px] px-1.5 py-0.5 font-bold rounded mt-1 truncate max-w-[60px] shadow">{p.name.split(' ')[0]}</div>
                      </div>
                   ))}
                </div>
                <div className="w-full flex justify-center gap-8 mt-10 z-10">
                   {players?.filter(p => p.position === 'MID').slice(0, parseInt(formation.split('-')[1]) || 4).map(p => (
                      <div key={p.id} className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform">
                         <div className={`w-9 h-9 bg-emerald-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center font-bold text-white text-xs ${p.isPromise ? 'ring-2 ring-yellow-400' : ''}`}>{p.overall}</div>
                         <div className="bg-black/60 text-white text-[9px] px-1.5 py-0.5 font-bold rounded mt-1 truncate max-w-[60px] shadow">{p.name.split(' ')[0]}</div>
                      </div>
                   ))}
                </div>
                <div className="w-full flex justify-center gap-6 mt-10 z-10">
                   {players?.filter(p => p.position === 'DEF').slice(0, parseInt(formation.split('-')[0]) || 4).map(p => (
                      <div key={p.id} className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform">
                         <div className={`w-9 h-9 bg-slate-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center font-bold text-white text-xs ${p.isPromise ? 'ring-2 ring-yellow-400' : ''}`}>{p.overall}</div>
                         <div className="bg-black/60 text-white text-[9px] px-1.5 py-0.5 font-bold rounded mt-1 truncate max-w-[60px] shadow">{p.name.split(' ')[0]}</div>
                      </div>
                   ))}
                </div>
                <div className="w-full flex justify-center mt-8 mb-2 z-10">
                   {players?.filter(p => p.position === 'GK').slice(0, 1).map(p => (
                      <div key={p.id} className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform">
                         <div className={`w-9 h-9 bg-yellow-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center font-bold text-white text-xs ${p.isPromise ? 'ring-2 ring-yellow-400' : ''}`}>{p.overall}</div>
                         <div className="bg-black/60 text-white text-[9px] px-1.5 py-0.5 font-bold rounded mt-1 truncate max-w-[60px] shadow">{p.name.split(' ')[0]}</div>
                      </div>
                   ))}
                </div>
             </div>
             
             <div className="mt-4 bg-white p-4 shadow-sm border border-slate-200 rounded-xl">
                 <h3 className="font-bold text-sm text-slate-800 mb-3 border-b border-slate-100 pb-2">Instruções Táticas Gerais</h3>
                 <div className="flex flex-col gap-3">
                    <label className="text-xs font-bold text-slate-500">
                       Estilo de Jogo
                       <select value={playStyle} onChange={e => setPlayStyle(e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-300 text-slate-700 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500">
                          <option>Ofensivo</option>
                          <option>Equilibrado</option>
                          <option>Defensivo</option>
                          <option>Contra-Ataque</option>
                          <option>Posse de Bola</option>
                       </select>
                    </label>
                    <label className="text-xs font-bold text-slate-500">
                       Intensidade da Marcação
                       <select value={marking} onChange={e => setMarking(e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-300 text-slate-700 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500">
                          <option>Baixa (Recuado)</option>
                          <option>Média</option>
                          <option>Alta (Pressão Avançada)</option>
                       </select>
                    </label>
                 </div>
             </div>
          </div>
        )}

        {mainTab === 'equipe' && activeTab === 'tabela' && (
          <div className="bg-white shadow-sm border-b border-slate-200 overflow-x-auto custom-scrollbar">
             <div className="flex text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-100 border-b border-slate-200 min-w-max">
                <div className="w-6 text-center shrink-0">#</div>
                <div className="w-40 text-left pl-2 shrink-0">Clube</div>
                <div className="w-8 text-center shrink-0" title="Pontos">P</div>
                <div className="w-8 text-center shrink-0" title="Jogos">J</div>
                <div className="w-8 text-center shrink-0" title="Vitórias">V</div>
                <div className="w-8 text-center shrink-0" title="Empates">E</div>
                <div className="w-8 text-center shrink-0" title="Derrotas">D</div>
                <div className="w-8 text-center shrink-0" title="Gols Pró">GP</div>
                <div className="w-8 text-center shrink-0" title="Gols Contra">GC</div>
                <div className="w-8 text-center shrink-0" title="Saldo de Gols">SG</div>
             </div>
             <div className="divide-y divide-slate-100 min-w-max">
                {leagueTeams?.sort((a, b) => {
                   const ptsA = a.points || 0;
                   const ptsB = b.points || 0;
                   if (ptsA !== ptsB) return ptsB - ptsA;
                   const sgA = (a.goalsFor || 0) - (a.goalsAgainst || 0);
                   const sgB = (b.goalsFor || 0) - (b.goalsAgainst || 0);
                   if (sgA !== sgB) return sgB - sgA;
                   return (b.goalsFor || 0) - (a.goalsFor || 0);
                }).map((t, idx) => (
                   <div key={t.id} className={`flex items-center px-4 py-2.5 text-sm transition-colors ${t.id === team.id ? 'bg-teal-50/70 border-l-4 border-teal-600' : 'border-l-4 border-transparent hover:bg-slate-50'}`}>
                      <div className={`w-6 text-center text-xs font-bold shrink-0 ${idx < 4 ? 'text-blue-600' : idx > (leagueTeams.length - 4) ? 'text-red-500' : 'text-slate-500'}`}>{idx + 1}</div>
                      <div className="w-40 flex items-center gap-2 pl-2 truncate font-medium shrink-0">
                         {t.logo ? <img src={t.logo} className="w-5 h-5 rounded-full object-cover shadow-sm bg-white" /> : <div className="w-5 h-5 rounded-full bg-slate-200"></div>}
                         <span className="truncate text-slate-800">{t.name}</span>
                         {t.id === team.id && <span className="bg-teal-600 text-white text-[8px] px-1.5 py-0.5 rounded ml-1 font-bold uppercase tracking-wider">Você</span>}
                      </div>
                      
                      <div className="w-8 text-center font-black text-slate-800 shrink-0">{t.points || 0}</div>
                      <div className="w-8 text-center text-slate-500 text-xs font-bold shrink-0">{t.played || 0}</div>
                      <div className="w-8 text-center text-emerald-600 text-xs font-bold shrink-0">{t.wins || 0}</div>
                      <div className="w-8 text-center text-slate-500 text-xs font-bold shrink-0">{t.draws || 0}</div>
                      <div className="w-8 text-center text-red-500 text-xs font-bold shrink-0">{t.losses || 0}</div>
                      <div className="w-8 text-center text-slate-600 text-xs font-bold shrink-0">{t.goalsFor || 0}</div>
                      <div className="w-8 text-center text-slate-600 text-xs font-bold shrink-0">{t.goalsAgainst || 0}</div>
                      <div className="w-8 text-center font-bold text-[10px] text-slate-500 shrink-0">{(t.goalsFor || 0) - (t.goalsAgainst || 0)}</div>
                   </div>
                ))}
             </div>
             
             <div className="p-4 bg-slate-50 flex items-center justify-between border-t border-slate-200">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                   {leagueTeams?.reduce((acc, t) => acc + (t.played || 0), 0) || 0} jogos na liga
                </div>
                <button onClick={async () => {
                   if (window.confirm('Tem certeza que deseja iniciar uma nova temporada? Isso irá zerar a tabela atual para todos os times da liga.')) {
                      if (leagueTeams) {
                         db.transaction('rw', db.teams, async () => {
                            for (const t of leagueTeams) {
                               t.played = 0;
                               t.wins = 0;
                               t.draws = 0;
                               t.losses = 0;
                               t.goalsFor = 0;
                               t.goalsAgainst = 0;
                               t.points = 0;
                               await db.teams.put(t);
                            }
                         });
                         alert('Nova temporada iniciada com sucesso!');
                      }
                   }
                }} className="text-[10px] bg-white border border-slate-300 text-slate-600 font-bold px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-800 transition shadow-sm flex items-center gap-1 uppercase tracking-wider">
                   Zerar Tabela / Nova Temporada
                </button>
             </div>
          </div>
        )}

        {mainTab === 'equipe' && activeTab === 'financas' && (
          <div className="p-4 flex flex-col gap-4">
             <div className="bg-teal-700 text-white rounded-xl p-5 shadow-sm">
                <div className="text-teal-100 text-xs font-bold uppercase tracking-wider mb-1">Saldo Atual</div>
                <div className="text-3xl font-black italic">$ {team.money.toLocaleString()}</div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                   <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Receita Mensal</div>
                   <div className="text-lg font-bold text-emerald-600">+$ {(players?.length ? players.length * 12000 : 0).toLocaleString()}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                   <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Folha Salarial</div>
                   <div className="text-lg font-bold text-red-500">-$ {(players?.reduce((acc, p) => acc + Math.floor(p.overall * 800), 0) || 0).toLocaleString()}</div>
                </div>
             </div>

             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-sm text-slate-800 mb-3 border-b pb-2">Patrocinadores</h3>
                <div className="flex items-center justify-between mt-2 p-2 hover:bg-slate-50 rounded">
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black">S</div>
                      <span className="text-xs font-bold text-slate-700">TechCorp Bet</span>
                   </div>
                   <div className="text-xs text-emerald-600 font-bold">+$ 50.000 / mês</div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Bottom Tab Bar */}
      <div className="bg-white border-t border-slate-200 flex items-center justify-between px-6 py-2 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)] sticky bottom-0 z-30 text-[10px] font-bold text-slate-500">
         <button onClick={() => setMainTab('inicio')} className={`flex flex-col items-center gap-1 transition ${mainTab === 'inicio' ? 'text-teal-600' : 'hover:text-teal-600'}`}>
           <LayoutDashboard size={22} className="mb-0.5" />
           Início
         </button>
         <button onClick={() => setMainTab('equipe')} className={`flex flex-col items-center gap-1 transition ${mainTab === 'equipe' ? 'text-teal-600' : 'hover:text-teal-600'}`}>
           <Users size={22} className="mb-0.5" />
           Equipe
         </button>
         <button onClick={() => setMainTab('mercado')} className={`flex flex-col items-center gap-1 transition ${mainTab === 'mercado' ? 'text-teal-600' : 'hover:text-teal-600'}`}>
           <Target size={22} className="mb-0.5" />
           Mercado
         </button>
         <Link to="/match/1" className="flex flex-col items-center gap-1 text-teal-600 transition -mt-6">
           <div className="w-14 h-14 bg-teal-600 rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(13,148,136,0.4)] text-white border-4 border-slate-50">
             <Play size={24} fill="currentColor" className="ml-1" />
           </div>
           Jogar
         </Link>
         <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 hover:text-red-500 transition">
           <ArrowLeft size={22} className="mb-0.5" />
           Sair
         </button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
        .text-shadow-sm { text-shadow: 0px 1px 2px rgba(0,0,0,0.3); }
      `}</style>
    </div>
  );
}
