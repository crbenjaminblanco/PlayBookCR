import { Helmet } from '@/src/ui/Helmet';
import type { Team } from '@/src/data/teams';

export function TeamMark({ team, size = 40 }: { team: Team; size?: number }) {
  return <Helmet team={team} size={size} />;
}
