import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { seedInitialData } from "./db/database";
import Home from "./pages/Home";
import NewGame from "./pages/NewGame";
import Dashboard from "./pages/Dashboard";
import MatchScreen from "./pages/MatchScreen";
import Editor from "./pages/Editor";
import { Trophy } from "lucide-react";

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    seedInitialData().then(() => setDbReady(true));
  }, []);

  if (!dbReady) {
    return <div className="min-h-screen bg-slate-50 text-teal-800 flex items-center justify-center font-sans">
      <div className="text-2xl animate-pulse flex items-center gap-3">
        <Trophy className="text-teal-600" />
        Carregando Dados...
      </div>
    </div>;
  }

  return (
    <BrowserRouter>
      {/* We allow pages to dictate their own width. Mobile screens will restrict internally. */}
      <div className="min-h-screen bg-slate-100 font-sans">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/new-game" element={<NewGame />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/match/:id" element={<MatchScreen />} />
          <Route path="/editor" element={<Editor />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
