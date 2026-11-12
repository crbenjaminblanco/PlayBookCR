export type ProvinceId =
  | 'Alajuela'
  | 'Cartago'
  | 'Guanacaste'
  | 'Heredia'
  | 'Limón'
  | 'Puntarenas'
  | 'San José';

export type Share = {
  teamId: string;
  fans: number;
};

export type ProvinceFanbase = {
  id: ProvinceId;
  shares: Share[];
};

export const provinces: ProvinceFanbase[] = [
  {
    id: 'Guanacaste',
    shares: [
      { teamId: 'dal', fans: 15120 },
      { teamId: 'kc', fans: 8640 },
      { teamId: 'sf', fans: 6480 },
      { teamId: 'mia', fans: 5400 },
      { teamId: 'phi', fans: 5400 },
      { teamId: 'sea', fans: 4860 },
      { teamId: 'gb', fans: 4320 },
      { teamId: 'buf', fans: 3780 },
    ],
  },
  {
    id: 'Alajuela',
    shares: [
      { teamId: 'sf', fans: 20640 },
      { teamId: 'kc', fans: 15480 },
      { teamId: 'gb', fans: 9460 },
      { teamId: 'mia', fans: 9460 },
      { teamId: 'dal', fans: 8600 },
      { teamId: 'ne', fans: 7740 },
      { teamId: 'phi', fans: 7740 },
      { teamId: 'buf', fans: 6880 },
    ],
  },
  {
    id: 'Heredia',
    shares: [
      { teamId: 'ne', fans: 11440 },
      { teamId: 'kc', fans: 8840 },
      { teamId: 'buf', fans: 7280 },
      { teamId: 'dal', fans: 6240 },
      { teamId: 'phi', fans: 5200 },
      { teamId: 'sf', fans: 5200 },
      { teamId: 'bal', fans: 4160 },
      { teamId: 'gb', fans: 3640 },
    ],
  },
  {
    id: 'San José',
    shares: [
      { teamId: 'kc', fans: 28400 },
      { teamId: 'sf', fans: 22720 },
      { teamId: 'dal', fans: 19880 },
      { teamId: 'phi', fans: 15620 },
      { teamId: 'gb', fans: 14200 },
      { teamId: 'ne', fans: 14200 },
      { teamId: 'mia', fans: 14200 },
      { teamId: 'buf', fans: 12780 },
    ],
  },
  {
    id: 'Cartago',
    shares: [
      { teamId: 'gb', fans: 7790 },
      { teamId: 'kc', fans: 6150 },
      { teamId: 'pit', fans: 5330 },
      { teamId: 'dal', fans: 4920 },
      { teamId: 'sf', fans: 4510 },
      { teamId: 'bal', fans: 4100 },
      { teamId: 'phi', fans: 4100 },
      { teamId: 'ne', fans: 4100 },
    ],
  },
  {
    id: 'Limón',
    shares: [
      { teamId: 'mia', fans: 8190 },
      { teamId: 'kc', fans: 5460 },
      { teamId: 'gb', fans: 5460 },
      { teamId: 'tb', fans: 4680 },
      { teamId: 'dal', fans: 4290 },
      { teamId: 'sf', fans: 3900 },
      { teamId: 'no', fans: 3510 },
      { teamId: 'phi', fans: 3510 },
    ],
  },
  {
    id: 'Puntarenas',
    shares: [
      { teamId: 'kc', fans: 8640 },
      { teamId: 'dal', fans: 7200 },
      { teamId: 'gb', fans: 7200 },
      { teamId: 'sea', fans: 5760 },
      { teamId: 'sf', fans: 5280 },
      { teamId: 'lv', fans: 4800 },
      { teamId: 'mia', fans: 4800 },
      { teamId: 'phi', fans: 4320 },
    ],
  },
];

export function provinceFans(province: ProvinceFanbase): number {
  return province.shares.reduce((total, share) => total + share.fans, 0);
}

export function teamFans(province: ProvinceFanbase, teamId: string | null): number {
  if (!teamId) return provinceFans(province);
  return province.shares.find((share) => share.teamId === teamId)?.fans ?? 0;
}

export function leadingShare(province: ProvinceFanbase): Share {
  return province.shares.reduce((best, share) => (share.fans > best.fans ? share : best));
}

export function countryShares(list: ProvinceFanbase[] = provinces): Share[] {
  const totals = new Map<string, number>();
  for (const province of list) {
    for (const share of province.shares) {
      totals.set(share.teamId, (totals.get(share.teamId) ?? 0) + share.fans);
    }
  }
  return [...totals.entries()]
    .map(([teamId, fans]) => ({ teamId, fans }))
    .sort((a, b) => b.fans - a.fans);
}
