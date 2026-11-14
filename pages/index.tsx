import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState, type FormEvent } from 'react';
import { Logo } from '@/components/Burst';
import { createGame, joinGame, MAX_NAME_LENGTH } from '@/lib/actions';
import { backend } from '@/lib/backend';
import { normalizeCode } from '@/lib/bingo';
import { useRememberedName } from '@/lib/useRememberedName';

const STEPS = [
  { title: 'Gather the crew', body: 'Start a game and share the 4-letter code or QR. Everyone plays on their own phone.', color: 'bg-zap' },
  { title: 'Make predictions', body: 'Together, list things you just KNOW will happen tonight. Or grab a starter pack.', color: 'bg-white' },
  { title: 'Watch for it', body: 'Everyone gets a shuffled card. Mark squares as they happen in real life.', color: 'bg-white' },
  { title: 'Call kaBINGO!', body: 'Complete the pattern and call it! The table votes on whether it was legit.', color: 'bg-pow text-white' },
];

export default function Home() {
  const router = useRouter();
  const [name, setName] = useRememberedName();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState<'create' | 'join' | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof router.query.code === 'string') setCode(normalizeCode(router.query.code));
  }, [router.query.code]);

  async function onCreate() {
    setError('');
    setBusy('create');
    try {
      const newCode = await createGame(name);
      await router.push(`/game?code=${newCode}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  }

  async function onJoin(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (code.length !== 4) return setError('Game codes are 4 letters.');
    setBusy('join');
    try {
      await joinGame(code, name);
      await router.push(`/game?code=${code}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(null);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pt-4 pb-16">
      <Logo />
      <p className="caption mx-auto -mt-2 block w-fit text-center text-xl sm:text-2xl">Predict the party. Call it first.</p>

      <section className="panel mx-auto mt-8 max-w-md p-5 shadow-comic-lg">
        <label htmlFor="name" className="comic text-2xl">
          Your name
        </label>
        <input
          id="name"
          className="input mt-1"
          placeholder="e.g. Aunt Linda"
          value={name}
          maxLength={MAX_NAME_LENGTH}
          autoComplete="nickname"
          onChange={(e) => setName(e.target.value)}
        />

        <button className="btn btn-pow mt-4 w-full text-2xl" onClick={onCreate} disabled={!name.trim() || busy !== null}>
          {busy === 'create' ? 'Setting up…' : 'Start a new game'}
        </button>

        <div className="comic my-4 flex items-center gap-3 text-lg text-muted">
          <span className="h-[3px] flex-1 bg-ink/20" /> or join one <span className="h-[3px] flex-1 bg-ink/20" />
        </div>

        <form onSubmit={onJoin} className="flex gap-2">
          <input
            aria-label="Game code"
            className="input comic w-auto min-w-0 flex-1 text-center text-2xl tracking-[0.3em] uppercase"
            placeholder="CODE"
            value={code}
            maxLength={4}
            autoCapitalize="characters"
            autoComplete="off"
            onChange={(e) => setCode(normalizeCode(e.target.value))}
          />
          <button className="btn btn-boom" disabled={!name.trim() || code.length !== 4 || busy !== null}>
            {busy === 'join' ? '…' : 'Join'}
          </button>
        </form>

        {error && (
          <p role="alert" className="mt-3 rounded-lg border-2 border-pow bg-pow/10 px-3 py-2 font-bold text-pow">
            {error}
          </p>
        )}
      </section>

      <section className="mt-12">
        <h2 className="comic text-center text-4xl">How it works</h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className={`panel relative p-4 pt-7 ${s.color} ${i % 2 ? 'rotate-1' : '-rotate-1'}`}>
              <span className="comic absolute -top-4 left-3 grid h-9 w-9 place-items-center rounded-full border-[3px] border-ink bg-boom text-xl text-white">
                {i + 1}
              </span>
              <h3 className="comic text-2xl">{s.title}</h3>
              <p className="mt-1 font-semibold">{s.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-center font-bold">
          <Link href="/rules" className="underline decoration-pow decoration-[3px] underline-offset-4">
            Full rules &amp; tips
          </Link>
        </p>
      </section>

      {backend.mode === 'local' && (
        <p className="mx-auto mt-10 max-w-md rounded-lg border-2 border-dashed border-ink/40 p-3 text-center text-sm font-semibold text-muted">
          Demo mode: games live in this browser only. Open a few tabs to play against yourself. Add Firebase settings to
          play across phones.
        </p>
      )}
    </main>
  );
}
