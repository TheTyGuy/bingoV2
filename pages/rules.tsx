import Head from 'next/head';
import Link from 'next/link';
import { Logo } from '@/components/Burst';
import { PatternIcon } from '@/components/PatternIcon';
import { PATTERNS } from '@/lib/bingo';

export default function Rules() {
  return (
    <>
      <Head>
        <title>How to play · kaBINGO!</title>
      </Head>
      <main className="mx-auto max-w-2xl px-4 py-6">
        <Link href="/" aria-label="kaBINGO! home">
          <Logo size="sm" />
        </Link>
        <h1 className="comic mt-4 text-5xl">How to play</h1>

        <section className="panel mt-5 space-y-3 p-5 font-semibold">
          <p>
            <b>kaBINGO!</b> is bingo for any get-together. Instead of numbers, the squares are things your group
            predicts will happen: someone spills a drink, the speech runs long, the dog steals food.
          </p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              <b>Start a game</b> and share the 4-letter code or QR code. Everyone joins on their own phone.
            </li>
            <li>
              <b>Write predictions together.</b> Anyone can add them, and the host can drop in a starter pack. A 3×3 card
              needs 8, 5×5 needs 24, and 7×7 needs 48.
            </li>
            <li>
              <b>The host deals the cards.</b> Everyone gets a different shuffle, with a free space in the middle.
            </li>
            <li>
              <b>Play it cool.</b> When something on your card actually happens, tap the square to mark it.
            </li>
            <li>
              <b>Call kaBINGO!</b> once you complete the winning pattern. Your card pops up on everyone&apos;s screen with
              the winning squares lit up, and the others have 45 seconds to vote. Majority of the votes wins, and ties or
              no-shows go to the caller.
            </li>
            <li>
              <b>Voting no?</b> Tap the squares that didn&apos;t really happen. If the call is rejected, those squares are
              struck out of the caller&apos;s card for the rest of the round, so they have to find another way to win.
            </li>
            <li>
              <b>Approved?</b> The round is theirs. On the score screen, everyone can add or remove predictions (your own,
              or anyone&apos;s if you&apos;re the host), say whether they&apos;re in for another round, and the host deals
              the next one.
            </li>
          </ol>
        </section>

        <section className="panel mt-5 p-5">
          <h2 className="comic text-3xl">Win patterns</h2>
          <ul className="mt-2 space-y-2 font-semibold">
            {PATTERNS.map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <PatternIcon pattern={p.id} className="h-8 w-8" />
                <span>
                  <b>{p.label}:</b> {p.hint.toLowerCase()}.
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel mt-5 space-y-3 p-5 font-semibold">
          <h2 className="comic text-3xl">Host options</h2>
          <p>
            <b>Show everyone&apos;s predictions</b> (on by default). Turn it off for <b>secret mode</b>: you only see the
            predictions you wrote, and you never get your own on your card. Your card is a surprise mix of everyone
            else&apos;s.
          </p>
          <p>
            <b>Show called squares</b> (on by default). A shared list under the board shows every square anyone marks,
            like a caller shouting &ldquo;B-16!&rdquo;. If you missed something that&apos;s on your card too, tap{' '}
            <b>Mark it!</b>. Turn it off if you&apos;d rather keep everyone guessing.
          </p>
        </section>

        <section className="panel mt-5 p-5 font-semibold">
          <h2 className="comic text-3xl">Tips for great predictions</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Mix sure things with long shots so cards don&apos;t fill up too fast.</li>
            <li>Make them specific enough that the table can agree whether it happened.</li>
            <li>Inside jokes are the best ones. Nobody has to know why it&apos;s funny.</li>
            <li>Keep it kind. It&apos;s more fun when the guest of honor is in on it.</li>
          </ul>
        </section>

        <p className="mt-8 text-center">
          <Link href="/" className="btn btn-pow">
            Let&apos;s play
          </Link>
        </p>
      </main>
    </>
  );
}
