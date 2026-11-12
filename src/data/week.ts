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
};

function side(teamId: string, record: string, rushOff: number, passOff: number, rushDef: number, passDef: number, extra?: string): WeekSide {
  const host = injuryHost[teamId];
  const recent = extra && !extra.includes('-') ? extra : undefined;
  return {
    teamId,
    record,
    offense: { rush: rushOff, pass: passOff },
    defense: { rush: rushDef, pass: passDef },
    injuryReportUrl: host ? `https://${host}/team/injury-report/week/reg-10` : 'https://www.nfl.com/injuries/',
    recent,
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

export const weekGames: WeekGame[] = [
  {
    id: 'was-nyg',
    kickoff: '7:15 p.m.',
    stadium: 'MetLife Stadium',
    favoriteId: 'nyg',
    margin: 3,
    homeScore: 22,
    awayScore: 19,
    away: side('was', '2-5-1', 25, 17, 11, 25, 'LTLWL'),
    home: side('nyg', '5-2-1', 21, 17, 11, 20, 'WTLWW'),
  },
  {
    id: 'ne-det',
    kickoff: '8:30 a.m.',
    stadium: 'Allianz Arena, Múnich',
    favoriteId: 'det',
    margin: 3,
    homeScore: 27,
    awayScore: 24,
    away: side('ne', '5-4', 16, 4, 15, 20, 'WWLWL'),
    home: side('det', '6-2', 9, 11, 8, 30, 'LWWWW'),
  },
  {
    id: 'kc-atl',
    kickoff: '12:00 p.m.',
    stadium: 'Mercedes-Benz Stadium',
    favoriteId: 'kc',
    margin: 3,
    homeScore: 22,
    awayScore: 25,
    away: side('kc', '6-2', 9, 13, 5, 2, 'WWLLW'),
    home: side('atl', '3-6', 11, 21, 21, 20, 'LLWLL'),
  },
  {
    id: 'hou-cle',
    kickoff: '12:00 p.m.',
    stadium: 'Huntington Bank Field',
    favoriteId: 'hou',
    margin: 5,
    homeScore: 18,
    awayScore: 23,
    away: side('hou', '3-5', 21, 7, 19, 10, 'LWWLW'),
    home: side('cle', '5-4', 21, 26, 15, 10, 'LWWLL'),
  },
  {
    id: 'min-gb',
    kickoff: '12:00 p.m.',
    stadium: 'Lambeau Field',
    favoriteId: 'gb',
    margin: 3,
    homeScore: 22,
    awayScore: 19,
    away: side('min', '6-2', 32, 27, 5, 1, 'WWWLL'),
    home: side('gb', '6-3', 21, 3, 26, 15, 'WWLWW'),
  },
  {
    id: 'mia-ind',
    kickoff: '12:00 p.m.',
    stadium: 'Lucas Oil Stadium',
    favoriteId: 'ind',
    margin: 4,
    homeScore: 22,
    awayScore: 18,
    away: side('mia', '1-7', 16, 29, 8, 25, 'LLWLL'),
    home: side('ind', '2-7', 4, 29, 19, 25, 'LLLLL'),
  },
  {
    id: 'car-no',
    kickoff: '12:00 p.m.',
    stadium: 'Caesars Superdome',
    favoriteId: 'no',
    margin: 3,
    homeScore: 26,
    awayScore: 23,
    away: side('car', '3-5', 16, 7, 32, 10, 'WWLLL'),
    home: side('no', '3-5', 16, 13, 26, 15, 'LLWLW'),
  },
  {
    id: 'buf-nyj',
    kickoff: '12:00 p.m.',
    stadium: 'MetLife Stadium',
    favoriteId: 'buf',
    margin: 9,
    homeScore: 21,
    awayScore: 30,
    away: side('buf', '7-1', 1, 17, 11, 24, 'LWWWW'),
    home: side('nyj', '2-7', 25, 17, 21, 25, 'WLLLL'),
  },
  {
    id: 'jax-ten',
    kickoff: '12:00 p.m.',
    stadium: 'Nissan Stadium',
    favoriteId: 'jax',
    margin: 11,
    homeScore: 18,
    awayScore: 29,
    away: side('jax', '6-2', 13, 4, 5, 4, 'WWLWW'),
    home: side('ten', '1-7', 13, 29, 21, 7, 'LLWLL'),
  },
  {
    id: 'lar-ari',
    kickoff: '3:05 p.m.',
    stadium: 'State Farm Stadium',
    favoriteId: 'lar',
    margin: 10,
    homeScore: 15,
    awayScore: 25,
    away: side('lar', '5-4', 4, 7, 2, 7, 'LLWWW'),
    home: side('ari', '3-6', 29, 15, 21, 31, 'LWLWL'),
  },
  {
    id: 'sea-lv',
    kickoff: '3:05 p.m.',
    stadium: 'Allegiant Stadium',
    favoriteId: 'sea',
    margin: 7,
    homeScore: 17,
    awayScore: 24,
    away: side('sea', '5-4', 16, 11, 11, 5, 'LLWLW'),
    home: side('lv', '4-5', 25, 2, 30, 32, 'LLLWL'),
  },
  {
    id: 'sf-dal',
    kickoff: '3:25 p.m.',
    stadium: 'AT&T Stadium',
    favoriteId: 'sf',
    margin: 4,
    homeScore: 26,
    awayScore: 30,
    away: side('sf', '7-1', 3, 6, 2, 7, 'WWWLW'),
    home: side('dal', '4-5', 4, 7, 26, 25, 'LLWLW'),
  },
  {
    id: 'pit-cin',
    kickoff: '7:20 p.m.',
    stadium: 'Paycor Stadium',
    favoriteId: 'cin',
    margin: 4,
    homeScore: 27,
    awayScore: 23,
    away: side('pit', '6-2', 29, 15, 2, 2, 'LWWWW'),
    home: side('cin', '6-2', 25, 1, 15, 5, 'LWWWW'),
  },
  {
    id: 'lac-bal',
    kickoff: '7:15 p.m.',
    stadium: 'M&T Bank Stadium',
    favoriteId: 'bal',
    margin: 5,
    homeScore: 22,
    awayScore: 17,
    away: side('lac', '0-8', 29, 28, 26, 15, 'LLLLL'),
    home: side('bal', '4-5', 4, 23, 30, 10, 'WLLLL'),
  },
];

export function weekBoard() {
  return JSON.stringify(weekGames);
}
