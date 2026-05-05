import { Link } from "react-router-dom";
import { Play, Share2, Globe, Moon, MoreVertical, ShieldCheck, Gift, Calendar as CalendarIcon, Save, Trash2 } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import db, { SaveGame } from "../db/database";
import { useEffect, useState } from "react";

export default function Home() {
  const saves = useLiveQuery(() => db.saves.toArray());
  const teams = useLiveQuery(() => db.teams.toArray());
  
  const deleteSave = async (id: number) => {
     if (window.confirm('Tem certeza que deseja excluir este save?')) {
        await db.saves.delete(id);
     }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* Top Header */}
      <div className="bg-teal-700 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight">Superkickoff</h1>
        <div className="flex items-center gap-4">
          <Share2 size={20} />
          <Globe size={20} />
          <Moon size={20} />
          <MoreVertical size={20} />
        </div>
      </div>

      <div className="flex-1 p-4 max-w-md mx-auto w-full flex flex-col space-y-4">
        
        {/* User Profile Area */}
        <div className="flex items-center gap-3 pt-2 pb-4 border-b border-slate-200">
           <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white text-xl font-bold">E</div>
           <div>
             <div className="text-slate-500 text-sm">treinador_oficial</div>
             <div className="font-bold text-lg text-teal-800">Seu Nome</div>
           </div>
        </div>

        {/* Coins / Video Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border text-center border-slate-200 rounded-xl p-3 shadow-sm flex flex-col items-center justify-center">
             <div className="text-[10px] uppercase font-bold text-teal-700 tracking-wider">SUPERKICKOFF COINS</div>
             <div className="font-bold text-lg flex items-center gap-1 mt-1 text-slate-700">
               <span className="text-yellow-500">🪙</span> 1.500
             </div>
          </div>
          <div className="bg-white border text-center border-slate-200 rounded-xl p-3 shadow-sm flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50">
             <div className="text-[10px] uppercase font-bold text-teal-700 tracking-wider flex items-center gap-1">
               <div className="bg-yellow-400 text-white text-[8px] px-1 rounded">Ad</div>
               Assistir vídeo
             </div>
             <div className="font-bold text-lg flex items-center gap-1 mt-1 text-yellow-600">
               +10 <span className="text-yellow-500">🪙</span>
             </div>
          </div>
        </div>

        {/* Timer row (fake) */}
        <div className="bg-slate-200 rounded-full py-1 text-center text-slate-800 font-bold text-sm">
           23h : 34m : 33s
        </div>

        {/* Rewards grid */}
        <div className="grid grid-cols-3 gap-2">
           <div className="col-span-1 bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 rounded-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[120px] shadow-sm">
             <div className="text-center z-10 p-2">
               <div className="text-xs font-bold text-slate-400 mb-2">Recompensa<br/>diária</div>
               <Gift className="text-yellow-400/50 w-12 h-12 mx-auto" strokeWidth={1} />
             </div>
             <div className="absolute bottom-0 w-full bg-slate-300/50 py-1 text-center mt-auto text-xs font-bold text-slate-500">
               Resgatar 🔒
             </div>
           </div>
           
           <div className="col-span-2 grid grid-cols-2 gap-2">
             <div className="bg-white border border-slate-200 rounded-xl flex items-center justify-center relative shadow-sm">
               <span className="absolute top-1 right-1 text-slate-400 text-xs font-bold">1</span>
               <CalendarIcon className="text-slate-300 w-8 h-8" />
             </div>
             <div className="bg-white border border-slate-200 rounded-xl flex items-center justify-center relative shadow-sm">
               <span className="absolute top-1 right-1 text-slate-400 text-xs font-bold">2</span>
               <ShieldCheck className="text-slate-300 w-8 h-8" />
             </div>
             <div className="bg-white border border-slate-200 rounded-xl flex items-center justify-center relative shadow-sm">
               <span className="absolute top-1 right-1 text-slate-400 text-xs font-bold">3</span>
               <div className="text-slate-300 font-bold text-xl">x1</div>
             </div>
             <div className="bg-white border border-slate-200 rounded-xl flex items-center justify-center relative shadow-sm">
               <span className="absolute top-1 right-1 text-slate-400 text-xs font-bold">4</span>
               <div className="text-yellow-400 font-bold text-xl">x2</div>
             </div>
           </div>
        </div>

         {/* Save Card */}
        {saves && saves.length > 0 ? (
          saves.map(save => {
             const tm = teams?.find(t => t.id === save.currentTeamId);
             return (
               <div key={save.id} className="bg-white border border-slate-200 rounded-xl shadow-md p-4 relative mt-2 flex flex-col items-center text-center">
                 <button onClick={() => deleteSave(save.id!)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition">
                   <Trash2 size={16} />
                 </button>
                 <div className="absolute top-4 left-4 text-xs font-bold text-slate-400">SAVE</div>
                 
                 <img src={tm?.logo} className="w-16 h-16 mt-4 mb-2 object-cover rounded-full" alt="club logo" />
                 <h2 className="text-xl font-bold text-teal-800">{tm?.name || save.name}</h2>
                 <p className="text-sm text-slate-600 mb-4">{save.managerName}</p>
                 
                 <Link to={`/dashboard?saveId=${save.id}`} className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2 transition active:scale-95 shadow-sm">
                    <GamepadIcon /> Carregar
                 </Link>
               </div>
             )
          })
        ) : (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500 mt-2">
             Nenhum jogo salvo ainda.
          </div>
        )}

      </div>
      
      {/* Bottom Floating Bar */}
      <div className="sticky bottom-0 p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex gap-4 px-2">
           <Link to="/editor" className="text-slate-400 hover:text-teal-600 transition"><DatabaseIcon /></Link>
           <Link to="/settings" className="text-slate-400 hover:text-teal-600 transition"><SettingsIcon /></Link>
        </div>
        <Link to="/new-game" className="bg-teal-700 hover:bg-teal-800 text-white py-3 px-8 rounded-full font-bold shadow-md transition active:scale-95">
          Novo jogo
        </Link>
      </div>

    </div>
  );
}

// Minimal icons for aesthetic
const GamepadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/></svg>
);
const DatabaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
);
const SettingsIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
)
