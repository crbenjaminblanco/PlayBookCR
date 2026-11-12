export type Conference = 'AFC' | 'NFC';

export type Team = {
  id: string;
  city: string;
  name: string;
  abbr: string;
  conference: Conference;
  color: string;
  onColor: string;
};

export const teams: Team[] = [
  { id: 'buf', city: 'Buffalo', name: 'Bills', abbr: 'BUF', conference: 'AFC', color: '#00338D', onColor: '#F4F7FB' },
  { id: 'mia', city: 'Miami', name: 'Dolphins', abbr: 'MIA', conference: 'AFC', color: '#008E97', onColor: '#F4F7FB' },
  { id: 'ne', city: 'New England', name: 'Patriots', abbr: 'NE', conference: 'AFC', color: '#002244', onColor: '#F4F7FB' },
  { id: 'nyj', city: 'New York', name: 'Jets', abbr: 'NYJ', conference: 'AFC', color: '#125740', onColor: '#F4F7FB' },
  { id: 'bal', city: 'Baltimore', name: 'Ravens', abbr: 'BAL', conference: 'AFC', color: '#241773', onColor: '#F4F7FB' },
  { id: 'cin', city: 'Cincinnati', name: 'Bengals', abbr: 'CIN', conference: 'AFC', color: '#FB4F14', onColor: '#0E1525' },
  { id: 'cle', city: 'Cleveland', name: 'Browns', abbr: 'CLE', conference: 'AFC', color: '#311D00', onColor: '#F4F7FB' },
  { id: 'pit', city: 'Pittsburgh', name: 'Steelers', abbr: 'PIT', conference: 'AFC', color: '#FFB612', onColor: '#0E1525' },
  { id: 'hou', city: 'Houston', name: 'Texans', abbr: 'HOU', conference: 'AFC', color: '#03202F', onColor: '#F4F7FB' },
  { id: 'ind', city: 'Indianapolis', name: 'Colts', abbr: 'IND', conference: 'AFC', color: '#002C5F', onColor: '#F4F7FB' },
  { id: 'jax', city: 'Jacksonville', name: 'Jaguars', abbr: 'JAX', conference: 'AFC', color: '#006778', onColor: '#F4F7FB' },
  { id: 'ten', city: 'Tennessee', name: 'Titans', abbr: 'TEN', conference: 'AFC', color: '#0C2340', onColor: '#F4F7FB' },
  { id: 'den', city: 'Denver', name: 'Broncos', abbr: 'DEN', conference: 'AFC', color: '#FB4F14', onColor: '#0E1525' },
  { id: 'kc', city: 'Kansas City', name: 'Chiefs', abbr: 'KC', conference: 'AFC', color: '#E31837', onColor: '#F4F7FB' },
  { id: 'lv', city: 'Las Vegas', name: 'Raiders', abbr: 'LV', conference: 'AFC', color: '#000000', onColor: '#F4F7FB' },
  { id: 'lac', city: 'Los Angeles', name: 'Chargers', abbr: 'LAC', conference: 'AFC', color: '#0080C6', onColor: '#F4F7FB' },
  { id: 'dal', city: 'Dallas', name: 'Cowboys', abbr: 'DAL', conference: 'NFC', color: '#041E42', onColor: '#F4F7FB' },
  { id: 'nyg', city: 'New York', name: 'Giants', abbr: 'NYG', conference: 'NFC', color: '#0B2265', onColor: '#F4F7FB' },
  { id: 'phi', city: 'Philadelphia', name: 'Eagles', abbr: 'PHI', conference: 'NFC', color: '#004C54', onColor: '#F4F7FB' },
  { id: 'was', city: 'Washington', name: 'Commanders', abbr: 'WAS', conference: 'NFC', color: '#5A1414', onColor: '#F4F7FB' },
  { id: 'chi', city: 'Chicago', name: 'Bears', abbr: 'CHI', conference: 'NFC', color: '#0B162A', onColor: '#F4F7FB' },
  { id: 'det', city: 'Detroit', name: 'Lions', abbr: 'DET', conference: 'NFC', color: '#0076B6', onColor: '#F4F7FB' },
  { id: 'gb', city: 'Green Bay', name: 'Packers', abbr: 'GB', conference: 'NFC', color: '#203731', onColor: '#F4F7FB' },
  { id: 'min', city: 'Minnesota', name: 'Vikings', abbr: 'MIN', conference: 'NFC', color: '#4F2683', onColor: '#F4F7FB' },
  { id: 'atl', city: 'Atlanta', name: 'Falcons', abbr: 'ATL', conference: 'NFC', color: '#A71930', onColor: '#F4F7FB' },
  { id: 'car', city: 'Carolina', name: 'Panthers', abbr: 'CAR', conference: 'NFC', color: '#0085CA', onColor: '#F4F7FB' },
  { id: 'no', city: 'New Orleans', name: 'Saints', abbr: 'NO', conference: 'NFC', color: '#D3BC8D', onColor: '#0E1525' },
  { id: 'tb', city: 'Tampa Bay', name: 'Buccaneers', abbr: 'TB', conference: 'NFC', color: '#D50A0A', onColor: '#F4F7FB' },
  { id: 'ari', city: 'Arizona', name: 'Cardinals', abbr: 'ARI', conference: 'NFC', color: '#97233F', onColor: '#F4F7FB' },
  { id: 'lar', city: 'Los Angeles', name: 'Rams', abbr: 'LAR', conference: 'NFC', color: '#003594', onColor: '#F4F7FB' },
  { id: 'sf', city: 'San Francisco', name: '49ers', abbr: 'SF', conference: 'NFC', color: '#AA0000', onColor: '#F4F7FB' },
  { id: 'sea', city: 'Seattle', name: 'Seahawks', abbr: 'SEA', conference: 'NFC', color: '#002244', onColor: '#F4F7FB' },
];

export function teamById(id: string | null | undefined): Team | undefined {
  return teams.find((team) => team.id === id);
}

export function teamLabel(team: Team): string {
  return `${team.city} ${team.name}`;
}
