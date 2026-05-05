export type MatchEvent = {
  minute: number;
  type: 'GOAL' | 'CARD_YELLOW' | 'CARD_RED' | 'FOUL' | 'SHOT' | 'PENALTY';
  teamId: number;
  playerName: string;
  text: string;
};

export function simulateMatch(homeTeam: { id: number; name: string; force: number }, awayTeam: { id: number; name: string; force: number }, homePlayers: string[], awayPlayers: string[]): { homeScore: number; awayScore: number; events: MatchEvent[] } {
  let homeScore = 0;
  let awayScore = 0;
  const events: MatchEvent[] = [];

  const homeAdvantage = 5;
  const hForce = homeTeam.force + homeAdvantage;
  const aForce = awayTeam.force;
  const totalForce = hForce + aForce || 100;

  for (let minute = 1; minute <= 90; minute++) {
    // 0.05 chance of a significant event per minute
    if (Math.random() < 0.08) {
      const isHome = Math.random() < (hForce / totalForce);
      const team = isHome ? homeTeam : awayTeam;
      const players = isHome ? homePlayers : awayPlayers;
      if (!players || players.length === 0) continue;

      const player = players[Math.floor(Math.random() * players.length)];
      
      const r = Math.random();
      if (r < 0.25) {
        // Goal
        if (isHome) homeScore++; else awayScore++;
        const commentary = [
          `GOLAAAAAAAAAAÇO!! ${player} faz uma pintura! É do ${team.name}!`,
          `GOOOL! ${player} chuta no cantinho e marca para o ${team.name}.`,
          `GOOOOOOOOL! Que batida firme de ${player}! A torcida do ${team.name} vai à loucura!`,
          `É REDE! ${player} aparece bem posicionado e guarda o seu.`
        ];
        events.push({ minute, type: 'GOAL', teamId: team.id, playerName: player, text: commentary[Math.floor(Math.random() * commentary.length)] });
      } else if (r < 0.45) {
        // Shot saved / missed
        const commentary = [
          `Uuuuh! ${player} manda um chutaço que raspa na trave!`,
          `Defesa incrível! ${player} bate cruzado, mas o goleiro salva!`,
          `${player} arrisca de longe e a bola vai na rede pelo lado de fora!`,
          `Que perigo! ${player} cabeceia tirando tinta do travessão!`
        ];
        events.push({ minute, type: 'SHOT', teamId: team.id, playerName: player, text: commentary[Math.floor(Math.random() * commentary.length)] });
      } else if (r < 0.65) {
        // Foul
        const oppPlayer = (!isHome ? homePlayers : awayPlayers)[Math.floor(Math.random() * (!isHome ? homePlayers : awayPlayers).length)];
        const commentary = [
          `Falta dura em ${oppPlayer}. ${player} chega atrasado.`,
          `${player} derruba ${oppPlayer} parando o contra-ataque.`,
          `Jogo parado. ${player} cometeu a falta no meio campo.`
        ];
        events.push({ minute, type: 'FOUL', teamId: team.id, playerName: player, text: commentary[Math.floor(Math.random() * commentary.length)] });
      } else if (r < 0.85) {
        // Yellow card
        const commentary = [
          `Cartão Amarelo para ${player}! Entrada perigosa.`,
          `O árbitro não perdoa e mostra o amarelo para ${player}.`,
          `${player} reclama acintosamente e é advertido com cartão amarelo.`
        ];
        events.push({ minute, type: 'CARD_YELLOW', teamId: team.id, playerName: player, text: commentary[Math.floor(Math.random() * commentary.length)] });
      } else if (r < 0.88) {
        // Red card
        const commentary = [
          `EXPULSO! ${player} recebe o cartão vermelho direto! O ${team.name} está com um a menos!`,
          `Vermelho para ${player}! Que entrada imprudente, o juiz o mandou para o chuveiro mais cedo.`
        ];
        events.push({ minute, type: 'CARD_RED', teamId: team.id, playerName: player, text: commentary[Math.floor(Math.random() * commentary.length)] });
      } else {
        // Penalty? 
        if (Math.random() < 0.5) {
          if (isHome) homeScore++; else awayScore++;
          const commentary = [
            `PÊNALTI MARCADO! ${player} vai pra cobrança... e é GOL! Bola de um lado, goleiro do outro.`,
            `Cobrança perfeita de pênalti! ${player} bate forte e converte para o ${team.name}.`
          ];
          events.push({ minute, type: 'PENALTY', teamId: team.id, playerName: player, text: commentary[Math.floor(Math.random() * commentary.length)] });
        } else {
           const commentary = [
            `PÊNALTI PARA O ${team.name}! ${player} bate e o goleiro espalma!! Que defesaça!`,
            `${player} foi pra marca da cal, bateu forte e mandou por cima do gol! Inacreditável.`
          ];
          events.push({ minute, type: 'PENALTY', teamId: team.id, playerName: player, text: commentary[Math.floor(Math.random() * commentary.length)] });
        }
      }
    }
  }

  return { homeScore, awayScore, events };
}
