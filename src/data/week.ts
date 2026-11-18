export type PhaseRanks = {
  rush: number;
  pass: number;
};

export type WeekSide = {
  teamId: string;
  record: string;
  offense: PhaseRanks;
  defense: PhaseRanks;
  injuryReportUrl: string;
  /** Oldest to newest. W, L or T. Only when a published last-five list was checked. */
  recent?: string;
  /** Season points, only when a published standings table was checked. */
  pointsFor?: number;
  pointsAgainst?: number;
  /** False when phase ranks were not taken from a published table. */
  showPhase?: boolean;
};

export type WeekGame = {
  id: string;
  kickoff: string;
  stadium: string;
  weather?: string;
  home: WeekSide;
  away: WeekSide;
  favoriteId: string;
  margin: number;
  homeScore: number | null;
  awayScore: number | null;
  noteKey?: string;
};

const injuryHost: Record<string, string> = {
  was: 'www.commanders.com',
  nyg: 'www.giants.com',
  ne: 'www.patriots.com',
  det: 'www.detroitlions.com',
  kc: 'www.chiefs.com',
  atl: 'www.atlantafalcons.com',
  hou: 'www.houstontexans.com',
  cle: 'www.clevelandbrowns.com',
  min: 'www.vikings.com',
  gb: 'www.packers.com',
  mia: 'www.miamidolphins.com',
  ind: 'www.colts.com',
  car: 'www.panthers.com',
  no: 'www.neworleanssaints.com',
  buf: 'www.buffalobills.com',
  nyj: 'www.newyorkjets.com',
  jax: 'www.jaguars.com',
  ten: 'www.tennesseetitans.com',
  lar: 'www.therams.com',
  ari: 'www.azcardinals.com',
  sea: 'www.seahawks.com',
  lv: 'www.raiders.com',
  sf: 'www.49ers.com',
  dal: 'www.dallascowboys.com',
  pit: 'www.steelers.com',
  cin: 'www.bengals.com',
  lac: 'www.chargers.com',
  bal: 'www.baltimoreravens.com',
  den: 'www.denverbroncos.com',
  chi: 'www.chicagobears.com',
  tb: 'www.buccaneers.com',
  phi: 'www.philadelphiaeagles.com',
};

function side(
  teamId: string,
  record: string,
  rushOff: number,
  passOff: number,
  rushDef: number,
  passDef: number,
  extra?: string,
  points?: [number, number],
): WeekSide {
  const host = injuryHost[teamId];
  const recent = extra && !extra.includes('-') ? extra : undefined;
  return {
    teamId,
    record,
    offense: { rush: rushOff, pass: passOff },
    defense: { rush: rushDef, pass: passDef },
    injuryReportUrl: host ? `https://${host}/team/injury-report/week/reg-11` : 'https://www.nfl.com/injuries/',
    recent,
    pointsFor: points?.[0],
    pointsAgainst: points?.[1],
    showPhase: false,
  };
}

export function teamStars(side: WeekSide) {
  const [wins, losses, ties = 0] = side.record.split('-').map(Number);
  const games = wins + losses + ties;
  const rate = games ? (wins + ties * 0.5) / games : 0.5;
  const ranks = [side.offense.rush, side.offense.pass, side.defense.rush, side.defense.pass];
  const average = ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length;
  const rankScore = 1 - (average - 1) / 31;
  const blend = rate * 0.6 + rankScore * 0.4;
  return Math.max(1, Math.min(5, Math.round(blend * 5)));
}

/** Final scores from Week 10, 2026. Home ticker only. */
export const weekResults = [
  { awayId: 'was', homeId: 'nyg', awayScore: 24, homeScore: 21 },
  { awayId: 'ne', homeId: 'det', awayScore: 10, homeScore: 35 },
  { awayId: 'kc', homeId: 'atl', awayScore: 35, homeScore: 13 },
  { awayId: 'hou', homeId: 'cle', awayScore: 24, homeScore: 27 },
  { awayId: 'min', homeId: 'gb', awayScore: 30, homeScore: 10 },
  { awayId: 'mia', homeId: 'ind', awayScore: 22, homeScore: 24 },
  { awayId: 'car', homeId: 'no', awayScore: 20, homeScore: 17 },
  { awayId: 'buf', homeId: 'nyj', awayScore: 31, homeScore: 12 },
  { awayId: 'jax', homeId: 'ten', awayScore: 40, homeScore: 23 },
  { awayId: 'lar', homeId: 'ari', awayScore: 34, homeScore: 6 },
  { awayId: 'sea', homeId: 'lv', awayScore: 21, homeScore: 13 },
  { awayId: 'sf', homeId: 'dal', awayScore: 46, homeScore: 40 },
  { awayId: 'pit', homeId: 'cin', awayScore: 18, homeScore: 38 },
  { awayId: 'lac', homeId: 'bal', awayScore: 23, homeScore: 20 },
];

const neutral = [16, 16, 16, 16] as const;

export const weekGames: WeekGame[] = [
  {
    id: 'ind-hou',
    kickoff: '7:15 p.m.',
    stadium: 'NRG Stadium',
    favoriteId: 'hou',
    margin: 12.5,
    homeScore: null,
    awayScore: null,
    away: side('ind', '3-7', ...neutral),
    home: side('hou', '3-6', ...neutral, undefined, [233, 219]),
  },
  {
    id: 'no-chi',
    kickoff: '12:00 p.m.',
    stadium: 'Soldier Field',
    favoriteId: 'chi',
    margin: 11.5,
    homeScore: null,
    awayScore: null,
    away: side('no', '3-6', ...neutral, undefined, [202, 236]),
    home: side('chi', '7-2', ...neutral, undefined, [241, 184]),
  },
  {
    id: 'mia-buf',
    kickoff: '12:00 p.m.',
    stadium: 'Highmark Stadium',
    favoriteId: 'buf',
    margin: 16.5,
    homeScore: null,
    awayScore: null,
    away: side('mia', '1-8', ...neutral),
    home: side('buf', '8-1', ...neutral),
  },
  {
    id: 'ari-kc',
    kickoff: '12:00 p.m.',
    stadium: 'GEHA Field at Arrowhead Stadium',
    favoriteId: 'kc',
    margin: 16.5,
    homeScore: null,
    awayScore: null,
    away: side('ari', '3-7', ...neutral, undefined, [184, 289]),
    home: side('kc', '7-2', ...neutral),
  },
  {
    id: 'ten-dal',
    kickoff: '12:00 p.m.',
    stadium: 'AT&T Stadium',
    favoriteId: 'dal',
    margin: 8.5,
    homeScore: null,
    awayScore: null,
    away: side('ten', '1-8', ...neutral),
    home: side('dal', '4-6', ...neutral, undefined, [286, 282]),
  },
  {
    id: 'tb-det',
    kickoff: '12:00 p.m.',
    stadium: 'Ford Field',
    favoriteId: 'det',
    margin: 6.5,
    homeScore: null,
    awayScore: null,
    away: side('tb', '3-6', ...neutral, undefined, [202, 178]),
    home: side('det', '7-2', ...neutral, undefined, [257, 199]),
  },
  {
    id: 'bal-car',
    kickoff: '12:00 p.m.',
    stadium: 'Bank of America Stadium',
    favoriteId: 'car',
    margin: 2.5,
    homeScore: null,
    awayScore: null,
    away: side('bal', '4-6', ...neutral),
    home: side('car', '4-5', ...neutral, undefined, [219, 236]),
  },
  {
    id: 'pit-phi',
    kickoff: '12:00 p.m.',
    stadium: 'Lincoln Financial Field',
    favoriteId: 'pit',
    margin: 4.5,
    homeScore: null,
    awayScore: null,
    away: side('pit', '6-3', ...neutral, undefined, [198, 182]),
    home: side('phi', '2-7', ...neutral, undefined, [148, 221]),
  },
  {
    id: 'nyj-lac',
    kickoff: '3:05 p.m.',
    stadium: 'SoFi Stadium',
    favoriteId: 'lac',
    margin: 3.5,
    homeScore: null,
    awayScore: null,
    away: side('nyj', '2-8', ...neutral),
    home: side('lac', '1-8', ...neutral),
  },
  {
    id: 'jax-nyg',
    kickoff: '3:25 p.m.',
    stadium: 'MetLife Stadium',
    favoriteId: 'jax',
    margin: 6,
    homeScore: null,
    awayScore: null,
    away: side('jax', '7-2', ...neutral),
    home: side('nyg', '5-3-1', ...neutral, undefined, [203, 196]),
  },
  {
    id: 'lv-den',
    kickoff: '3:25 p.m.',
    stadium: 'Empower Field at Mile High',
    favoriteId: 'den',
    margin: 10,
    homeScore: null,
    awayScore: null,
    away: side('lv', '4-6', ...neutral),
    home: side('den', '7-2', ...neutral, undefined, [198, 186]),
  },
  {
    id: 'min-sf',
    kickoff: '7:20 p.m.',
    stadium: 'Ciudad de México',
    favoriteId: 'sf',
    margin: 3,
    homeScore: null,
    awayScore: null,
    away: side('min', '7-2', ...neutral, undefined, [176, 126]),
    home: side('sf', '8-1', ...neutral, undefined, [281, 196]),
  },
  {
    id: 'cin-was',
    kickoff: '7:15 p.m.',
    stadium: 'Northwest Stadium',
    favoriteId: 'cin',
    margin: 6.5,
    homeScore: null,
    awayScore: null,
    away: side('cin', '7-2', ...neutral),
    home: side('was', '3-5-1', ...neutral, undefined, [196, 223]),
  },
];


export function weekBoard() {
  return JSON.stringify(weekGames);
}
