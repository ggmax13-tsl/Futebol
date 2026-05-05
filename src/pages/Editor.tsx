import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, Edit2, Save, Trash2, UserPlus, ChevronDown, ChevronRight, PlusCircle, LayoutGrid, Users, Info } from "lucide-react";
import db, { League, Team, Player } from "../db/database";
import { COUNTRIES } from "../lib/countries";

export default function Editor() {
  const leagues = useLiveQuery(() => db.leagues.toArray());
  const teams = useLiveQuery(() => db.teams.toArray());
  
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
  const [editingLeague, setEditingLeague] = useState<League | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  // Mobile Views
  const [mobileTab, setMobileTab] = useState<'details' | 'squad'>('squad');
  const [skillsInput, setSkillsInput] = useState('');

  const players = useLiveQuery(
    () => (editingTeam ? db.players.where({ teamId: editingTeam.id }).toArray() : []),
    [editingTeam?.id]
  );

  useEffect(() => {
    if (editingPlayer) {
      setSkillsInput(editingPlayer.skills?.join(', ') || '');
    } else {
      setSkillsInput('');
    }
  }, [editingPlayer]);

  const saveLeague = async () => {
    if (editingLeague) {
      if (editingLeague.id) {
        await db.leagues.put(editingLeague);
      } else {
        await db.leagues.add(editingLeague);
        setEditingLeague(null);
      }
      alert("Liga salva com sucesso!");
    }
  };

  const deleteLeague = async (id?: number) => {
    if (id && window.confirm("Excluir esta liga e todos os seus times?")) {
      const ts = await db.teams.where({ leagueId: id }).toArray();
      for (const t of ts) {
        await db.players.where({ teamId: t.id }).delete();
        await db.teams.delete(t.id!);
      }
      await db.leagues.delete(id);
      if (editingLeague?.id === id) setEditingLeague(null);
    }
  };

  const addNewLeague = () => {
    setEditingTeam(null);
    setEditingPlayer(null);
    setEditingLeague({
      name: "Nova Liga",
      country: "Brasil",
      level: 1,
      type: "league",
      logo: "https://ui-avatars.com/api/?name=NL&background=111827&color=fff&size=128&rounded=false&bold=true"
    });
  };

  const saveTeam = async () => {
    if (editingTeam) {
      if (editingTeam.id) {
        await db.teams.put(editingTeam);
      } else {
        await db.teams.add(editingTeam);
        setEditingTeam(null);
      }
      alert("Clube salvo com sucesso!");
    }
  };

  const deleteTeam = async (id?: number) => {
    if (id && window.confirm("Tem certeza que deseja excluir o clube e todos os seus jogadores?")) {
      await db.players.where({ teamId: id }).delete();
      await db.teams.delete(id);
      if (editingTeam?.id === id) setEditingTeam(null);
    }
  };

  const addNewTeam = () => {
    if (!selectedLeagueId) {
      alert("Selecione uma liga primeiro abrindo-a na lista de Ligas.");
      return;
    }
    setEditingLeague(null);
    setEditingPlayer(null);
    setMobileTab('details');
    setEditingTeam({
      name: "Novo Clube",
      leagueId: selectedLeagueId,
      reputation: 5000,
      money: 1000000,
      overallForce: 60,
      color: "#008080",
      logo: "https://ui-avatars.com/api/?name=NC&background=008080&color=fff&size=128&rounded=true&bold=true",
      stadiumName: "Estádio Municipal",
      stadiumCapacity: 10000,
      stadiumImage: "https://images.unsplash.com/photo-1518605368461-1ee7e57c6b90?q=80&w=600&auto=format&fit=crop",
      isPlayerReady: false
    });
  };

  const savePlayer = async () => {
    if (editingPlayer) {
      const p = { ...editingPlayer, skills: skillsInput.split(',').map(s => s.trim()).filter(s => s.length > 0) };
      if (p.id) {
        await db.players.put(p);
      } else {
        await db.players.add(p);
        setEditingPlayer(null);
      }
      alert("Jogador salvo com sucesso!");
    }
  };

  const deletePlayer = async (id?: number) => {
    if (id && window.confirm("Tem certeza que deseja excluir?")) {
      await db.players.delete(id);
      if (editingPlayer?.id === id) setEditingPlayer(null);
    }
  };

  const addNewPlayer = () => {
    if (!editingTeam || !editingTeam.id) return;
    setEditingPlayer({
      name: "Novo Jogador",
      position: "MID",
      age: 20,
      foot: "R",
      overall: 70,
      potential: 80,
      style: "Standard",
      teamId: editingTeam.id,
      isPromise: false,
      photo: "https://ui-avatars.com/api/?name=NJ&background=cbd5e1&color=334155&size=128&rounded=true&bold=true"
    });
  };

  // Mobile layout state logic
  const showSidebar = !editingLeague && !editingTeam && !editingPlayer;
  const showLeagueEdit = !!editingLeague;
  const showTeamEdit = !!editingTeam && mobileTab === 'details' && !editingPlayer;
  const showPlayerList = !!editingTeam && mobileTab === 'squad' && !editingPlayer;
  const showPlayerEdit = !!editingPlayer;

  return (
    <div className="max-w-7xl mx-auto md:space-y-6 md:px-4 md:py-6 text-slate-800 h-screen md:h-auto flex flex-col">
      <Link to="/" className="hidden md:flex text-teal-600 font-bold hover:text-teal-800 items-center gap-2 mb-2">
        <ArrowLeft size={16} /> Menu Principal
      </Link>
      
      {/* Mobile top bar just to go back to Home if in sidebar view */}
      {showSidebar && (
        <div className="md:hidden bg-teal-700 text-white flex items-center gap-4 px-4 py-4 shadow-md flex-none">
          <Link to="/" className="text-white hover:text-teal-200 transition">
             <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Banco de Dados</h1>
        </div>
      )}

      <div className="bg-slate-50 md:bg-white md:rounded-3xl md:shadow-xl md:border md:border-slate-200 md:p-6 flex flex-col flex-1 h-full md:h-[85vh]">
        
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between flex-shrink-0 mb-6 border-b border-slate-100 pb-4">
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
             <LayoutGrid className="text-teal-600" /> Banco de Dados
          </h1>
          <button onClick={addNewLeague} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-lg transition flex items-center gap-2 shadow">
            <PlusCircle size={18} /> Criar Liga
          </button>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-4 md:gap-6 flex-1 overflow-hidden h-full">
           
           {/* Sidebar Ligas & Clubes */}
           <div className={`md:col-span-1 border-r border-slate-200 flex-col h-full overflow-y-auto custom-scrollbar md:pr-4 ${showSidebar ? 'flex p-4 md:p-0 bg-white md:bg-transparent' : 'hidden md:flex'}`}>
             
             {/* Mobile only add league button */}
             <div className="md:hidden mb-4 border-b border-slate-100 pb-4">
                <button onClick={addNewLeague} className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition">
                  <PlusCircle size={18} /> Criar Nova Liga
                </button>
             </div>

             {/* Group Leagues */}
             <div className="mb-6">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-3 mt-2 border-b border-slate-100 pb-2">Ligas Nacionais</h3>
               {leagues?.filter(l => !l.type || l.type === 'league').map(league => (
                 <div key={league.id} className="mb-2">
                   <div className="flex items-center gap-1">
                     <button 
                      className={`flex-1 text-left font-bold py-3 md:py-2.5 px-3 rounded-xl md:rounded-lg flex items-center justify-between transition-colors ${selectedLeagueId === league.id ? 'bg-teal-50 text-teal-700 border border-teal-200 shadow-sm md:shadow-none' : 'bg-slate-50 md:bg-transparent text-slate-600 hover:bg-slate-100 border border-slate-200 md:border-transparent'}`}
                      onClick={() => setSelectedLeagueId(selectedLeagueId === league.id ? null : league.id!)}
                     >
                       <div className="flex items-center gap-3 md:gap-2">
                         {league.logo ? <img src={league.logo} alt="logo" className="w-8 h-8 md:w-6 md:h-6 object-contain drop-shadow" /> : <div className="w-8 h-8 md:w-6 md:h-6 rounded bg-slate-200"></div>}
                         <span className="truncate">{league.name}</span>
                       </div>
                       {selectedLeagueId === league.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                     </button>
                     <button onClick={() => { setEditingTeam(null); setEditingPlayer(null); setEditingLeague(league); }} className="p-3 md:p-2 text-slate-400 hover:text-teal-600 transition rounded-xl md:rounded-lg hover:bg-slate-100 border border-slate-200 md:border-transparent bg-slate-50 md:bg-transparent">
                       <Edit2 size={18} />
                     </button>
                   </div>
                   
                   {selectedLeagueId === league.id && (
                     <div className="pl-6 mt-2 md:mt-1 space-y-2 md:space-y-1 mb-4 md:mb-0 border-l-2 border-slate-200 ml-4 py-1">
                       {teams?.filter(t => t.leagueId === league.id).map(t => (
                         <button 
                           key={t.id}
                           onClick={() => { setEditingLeague(null); setEditingTeam(t); setEditingPlayer(null); setMobileTab('squad'); }}
                           className={`w-full text-left text-sm lg:text-sm py-2.5 px-3 rounded-lg flex items-center justify-between transition-colors shadow-sm md:shadow-none ${editingTeam?.id === t.id ? 'bg-teal-600 text-white font-bold shadow-md' : 'bg-white md:bg-transparent text-slate-600 hover:bg-slate-100 border md:border-transparent border-slate-200'}`}
                         >
                           <div className="flex items-center gap-3 md:gap-2 truncate">
                             {t.logo ? <img src={t.logo} alt={t.name} className="w-6 h-6 md:w-5 md:h-5 rounded-full object-cover bg-white border border-slate-200 shadow-sm" /> : <div className="w-6 h-6 md:w-5 md:h-5 rounded-full bg-slate-200 text-xs flex items-center justify-center font-bold text-slate-400">{t.name.substring(0,1)}</div>}
                             <span className="truncate font-medium md:font-normal">{t.name}</span>
                           </div>
                         </button>
                       ))}
                       <button onClick={addNewTeam} className="w-full text-left text-sm md:text-xs py-3 md:py-2 px-3 text-teal-600 font-bold bg-white md:bg-transparent hover:bg-teal-50 rounded-lg shadow-sm md:shadow-none transition-colors flex items-center gap-2 mt-2 md:mt-1 border border-slate-200 md:border-transparent">
                         <PlusCircle size={16} /> Adicionar Clube
                       </button>
                     </div>
                   )}
                 </div>
               ))}
             </div>

             <div className="mb-6">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-3 mt-2 border-b border-slate-100 pb-2">Competições</h3>
               {leagues?.filter(l => l.type === 'competition').map(league => (
                 <div key={league.id} className="mb-2">
                   <div className="flex items-center gap-1">
                     <button 
                      className={`flex-1 text-left font-bold py-3 md:py-2.5 px-3 rounded-xl md:rounded-lg flex items-center justify-between transition-colors ${selectedLeagueId === league.id ? 'bg-teal-50 text-teal-700 border border-teal-200 shadow-sm md:shadow-none' : 'bg-slate-50 md:bg-transparent text-slate-600 hover:bg-slate-100 border border-slate-200 md:border-transparent'}`}
                      onClick={() => setSelectedLeagueId(selectedLeagueId === league.id ? null : league.id!)}
                     >
                       <div className="flex items-center gap-3 md:gap-2">
                         {league.logo ? <img src={league.logo} alt="logo" className="w-8 h-8 md:w-6 md:h-6 object-contain drop-shadow" /> : <div className="w-8 h-8 md:w-6 md:h-6 rounded bg-slate-200"></div>}
                         <span className="truncate">{league.name}</span>
                       </div>
                       {selectedLeagueId === league.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                     </button>
                     <button onClick={() => { setEditingTeam(null); setEditingPlayer(null); setEditingLeague(league); }} className="p-3 md:p-2 text-slate-400 hover:text-teal-600 transition rounded-xl md:rounded-lg hover:bg-slate-100 border border-slate-200 md:border-transparent bg-slate-50 md:bg-transparent">
                       <Edit2 size={18} />
                     </button>
                   </div>
                   
                   {selectedLeagueId === league.id && (
                     <div className="pl-6 mt-2 md:mt-1 space-y-2 md:space-y-1 mb-4 md:mb-0 border-l-2 border-slate-200 ml-4 py-1">
                       {teams?.filter(t => t.leagueId === league.id).map(t => (
                         <button 
                           key={t.id}
                           onClick={() => { setEditingLeague(null); setEditingTeam(t); setEditingPlayer(null); setMobileTab('squad'); }}
                           className={`w-full text-left text-sm lg:text-sm py-2.5 px-3 rounded-lg flex items-center justify-between transition-colors shadow-sm md:shadow-none ${editingTeam?.id === t.id ? 'bg-teal-600 text-white font-bold shadow-md' : 'bg-white md:bg-transparent text-slate-600 hover:bg-slate-100 border md:border-transparent border-slate-200'}`}
                         >
                           <div className="flex items-center gap-3 md:gap-2 truncate">
                             {t.logo ? <img src={t.logo} alt={t.name} className="w-6 h-6 md:w-5 md:h-5 rounded-full object-cover bg-white border border-slate-200 shadow-sm" /> : <div className="w-6 h-6 md:w-5 md:h-5 rounded-full bg-slate-200 text-xs flex items-center justify-center font-bold text-slate-400">{t.name.substring(0,1)}</div>}
                             <span className="truncate font-medium md:font-normal">{t.name}</span>
                           </div>
                         </button>
                       ))}
                       <button onClick={addNewTeam} className="w-full text-left text-sm md:text-xs py-3 md:py-2 px-3 text-teal-600 font-bold bg-white md:bg-transparent hover:bg-teal-50 rounded-lg shadow-sm md:shadow-none transition-colors flex items-center gap-2 mt-2 md:mt-1 border border-slate-200 md:border-transparent">
                         <PlusCircle size={16} /> Adicionar Clube
                       </button>
                     </div>
                   )}
                 </div>
               ))}
             </div>
           </div>

           {/* Central Panel: Liga ou Clube */}
           <div className={`md:col-span-1 h-full flex flex-col md:block overflow-y-auto custom-scrollbar md:border-r border-slate-200 md:pr-4 ${showLeagueEdit || showTeamEdit ? 'flex' : 'hidden md:block'}`}>
             {editingLeague ? (
               <div className="space-y-6 md:bg-transparent flex flex-col h-full overflow-y-auto p-4 md:p-0">
                 {/* Mobile Header */}
                 <div className="md:hidden flex items-center gap-3 mb-2 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                    <button onClick={() => setEditingLeague(null)} className="p-2 text-slate-500 rounded-lg hover:bg-slate-100"><ArrowLeft size={18} /></button>
                    <span className="font-bold text-slate-800">Voltar para Ligas</span>
                 </div>
                 
                 <div className="flex flex-col items-center pb-4 md:pb-4 border-b border-slate-200 flex-none">
                    <div className="w-24 h-24 md:w-20 md:h-20 bg-white rounded-2xl md:rounded-xl mb-4 md:mb-3 flex items-center justify-center p-2 border border-slate-200 shadow-md md:shadow-sm">
                      {editingLeague.logo ? <img src={editingLeague.logo} alt="Logo" className="max-w-full max-h-full object-contain" /> : <span className="text-slate-400">Logo</span>}
                    </div>
                    <h3 className="font-black text-slate-800 text-3xl md:text-xl text-center leading-tight">{editingLeague.name}</h3>
                 </div>
                 
                 <div className="space-y-5 md:space-y-4 bg-white md:bg-transparent p-5 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-slate-200 md:border-transparent flex-none">
                   <div className="flex items-center justify-between">
                     <h4 className="text-xs uppercase font-bold text-teal-600 hidden md:block">Editar Liga</h4>
                     {editingLeague.id && (
                       <button onClick={() => deleteLeague(editingLeague.id)} className="text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 md:p-1.5 rounded-lg transition font-bold text-xs flex items-center gap-1 w-full md:w-auto justify-center md:justify-start">
                         <Trash2 size={16} /> Excluir Liga
                       </button>
                     )}
                   </div>
                   
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nome</label>
                     <input type="text" value={editingLeague.name} onChange={e => setEditingLeague({...editingLeague, name: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-xl md:rounded-lg p-3.5 md:p-2.5 text-base md:text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition outline-none" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tipo</label>
                     <select value={editingLeague.type || 'league'} onChange={e => setEditingLeague({...editingLeague, type: e.target.value as 'league' | 'competition'})} className="w-full bg-slate-50 border border-slate-300 rounded-xl md:rounded-lg p-3.5 md:p-2.5 text-base md:text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition outline-none">
                       <option value="league">Liga Nacional</option>
                       <option value="competition">Competição Internacional / Copa</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{editingLeague.type === 'competition' ? 'Continente' : 'País'}</label>
                     <select value={editingLeague.country} onChange={e => setEditingLeague({...editingLeague, country: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-xl md:rounded-lg p-3.5 md:p-2.5 text-base md:text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition outline-none">
                       {editingLeague.type === 'competition' ? (
                         <>
                           <option value="Global">🌍 Global</option>
                           <option value="América do Sul">América do Sul</option>
                           <option value="Europa">Europa</option>
                           <option value="América do Norte">América do Norte</option>
                           <option value="África">África</option>
                           <option value="Ásia">Ásia</option>
                           <option value="Oceania">Oceania</option>
                         </>
                       ) : (
                         COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)
                       )}
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nível / Divisão (1=Primeira)</label>
                     <input type="number" value={editingLeague.level} onChange={e => setEditingLeague({...editingLeague, level: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-300 rounded-xl md:rounded-lg p-3.5 md:p-2.5 text-base md:text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition outline-none" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">URL da Logo</label>
                     <input type="text" value={editingLeague.logo || ""} onChange={e => setEditingLeague({...editingLeague, logo: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-xl md:rounded-lg p-3.5 md:p-2.5 text-base md:text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition outline-none" placeholder="https://..." />
                   </div>
                 </div>

                 <div className="mt-auto md:mt-4 p-4 md:p-0 bg-slate-50 md:bg-transparent sticky bottom-0 z-10 border-t border-slate-200 md:border-transparent">
                   <button onClick={saveLeague} className="w-full py-4 md:py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition text-base md:text-sm flex items-center justify-center gap-2 shadow-lg md:shadow-md">
                     <Save size={18} /> Salvar Liga
                   </button>
                 </div>
               </div>
             ) : editingTeam ? (
               <div className="space-y-0 md:space-y-6 flex flex-col h-full bg-slate-50 md:bg-transparent">
                 
                 {/* Mobile Header with Tabs */}
                 <div className="md:hidden flex flex-col bg-white border-b border-slate-200 shadow-sm z-10">
                    <div className="flex items-center gap-3 p-4">
                      <button onClick={() => setEditingTeam(null)} className="p-2 text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-lg transition"><ArrowLeft size={20} /></button>
                      <div className="flex items-center gap-3">
                        <img src={editingTeam.logo} alt="Logo" className="w-10 h-10 rounded-full border border-slate-200 bg-white object-cover" />
                        <span className="font-bold text-slate-800 text-xl truncate pr-4">{editingTeam.name}</span>
                      </div>
                    </div>
                    <div className="flex border-t border-slate-100">
                      <button 
                        onClick={() => setMobileTab('squad')} 
                        className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex justify-center items-center gap-2 ${mobileTab === 'squad' ? 'border-teal-600 text-teal-700 bg-teal-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                      >
                         <Users size={18} /> Elenco
                      </button>
                      <button 
                        onClick={() => setMobileTab('details')} 
                        className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex justify-center items-center gap-2 ${mobileTab === 'details' ? 'border-teal-600 text-teal-700 bg-teal-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                      >
                         <Info size={18} /> Detalhes
                      </button>
                    </div>
                 </div>

                 {/* Team Details Scrollable Area - ONLY show if on details tab on mobile */}
                 <div className={`flex-1 overflow-y-auto w-full px-4 pt-4 pb-24 md:p-0 bg-transparent ${mobileTab === 'details' ? 'block' : 'hidden md:block'}`}>
                   
                   <div className="hidden md:flex flex-col items-center justify-center pb-4 border-b border-slate-200">
                      <img src={editingTeam.logo} alt="Logo" className="w-20 h-20 rounded-full bg-white mb-3 border-4 shadow border-slate-100 object-cover" />
                      <h3 className="font-bold text-slate-800 text-xl text-center leading-tight">{editingTeam.name}</h3>
                   </div>
                   
                   <div className="space-y-5 md:space-y-4 bg-white md:bg-transparent p-5 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-slate-200 md:border-transparent mt-4 md:mt-0">
                     <div className="flex items-center justify-between">
                       <h4 className="text-xs uppercase font-bold text-teal-600 hidden md:block">Editar Clube</h4>
                       {editingTeam.id && (
                         <button onClick={() => deleteTeam(editingTeam.id)} className="text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 md:p-1.5 rounded-lg transition font-bold text-xs flex items-center justify-center gap-1 w-full md:w-auto">
                           <Trash2 size={16} /> Excluir Clube
                         </button>
                       )}
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nome</label>
                       <input type="text" value={editingTeam.name} onChange={e => setEditingTeam({...editingTeam, name: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-xl md:rounded-lg p-3 md:p-2.5 text-base md:text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition outline-none" />
                     </div>
                     <div className="grid grid-cols-2 gap-4 md:gap-3">
                       <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Caixa ($)</label>
                         <input type="number" value={editingTeam.money} onChange={e => setEditingTeam({...editingTeam, money: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-300 rounded-xl md:rounded-lg p-3 md:p-2.5 text-base md:text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition outline-none" />
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">GER</label>
                         <input type="number" value={editingTeam.overallForce} onChange={e => setEditingTeam({...editingTeam, overallForce: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-300 rounded-xl md:rounded-lg p-3 md:p-2.5 text-xl font-bold text-teal-600 md:text-sm md:font-normal md:text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition outline-none bg-teal-50 md:bg-slate-50 text-center md:text-left" />
                       </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4 md:gap-3">
                       <div className="col-span-2 sm:col-span-1 flex flex-col">
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Cor Primária</label>
                         <input type="color" value={editingTeam.color} onChange={e => setEditingTeam({...editingTeam, color: e.target.value})} className="w-full h-12 md:h-10 bg-slate-50 border border-slate-300 rounded-xl md:rounded-lg cursor-pointer" />
                         <span className="text-[10px] text-slate-400 mt-1 uppercase font-mono">{editingTeam.color}</span>
                       </div>
                       <div className="col-span-2 sm:col-span-1">
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Reputação</label>
                         <input type="number" value={editingTeam.reputation} onChange={e => setEditingTeam({...editingTeam, reputation: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-300 rounded-xl md:rounded-lg p-3 md:p-2.5 text-base md:text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition outline-none" />
                       </div>
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">URL da Logo</label>
                       <input type="text" value={editingTeam.logo} onChange={e => setEditingTeam({...editingTeam, logo: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-xl md:rounded-lg p-3 md:p-2.5 text-base md:text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition outline-none" placeholder="https://..." />
                     </div>
                     
                     <div className="pt-4 md:pt-2">
                       <h4 className="text-[11px] md:text-[10px] uppercase font-bold text-slate-400 mb-3 md:mb-2 border-b border-slate-200 pb-2 md:pb-1 tracking-wider">Estádio / Arena</h4>
                       <div className="space-y-4 md:space-y-2">
                         <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nome</label>
                           <input type="text" value={editingTeam.stadiumName || ""} onChange={e => setEditingTeam({...editingTeam, stadiumName: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-xl md:rounded-lg p-3 md:p-2.5 text-base md:text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition outline-none" />
                         </div>
                         <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Capacidade</label>
                           <input type="number" value={editingTeam.stadiumCapacity || 10000} onChange={e => setEditingTeam({...editingTeam, stadiumCapacity: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-300 rounded-xl md:rounded-lg p-3 md:p-2.5 text-base md:text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition outline-none" />
                         </div>
                         <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Foto (URL)</label>
                           <input type="text" value={editingTeam.stadiumImage || ""} onChange={e => setEditingTeam({...editingTeam, stadiumImage: e.target.value})} className="w-full bg-slate-50 border border-slate-300 rounded-xl md:rounded-lg p-3 md:p-2.5 text-base md:text-sm text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition outline-none" placeholder="https://..." />
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Sticky Save Button for Mobile */}
                 <div className={`fixed md:static w-full md:w-auto bottom-0 left-0 p-4 md:p-0 bg-white md:bg-transparent border-t border-slate-200 md:border-transparent z-20 ${mobileTab === 'details' ? 'block' : 'hidden md:block'}`}>
                    <button onClick={saveTeam} className="w-full py-4 md:py-3 md:mt-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl md:rounded-lg transition text-base md:text-sm flex items-center justify-center gap-2 shadow-lg md:shadow-md">
                      <Save size={18} /> Salvar Clube
                    </button>
                 </div>
               </div>
             ) : (
               <div className="hidden md:flex flex-col items-center justify-center h-full text-slate-400 text-center px-4">
                 <LayoutGrid size={40} className="mb-4 opacity-50" />
                 <p className="text-sm font-medium">Selecione uma Liga ou Clube ao lado <br/> para visualizar ou editar propriedades.</p>
               </div>
             )}
           </div>

           {/* Direita: Jogadores (Lista + Edição) */}
           <div className={`md:col-span-2 h-full flex-col gap-4 overflow-hidden bg-slate-50 md:bg-transparent ${showPlayerList || showPlayerEdit ? 'flex' : 'hidden md:flex'}`}>
             {editingTeam ? (
               <>
                 <div className={`flex items-center justify-between px-4 pt-4 md:px-0 md:pt-0 ${showPlayerList ? 'block' : 'hidden md:flex'}`}>
                    <h3 className="font-bold text-slate-800 text-xl hidden md:block">Elenco <span className="text-slate-400 text-sm font-medium">({players?.length || 0})</span></h3>
                    <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                      <button onClick={addNewPlayer} className="w-full md:w-auto py-3 md:py-2 md:px-4 bg-teal-600 hover:bg-teal-700 border-transparent text-white md:bg-slate-100 md:hover:bg-slate-200 md:border md:border-slate-300 md:text-slate-700 shadow-md md:shadow-none rounded-xl md:rounded-lg text-sm font-bold transition flex items-center justify-center gap-2">
                        <UserPlus size={18} /> Novo Atleta
                      </button>
                    </div>
                 </div>

                 {!editingPlayer ? (
                   // Lista de Jogadores
                   <div className={`md:bg-white md:rounded-xl md:border border-slate-200 flex-1 overflow-y-auto custom-scrollbar md:shadow-sm mt-2 md:mt-0 ${showPlayerList ? 'block' : 'hidden md:block'}`}>
                     {(!players || players.length === 0) ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-white m-4 rounded-2xl shadow-sm border border-slate-200 md:m-0 md:border-0 md:shadow-none">
                          <p className="font-medium text-lg">O elenco está vazio.</p>
                          <p className="text-sm mt-3 text-slate-500">Adicione jogadores clicando no botão acima.</p>
                        </div>
                     ) : (
                       <table className="w-full text-left text-sm text-slate-700 border-collapse">
                        <thead className="bg-slate-100 md:bg-slate-50 text-[10px] uppercase text-slate-500 sticky top-0 font-bold tracking-wider z-10 border-b border-slate-200">
                          <tr>
                            <th className="px-3 md:px-4 py-3">Pos</th>
                            <th className="px-2 md:px-4 py-3">Nome</th>
                            <th className="px-2 md:px-4 py-3 text-center">GER</th>
                            <th className="px-2 md:px-4 py-3 text-center hidden sm:table-cell">Idade</th>
                            <th className="px-2 md:px-4 py-3"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 md:divide-slate-100 bg-white shadow-sm md:shadow-none">
                          {players.map(p => (
                            <tr key={p.id} onClick={() => setEditingPlayer(p)} className="hover:bg-teal-50 cursor-pointer transition group">
                              <td className="px-3 md:px-4 py-3.5 md:py-3 w-12 md:w-16">
                                <span className={`text-[10px] md:text-[11px] font-black uppercase px-1.5 md:px-2 py-1 rounded-md ${p.position==='GK'?'bg-yellow-100 text-yellow-800':p.position==='DEF'?'bg-blue-100 text-blue-800':p.position==='MID'?'bg-emerald-100 text-emerald-800':'bg-red-100 text-red-800'}`}>{p.position}</span>
                              </td>
                              <td className="px-2 md:px-4 py-3.5 md:py-3 font-semibold text-slate-800">
                                <div className="flex items-center gap-2.5 md:gap-3">
                                  {p.photo ? <img src={p.photo} className="w-8 h-8 md:w-8 md:h-8 rounded-full border border-slate-200 object-cover" /> : <div className="w-8 h-8 md:w-8 md:h-8 rounded-full bg-slate-200 border border-slate-300 text-[10px] flex items-center justify-center font-bold text-slate-400">{p.name.substring(0,1)}</div>}
                                  <div className="flex flex-col">
                                    <span className="truncate max-w-[130px] md:max-w-[140px] block leading-tight">{p.name}</span>
                                    {p.isPromise && <span className="text-[9px] text-yellow-600 font-bold block mt-0.5">PROMESSA <span className="text-yellow-500">⭐</span></span>}
                                  </div>
                                </div>
                              </td>
                              <td className="px-2 md:px-4 py-3.5 md:py-3 text-center font-black text-teal-600 text-base md:text-sm">{p.overall}</td>
                              <td className="px-2 md:px-4 py-3.5 md:py-3 text-center text-slate-500 font-medium text-sm md:text-xs hidden sm:table-cell">{p.age}</td>
                              <td className="px-2 md:px-4 py-3.5 md:py-3 text-right w-10">
                                <div className="text-slate-300 group-hover:text-teal-600 p-1 transition">
                                  <ChevronRight size={18} md:size={16} />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                       </table>
                     )}
                   </div>
                 ) : (
                   // Painel de Edição de Jogador
                   <div className="bg-slate-50 md:bg-slate-50 p-4 md:p-6 md:rounded-2xl md:border border-slate-200 flex-1 overflow-y-auto custom-scrollbar md:shadow-inner h-full flex flex-col">
                     <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5 md:mb-6 sticky top-0 bg-slate-50 z-20 md:static">
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-3">
                          <button onClick={() => setEditingPlayer(null)} className="md:hidden p-2 text-slate-600 bg-white shadow-sm border border-slate-200 rounded-lg mr-1 hover:bg-slate-50"><ArrowLeft size={18} /></button>
                          {editingPlayer.photo && <img src={editingPlayer.photo} className="w-10 h-10 rounded-full border border-slate-300 object-cover bg-white hidden sm:block" />}
                          <span className="truncate max-w-[180px] md:max-w-xs">{editingPlayer.name || 'Novo'}</span>
                        </h3>
                        <div className="flex gap-2">
                          {editingPlayer.id && (
                            <button onClick={() => deletePlayer(editingPlayer.id)} className="p-2.5 md:py-2 md:px-3 text-red-500 bg-white hover:bg-red-50 border border-slate-200 md:border-red-100 md:hover:border-red-200 rounded-lg transition shadow-sm font-bold flex items-center gap-2 text-sm" title="Excluir Jogador">
                              <Trash2 size={18} md:size={16} /> <span className="hidden md:inline">Excluir</span>
                            </button>
                          )}
                          <button onClick={() => setEditingPlayer(null)} className="hidden md:flex p-2 text-slate-500 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition" title="Voltar para a Lista">
                            <ArrowLeft size={16} />
                          </button>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 pb-24 md:pb-0">
                       <div className="sm:col-span-2">
                         <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 pl-1">Nome Completo</label>
                         <input type="text" value={editingPlayer.name} onChange={e => setEditingPlayer({...editingPlayer, name: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl md:rounded-xl p-3.5 md:p-3 text-slate-800 text-base md:text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition outline-none shadow-sm font-semibold" />
                       </div>
                       
                       <div className="sm:col-span-2">
                         <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 pl-1">URL da Foto</label>
                         <input type="text" value={editingPlayer.photo || ''} onChange={e => setEditingPlayer({...editingPlayer, photo: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl md:rounded-xl p-3.5 md:p-3 text-slate-800 text-base md:text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition outline-none shadow-sm" placeholder="https://..." />
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4 sm:col-span-2">
                         <div>
                           <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 pl-1">Posição</label>
                           <select value={editingPlayer.position} onChange={e => setEditingPlayer({...editingPlayer, position: e.target.value as Player['position']})} className="w-full bg-white border border-slate-300 rounded-xl md:rounded-xl p-3.5 md:p-3 text-slate-800 font-bold focus:border-teal-500 transition outline-none shadow-sm appearance-none">
                             <option value="GK">GK (Goleiro)</option>
                             <option value="DEF">DEF (Defensor)</option>
                             <option value="MID">MID (Meia)</option>
                             <option value="ATK">ATK (Atacante)</option>
                           </select>
                         </div>
  
                         <div>
                           <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 pl-1">Pé Preferido</label>
                           <select value={editingPlayer.foot} onChange={e => setEditingPlayer({...editingPlayer, foot: e.target.value as Player['foot']})} className="w-full bg-white border border-slate-300 rounded-xl md:rounded-xl p-3.5 md:p-3 text-slate-800 focus:border-teal-500 transition outline-none shadow-sm appearance-none">
                             <option value="R">Destro (R)</option>
                             <option value="L">Canhoto (L)</option>
                             <option value="Both">Ambidestro</option>
                           </select>
                         </div>
                       </div>

                       <div className="sm:col-span-2 grid grid-cols-2 gap-4">
                         <div>
                           <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 pl-1">Estilo de Jogo</label>
                           <input type="text" value={editingPlayer.style} onChange={e => setEditingPlayer({...editingPlayer, style: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl md:rounded-xl p-3.5 md:p-3 text-slate-800 text-base md:text-sm focus:border-teal-500 transition outline-none shadow-sm placeholder-slate-300" placeholder="Ex: Velocista" />
                         </div>
  
                         <div>
                           <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 pl-1">Camisa N°</label>
                           <input type="number" min="1" max="99" value={editingPlayer.shirtNumber || ''} onChange={e => setEditingPlayer({...editingPlayer, shirtNumber: parseInt(e.target.value)})} className="w-full bg-white border border-slate-300 rounded-xl md:rounded-xl p-3.5 md:p-3 text-slate-800 text-center font-bold text-lg md:text-sm focus:border-teal-500 transition outline-none shadow-sm placeholder-slate-300" placeholder="--" />
                         </div>
                       </div>

                       <div className="sm:col-span-2">
                         <label className="block text-xs uppercase font-bold text-slate-500 mb-1.5 pl-1 drop-shadow-sm flex justify-between">
                            Habilidades Especiais
                            <span className="text-slate-400 font-normal lowercase">(separadas por vírgula)</span>
                         </label>
                         <input type="text" value={skillsInput} onChange={e => setSkillsInput(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl md:rounded-xl p-3.5 md:p-3 text-slate-800 text-base md:text-sm focus:border-teal-500 transition outline-none shadow-sm placeholder-slate-300 font-mono" placeholder="Ex: Chute de Longe, Liderança, Cabeceio..." />
                       </div>

                       <div className="grid grid-cols-3 gap-3 sm:col-span-2 mt-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                         <div>
                           <label className="block text-[10px] md:text-xs uppercase font-bold text-slate-500 mb-1.5 text-center">Idade</label>
                           <input type="number" min="15" max="45" value={editingPlayer.age} onChange={e => setEditingPlayer({...editingPlayer, age: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-teal-500 transition outline-none text-center font-black text-xl" />
                         </div>
                         <div>
                           <label className="block text-[10px] md:text-xs uppercase font-bold text-teal-600 mb-1.5 text-center">FORÇA (GER)</label>
                           <input type="number" min="1" max="99" value={editingPlayer.overall} onChange={e => setEditingPlayer({...editingPlayer, overall: parseInt(e.target.value)})} className="w-full bg-teal-50 border border-teal-200 rounded-xl p-3 text-teal-700 font-black text-2xl focus:border-teal-500 transition outline-none text-center" />
                         </div>
                         <div>
                           <label className="block text-[10px] md:text-xs uppercase font-bold text-yellow-600 mb-1.5 text-center overflow-hidden text-ellipsis whitespace-nowrap">POTENCIAL</label>
                           <input type="number" min="1" max="99" value={editingPlayer.potential} onChange={e => setEditingPlayer({...editingPlayer, potential: parseInt(e.target.value)})} className="w-full bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-yellow-600 font-black text-2xl focus:border-yellow-500 transition outline-none text-center" />
                         </div>
                       </div>

                       <div className="sm:col-span-2 pt-2 md:pt-4">
                         <label className="flex items-center gap-4 cursor-pointer p-5 bg-white border border-slate-200 shadow-sm rounded-2xl hover:border-yellow-400 transition group">
                           <div className="relative flex items-center justify-center">
                             <input type="checkbox" checked={editingPlayer.isPromise} onChange={e => setEditingPlayer({...editingPlayer, isPromise: e.target.checked})} className="peer sr-only" />
                             <div className="w-7 h-7 md:w-6 md:h-6 bg-slate-50 border-2 border-slate-300 rounded-md peer-checked:bg-yellow-400 peer-checked:border-yellow-400 transition"></div>
                             {editingPlayer.isPromise && (
                                <svg className="absolute w-5 h-5 md:w-4 md:h-4 text-white pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                             )}
                           </div>
                           <div className="flex-1">
                             <div className="text-sm font-bold text-slate-800 flex items-center gap-2">Jovem Promessa <span className="text-yellow-500 text-lg md:text-base">⭐</span></div>
                             <div className="text-xs text-slate-500 mt-1 md:mt-0.5 leading-tight">Ganho acelerado de atributos nos torneios.</div>
                           </div>
                         </label>
                       </div>
                       
                     </div>

                     <div className="fixed md:static w-full md:w-auto bottom-0 left-0 p-4 md:p-0 bg-white md:bg-transparent border-t border-slate-200 md:border-t-0 z-30 mt-auto md:mt-6">
                       <button onClick={savePlayer} className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg rounded-2xl md:rounded-xl transition shadow-xl md:shadow-md flex items-center justify-center gap-2 transform active:scale-[0.98]">
                         <Save size={22} className="opacity-90" /> Salvar Jogador
                       </button>
                     </div>
                   </div>
                 )}
               </>
             ) : (
                <div className="hidden md:flex flex-col items-center justify-center h-full text-slate-400 text-center px-4">
                 <p className="text-sm font-medium">Selecione um clube primeiro para gerenciar seus jogadores.</p>
               </div>
             )}
           </div>

        </div>
      </div>
      
      <style>{`
        /* Ocultar barra de rolagem geral para celular, mas manter o scroll */
        @media (max-width: 768px) {
          ::-webkit-scrollbar {
             display: none;
          }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #94a3b8; }
      `}</style>
    </div>
  );
}
