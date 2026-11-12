export type AdviceTone = 'info' | 'success' | 'warning';

export type AdviceItem = {
  id: string;
  tone: AdviceTone;
  titleKey: string;
  bodyKey: string;
};

export function adviceFor(teamId: string): AdviceItem[] {
  const chiefs = teamId === 'kc';
  return [
    {
      id: 'quiniela',
      tone: 'info',
      titleKey: 'advice.quinielaTitle',
      bodyKey: chiefs ? 'advice.quinielaChiefs' : 'advice.quinielaGeneric',
    },
    {
      id: 'start',
      tone: 'success',
      titleKey: 'advice.fantasyTitle',
      bodyKey: chiefs ? 'advice.fantasyChiefs' : 'advice.fantasyGeneric',
    },
    {
      id: 'sit',
      tone: 'warning',
      titleKey: 'advice.sitTitle',
      bodyKey: chiefs ? 'advice.sitChiefs' : 'advice.sitGeneric',
    },
  ];
}

export const demoStats = [
  { id: 'pass', value: '312', labelKey: 'stats.pass', player: 'Patrick Mahomes', teamId: 'kc' },
  { id: 'rush', value: '118', labelKey: 'stats.rush', player: 'Derrick Henry', teamId: 'bal' },
  { id: 'rec', value: '9', labelKey: 'stats.rec', player: 'CeeDee Lamb', teamId: 'dal' },
  { id: 'def', value: '4', labelKey: 'stats.def', player: 'Micah Parsons', teamId: 'gb' },
] as const;
