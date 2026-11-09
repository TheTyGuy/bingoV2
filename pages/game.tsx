import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Logo } from '@/components/Burst';
import { Playing } from '@/components/phases/Playing';
import { Setup } from '@/components/phases/Setup';
import { Voting } from '@/components/phases/Voting';
import { Won } from '@/components/phases/Won';
import { dealCard, joinGame, leaveGame, MAX_NAME_LENGTH, resolveVote } from '@/lib/actions';
import { normalizeCode, promptsNeeded } from '@/lib/bingo';
import { useGame, useUserId } from '@/lib/useGame';
import { useRememberedName } from '@/lib/useRememberedName';

export default function GamePage() {
  const router = useRouter();
  const code = router.isReady && typeof router.query.code === 'string' ? normalizeCode(router.query.code) : null;
  const uid = useUserId();
  const { game, players } = useGame(code);
  const me = players?.find((p) => p.id === uid);

  useEffect(() => {
    if (router.isReady && !code) router.replace('/');
  }, [router, code]);

  // Deal my card whenever a new round starts (or I joined mid-game).
  const dealing = useRef<number | null>(null);
  useEffect(() => {
    if (!game || !me || game.phase === 'setup') return;
    if (me.round === game.round || dealing.current === game.round) return;
    if (game.prompts.length < promptsNeeded(game.size)) return;
    dealing.current = game.round;
    dealCard(game, me.id);
  }, [game, me]);

  // Close the vote once everyone has voted or time runs out. Every client tries;
  // the transaction makes sure it only resolves once.
  const playerIds = players?.map((p) => p.id).join(',') ?? '';
  useEffect(() => {
    if (!game || game.phase !== 'voting' || !game.claim) return;
    const ids = playerIds.split(',').filter(Boolean);
    const tick = () => resolveVote(game.code, ids);
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [game, playerIds]);

  async function onLeave() {
    if (!code || !uid || !confirm('Leave this game?')) return;
    await leaveGame(code, uid);
    router.push('/');
  }

  let body: React.ReactNode;
  if (!code || game === undefined || players === undefined || !uid) {
    body = <Centered>Loading…</Centered>;
  } else if (game === null) {
    body = (
      <Centered>
        <p>No game with code {code}.</p>
        <Link href="/" className="btn btn-boom mt-4">
          Back home
        </Link>
      </Centered>
    );
  } else if (!me) {
    body = <JoinForm code={code} />;
  } else if (game.phase === 'setup') {
    body = <Setup game={game} players={players} me={me} />;
  } else if (game.phase === 'voting' && game.claim) {
    body = <Voting game={game} players={players} me={me} />;
  } else if (game.phase === 'won' && game.claim) {
    body = <Won game={game} players={players} me={me} />;
  } else {
    body = <Playing game={game} players={players} me={me} />;
  }

  return (
    <>
      <Head>
        <title>{code ? `kaBINGO! · ${code}` : 'kaBINGO!'}</title>
      </Head>
      <header className="sticky top-0 z-20 border-b-[3px] border-ink bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
          <Link href="/" aria-label="kaBINGO! home">
            <Logo size="sm" />
          </Link>
          {code && <span className="chip comic bg-white text-lg tracking-widest">{code}</span>}
          <span className="flex-1" />
          {me && (
            <>
              <span className="hidden truncate font-extrabold sm:inline">{me.name}</span>
              <button type="button" className="btn btn-plain btn-sm" onClick={onLeave}>
                Leave
              </button>
            </>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pt-5 pb-16">{body}</main>
    </>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="comic flex flex-col items-center py-24 text-center text-3xl">{children}</div>;
}

function JoinForm({ code }: { code: string }) {
  const [name, setName] = useRememberedName();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await joinGame(code, name);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="panel mx-auto mt-6 max-w-sm p-5 shadow-comic-lg">
      <h1 className="comic text-3xl">
        Join game <span className="text-pow">{code}</span>
      </h1>
      <label htmlFor="join-name" className="mt-3 block font-extrabold">
        Your name
      </label>
      <input
        id="join-name"
        className="input mt-1"
        value={name}
        maxLength={MAX_NAME_LENGTH}
        autoComplete="nickname"
        autoFocus
        onChange={(e) => setName(e.target.value)}
      />
      <button className="btn btn-pow mt-4 w-full text-2xl" disabled={!name.trim() || busy}>
        {busy ? 'Joining…' : "I'm in!"}
      </button>
      {error && (
        <p role="alert" className="mt-3 font-bold text-pow">
          {error}
        </p>
      )}
    </form>
  );
}
