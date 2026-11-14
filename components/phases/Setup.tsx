import { DealButton, InvitePanel, PlayersPanel, PredictionsPanel, SettingsPanel } from '@/components/lobby';
import type { Game, Player } from '@/lib/types';

export function Setup({ game, players, me }: { game: Game; players: Player[]; me: Player }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <div className="space-y-5">
        <InvitePanel game={game} />
        <PlayersPanel game={game} players={players} me={me} />
      </div>
      <div className="space-y-5">
        <PredictionsPanel game={game} players={players} me={me} />
        <SettingsPanel game={game} me={me} />
        <DealButton game={game} players={players} me={me} label="Deal the cards!" />
      </div>
    </div>
  );
}
