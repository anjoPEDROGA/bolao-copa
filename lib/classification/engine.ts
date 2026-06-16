import type { Group, Match, Standing } from "@/types";
import {
  isGroupStageMatch,
  isPlaceholderTeamId,
  isValidWorldcupGroupId
} from "@/lib/api/normalizers";

// Lógica pura de classificação da fase de grupos.
// A regra oficial completa da FIFA para múltiplos times empatados pode ser refinada depois.

type HeadToHeadSummary = {
  points: number;
  goalDifference: number;
  goalsFor: number;
};

function isNumericScore(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function cloneStanding(standing: Standing): Standing {
  return { ...standing };
}

function getHeadToHeadSummary(
  teamA: string,
  teamB: string,
  matches: Match[]
): HeadToHeadSummary {
  let points = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  for (const match of matches) {
    if (
      !isGroupStageMatch(match) ||
      !isNumericScore(match.score.home) ||
      !isNumericScore(match.score.away)
    ) {
      continue;
    }

    const involvesPair =
      (match.homeTeamId === teamA && match.awayTeamId === teamB) ||
      (match.homeTeamId === teamB && match.awayTeamId === teamA);

    if (!involvesPair) {
      continue;
    }

    const isTeamAHome = match.homeTeamId === teamA;
    const teamAScore = isTeamAHome ? match.score.home : match.score.away;
    const teamBScore = isTeamAHome ? match.score.away : match.score.home;

    if (teamAScore === null || teamBScore === null) {
      continue;
    }

    goalsFor += teamAScore;
    goalsAgainst += teamBScore;

    if (teamAScore > teamBScore) {
      points += 3;
    } else if (teamAScore === teamBScore) {
      points += 1;
    }
  }

  return {
    points,
    goalDifference: goalsFor - goalsAgainst,
    goalsFor
  };
}

function applyMatchResult(
  homeStanding: Standing,
  awayStanding: Standing,
  homeGoals: number,
  awayGoals: number
): void {
  homeStanding.played += 1;
  awayStanding.played += 1;

  homeStanding.goalsFor += homeGoals;
  homeStanding.goalsAgainst += awayGoals;
  awayStanding.goalsFor += awayGoals;
  awayStanding.goalsAgainst += homeGoals;

  homeStanding.goalDifference =
    homeStanding.goalsFor - homeStanding.goalsAgainst;
  awayStanding.goalDifference =
    awayStanding.goalsFor - awayStanding.goalsAgainst;

  if (homeGoals > awayGoals) {
    homeStanding.won += 1;
    homeStanding.points += 3;
    awayStanding.lost += 1;
    return;
  }

  if (homeGoals < awayGoals) {
    awayStanding.won += 1;
    awayStanding.points += 3;
    homeStanding.lost += 1;
    return;
  }

  homeStanding.drawn += 1;
  awayStanding.drawn += 1;
  homeStanding.points += 1;
  awayStanding.points += 1;
}

// Retorna a estrutura base de um classificado de grupo.
export function createEmptyStanding(
  teamId: string,
  groupId: string
): Standing {
  return {
    teamId,
    groupId,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0
  };
}

// Verifica se a partida é uma partida finalizada válida dentro do grupo informado.
export function isFinishedGroupMatch(match: Match, groupId: string): boolean {
  return (
    isGroupStageMatch(match) &&
    match.groupId === groupId &&
    isNumericScore(match.score.home) &&
    isNumericScore(match.score.away)
  );
}

// Calcula a tabela de um grupo com base nos jogos finalizados.
export function calculateGroupStandings(
  group: Group,
  matches: Match[]
): Standing[] {
  const standingsByTeam = new Map<string, Standing>();

  for (const teamId of group.teamIds) {
    if (isPlaceholderTeamId(teamId)) {
      continue;
    }
    standingsByTeam.set(teamId, createEmptyStanding(teamId, group.id));
  }

  for (const match of matches) {
    if (!isFinishedGroupMatch(match, group.id)) {
      continue;
    }

    const homeStanding = standingsByTeam.get(match.homeTeamId);
    const awayStanding = standingsByTeam.get(match.awayTeamId);

    if (!homeStanding || !awayStanding) {
      continue;
    }

    if (match.score.home === null || match.score.away === null) {
      continue;
    }

    applyMatchResult(
      homeStanding,
      awayStanding,
      match.score.home,
      match.score.away
    );
  }

  return sortStandings(
    Array.from(standingsByTeam.values()).map(cloneStanding),
    matches
  );
}

// Calcula as tabelas de todos os grupos recebidos.
export function calculateAllGroupStandings(
  groups: Group[],
  matches: Match[]
): Record<string, Standing[]> {
  return groups.reduce<Record<string, Standing[]>>((accumulator, group) => {
    if (!isValidWorldcupGroupId(group.id)) {
      accumulator[group.id] = [];
      return accumulator;
    }
    accumulator[group.id] = calculateGroupStandings(group, matches);
    return accumulator;
  }, {});
}

// Ordena uma tabela de grupo usando critérios esportivos determinísticos.
export function sortStandings(
  standings: Standing[],
  matches: Match[]
): Standing[] {
  const cloned = standings.map(cloneStanding);

  return cloned.sort((left, right) => {
    if (left.points !== right.points) {
      return right.points - left.points;
    }

    if (left.goalDifference !== right.goalDifference) {
      return right.goalDifference - left.goalDifference;
    }

    if (left.goalsFor !== right.goalsFor) {
      return right.goalsFor - left.goalsFor;
    }

    const headToHead = compareHeadToHead(left.teamId, right.teamId, matches);
    if (headToHead !== 0) {
      return headToHead;
    }

    return left.teamId.localeCompare(right.teamId, "pt-BR");
  });
}

// Compara dois times apenas pelo confronto direto simplificado.
export function compareHeadToHead(
  teamA: string,
  teamB: string,
  matches: Match[]
): number {
  const summaryA = getHeadToHeadSummary(teamA, teamB, matches);
  const summaryB = getHeadToHeadSummary(teamB, teamA, matches);

  if (summaryA.points !== summaryB.points) {
    return summaryB.points - summaryA.points;
  }

  if (summaryA.goalDifference !== summaryB.goalDifference) {
    return summaryB.goalDifference - summaryA.goalDifference;
  }

  if (summaryA.goalsFor !== summaryB.goalsFor) {
    return summaryB.goalsFor - summaryA.goalsFor;
  }

  return 0;
}
