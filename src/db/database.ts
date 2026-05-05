import Dexie, { type EntityTable } from 'dexie';

export interface SaveGame {
  id?: number;
  name: string;
  managerName: string;
  currentTeamId: number | null;
  currentDate: string; // ISO format
}

export interface League {
  id?: number;
  name: string;
  country: string;
  level: number;
  logo?: string;
  type?: 'league' | 'competition';
}

export interface Team {
  id?: number;
  name: string;
  leagueId: number;
  reputation: number;
  money: number;
  overallForce: number;
  color: string;
  logo: string;
  stadiumName?: string;
  stadiumCapacity?: number;
  stadiumImage?: string;
  isPlayerReady?: boolean; // flag if players were generated
  // Season Stats
  played?: number;
  wins?: number;
  draws?: number;
  losses?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  points?: number;
}

export interface Player {
  id?: number;
  name: string;
  teamId: number;
  age: number;
  overall: number;
  potential: number;
  foot: 'L' | 'R' | 'Both';
  position: 'GK' | 'DEF' | 'MID' | 'ATK';
  style: string;
  isPromise: boolean;
  photo?: string;
  shirtNumber?: number;
  skills?: string[];
}

export interface Match {
  id?: number;
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number;
  awayScore: number;
  isPlayed: boolean;
  date: string;
}

export interface MatchEvent {
  id?: number;
  matchId: number;
  minute: number;
  type: 'GOAL' | 'CARD_YELLOW' | 'CARD_RED' | 'SUB' | 'INFO';
  teamId: number;
  playerId?: number;
  description: string;
}

const db = new Dexie('FootballSimDB') as Dexie & {
  saves: EntityTable<SaveGame, 'id'>;
  leagues: EntityTable<League, 'id'>;
  teams: EntityTable<Team, 'id'>;
  players: EntityTable<Player, 'id'>;
  matches: EntityTable<Match, 'id'>;
  matchEvents: EntityTable<MatchEvent, 'id'>;
};

// Version 3 para suportar a busca de duplicatas, limpeza e novas colunas (stadium, photo, logo)
db.version(3).stores({
  saves: '++id',
  leagues: '++id, country',
  teams: '++id, leagueId, name',
  players: '++id, teamId',
  matches: '++id, homeTeamId, awayTeamId, isPlayed, date',
  matchEvents: '++id, matchId',
});

// Helper for logo generating via UI-Avatars if no explicit logo is provided
const getLogo = (name: string, hexColor: string) => 
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${hexColor.replace('#', '')}&color=fff&size=128&rounded=true&bold=true`;

// Initial Database Seeding Function
export async function seedInitialData() {
  if ((window as any).__dbSeeding) return;
  (window as any).__dbSeeding = true;

  try {
    const isSeededV3 = localStorage.getItem('seed_v3');
    if (isSeededV3 === 'true') {
      const count = await db.leagues.count();
      if (count > 0) return; // Already seeded
    }

    // Wipe old data
    localStorage.removeItem('seed_v2');
    localStorage.removeItem('seed_v3');
    await db.leagues.clear();
    await db.teams.clear();
    await db.players.clear();

    const INITIAL_LEAGUES: League[] = [
      { name: 'Série A', country: 'Brasil', level: 1, type: 'league' },
      { name: 'Série B', country: 'Brasil', level: 2, type: 'league' },
      { name: 'Série C', country: 'Brasil', level: 3, type: 'league' },
      { name: 'Série D', country: 'Brasil', level: 4, type: 'league' },
      { name: 'Premier League', country: 'Inglaterra', level: 1, type: 'league' },
      { name: 'Championship', country: 'Inglaterra', level: 2, type: 'league' },
      { name: 'La Liga', country: 'Espanha', level: 1, type: 'league' },
      { name: 'Segunda División', country: 'Espanha', level: 2, type: 'league' },
      { name: 'Copa Libertadores', country: 'Internacional', level: 1, type: 'competition' },
      { name: 'Champions League', country: 'Internacional', level: 1, type: 'competition' },
    ];

    const leagueIds = new Map();
    for (const l of INITIAL_LEAGUES) {
      const id = await db.leagues.add(l);
      leagueIds.set(l.country + l.name, id);
    }

    const INITIAL_TEAMS = [
      // BRASIL - SERIE A
      { name: 'Flamengo', country: 'Brasil', divisionName: 'Série A', overallForce: 82, color: '#c51315', reputation: 8500 },
      { name: 'Palmeiras', country: 'Brasil', divisionName: 'Série A', overallForce: 83, color: '#006437', reputation: 8500 },
      { name: 'São Paulo', country: 'Brasil', divisionName: 'Série A', overallForce: 80, color: '#ff0000', reputation: 8000 },
      // BRASIL - SERIE B
      { name: 'Santos', country: 'Brasil', divisionName: 'Série B', overallForce: 76, color: '#000000', reputation: 7000 },
      { name: 'Sport', country: 'Brasil', divisionName: 'Série B', overallForce: 74, color: '#ff0000', reputation: 6500 },
      // BRASIL - SERIE C
      { name: 'Náutico', country: 'Brasil', divisionName: 'Série C', overallForce: 68, color: '#ff0000', reputation: 5000 },
      { name: 'Volta Redonda', country: 'Brasil', divisionName: 'Série C', overallForce: 67, color: '#ffff00', reputation: 4500 },
      // BRASIL - SERIE D
      { name: 'Retrô', country: 'Brasil', divisionName: 'Série D', overallForce: 64, color: '#0000ff', reputation: 3000 },
      { name: 'Caxias', country: 'Brasil', divisionName: 'Série D', overallForce: 63, color: '#8b0000', reputation: 3500 },
      
      // INGLATERRA - PREMIER
      { name: 'Man City', country: 'Inglaterra', divisionName: 'Premier League', overallForce: 88, color: '#6CABDD', reputation: 9500 },
      { name: 'Arsenal', country: 'Inglaterra', divisionName: 'Premier League', overallForce: 86, color: '#EF0107', reputation: 9000 },
      { name: 'Bournemouth', country: 'Inglaterra', divisionName: 'Premier League', overallForce: 78, color: '#B50E12', reputation: 7500 },
      // INGLATERRA - CHAMPIONSHIP
      { name: 'Leeds Utd', country: 'Inglaterra', divisionName: 'Championship', overallForce: 75, color: '#FFFFFF', reputation: 6800 },
      { name: 'Sunderland', country: 'Inglaterra', divisionName: 'Championship', overallForce: 73, color: '#FF0000', reputation: 6500 },
    ];

    for (const t of INITIAL_TEAMS) {
      const leagueId = leagueIds.get(t.country + t.divisionName);
      if (!leagueId) continue;

      const teamId = await db.teams.add({
        name: t.name,
        leagueId: leagueId,
        reputation: t.reputation,
        money: 5000000 + (t.overallForce * 100000),
        overallForce: t.overallForce,
        color: t.color,
        logo: getLogo(t.name, t.color),
        isPlayerReady: true // Ready from base gen
      });

      // Gen base players
      const players: Omit<Player, 'id'>[] = [];
      const positions = [
        { pos: 'GK', count: 2 },
        { pos: 'DEF', count: 6 },
        { pos: 'MID', count: 6 },
        { pos: 'ATK', count: 4 }
      ];

      let idCounter = 1;
      for (const group of positions) {
        for (let i = 0; i < group.count; i++) {
            const ovr = Math.max(40, Math.min(99, t.overallForce + Math.floor(Math.random() * 11) - 5));
            const pot = Math.min(99, ovr + Math.floor(Math.random() * 15));
            const age = 16 + Math.floor(Math.random() * 20);

            players.push({
                teamId: teamId as number,
                name: `Base ${group.pos} ${idCounter++}`,
                position: group.pos as any,
                age,
                overall: ovr,
                potential: pot,
                foot: Math.random() > 0.7 ? 'L' : 'R',
                style: 'Base',
                isPromise: pot > ovr + 8 && age < 21,
                photo: `https://ui-avatars.com/api/?name=${group.pos}+${idCounter}&background=random&color=fff`
            });
        }
      }
      await db.players.bulkAdd(players);
    }

    localStorage.setItem('seed_v3', 'true');
  } catch (error) {
    console.error("Error seeding initial data:", error);
  } finally {
    (window as any).__dbSeeding = false;
  }
}

export default db;
