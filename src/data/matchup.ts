export type MatchupPlayer = {
  id: string;
  name: string;
  teamId: string;
  role: string;
  initials: string;
  points: string;
  rate: number;
};

export const matchupPlayers: MatchupPlayer[] = [
  { id: 'mahomes', name: 'Patrick Mahomes', teamId: 'kc', role: 'QB', initials: 'PM', points: '23.8', rate: 54 },
  { id: 'allen', name: 'Josh Allen', teamId: 'buf', role: 'QB', initials: 'JA', points: '24.6', rate: 52 },
  { id: 'mccaffrey', name: 'Christian McCaffrey', teamId: 'sf', role: 'RB', initials: 'CM', points: '22.4', rate: 48 },
  { id: 'jefferson', name: 'Justin Jefferson', teamId: 'min', role: 'WR', initials: 'JJ', points: '21.1', rate: 46 },
  { id: 'hill', name: 'Tyreek Hill', teamId: 'mia', role: 'WR', initials: 'TH', points: '22.9', rate: 49 },
];

export const sampleSlate = [
  { homeId: 'kc', homeRecord: '12-3', awayId: 'buf', awayRecord: '11-4' },
  { homeId: 'sf', homeRecord: '11-4', awayId: 'dal', awayRecord: '10-5' },
] as const;
