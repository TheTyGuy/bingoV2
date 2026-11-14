import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FREE,
  dealShortfall,
  eligiblePrompts,
  promptVisible,
  struckFromVotes,
  centerIndex,
  hasWon,
  makeCard,
  makeGameCode,
  normalizeCode,
  promptsNeeded,
  shuffle,
  squaresToWin,
  voteOutcome,
  winningCells,
} from './bingo.ts';

const ids = (n: number) => Array.from({ length: n }, (_, i) => `p${i}`);

test('promptsNeeded leaves room for the free space', () => {
  assert.equal(promptsNeeded(3), 8);
  assert.equal(promptsNeeded(5), 24);
  assert.equal(promptsNeeded(7), 48);
});

test('shuffle keeps every item exactly once', () => {
  const input = ids(30);
  const out = shuffle(input);
  assert.equal(out.length, 30);
  assert.deepEqual([...out].sort(), [...input].sort());
});

test('makeCard puts the free space in the center and uses unique prompts', () => {
  for (const size of [3, 5, 7]) {
    const card = makeCard(ids(60), size);
    assert.equal(card.length, size * size);
    assert.equal(card[centerIndex(size)], FREE);
    assert.equal(new Set(card).size, card.length);
  }
});

test('makeCard refuses when there are not enough prompts', () => {
  assert.throws(() => makeCard(ids(23), 5));
});

test('line: a row wins, the free space counts', () => {
  // 5x5 middle row is 10..14, center 12 is free
  assert.equal(hasWon([10, 11, 13, 14], 5, 'line'), true);
  assert.equal(squaresToWin([10, 11, 13], 5, 'line'), 1);
  assert.deepEqual(winningCells([10, 11, 13, 14], 5, 'line'), [10, 11, 12, 13, 14]);
});

test('line: columns and diagonals win', () => {
  assert.equal(hasWon([0, 5, 10, 15, 20], 5, 'line'), true);
  assert.equal(hasWon([0, 6, 18, 24], 5, 'line'), true);
  assert.equal(hasWon([4, 8, 16, 20], 5, 'line'), true);
  assert.equal(hasWon([0, 1, 2, 3], 5, 'line'), false);
});

test('corners, X and blackout', () => {
  assert.equal(hasWon([0, 4, 20, 24], 5, 'corners'), true);
  assert.equal(squaresToWin([0, 4, 20], 5, 'corners'), 1);
  assert.equal(hasWon([0, 6, 18, 24, 4, 8, 16, 20], 5, 'x'), true);
  assert.equal(squaresToWin([0, 6, 18, 24], 5, 'x'), 4);
  assert.equal(squaresToWin([], 3, 'blackout'), 8);
  assert.equal(hasWon([0, 1, 2, 3, 5, 6, 7, 8], 3, 'blackout'), true);
});

test('voteOutcome waits for votes or the deadline', () => {
  const voters = ['a', 'b', 'c'];
  assert.equal(voteOutcome({ a: true }, voters, false), null);
  assert.equal(voteOutcome({ a: true, b: false, c: true }, voters, false), 'approved');
  assert.equal(voteOutcome({ a: false, b: false, c: true }, voters, false), 'rejected');
  assert.equal(voteOutcome({ a: false }, voters, true), 'rejected');
  assert.equal(voteOutcome({ a: true, b: false }, voters, true), 'approved'); // tie goes to caller
  assert.equal(voteOutcome({}, voters, true), 'approved'); // silence goes to caller
  assert.equal(voteOutcome({}, [], false), 'approved'); // solo game
});

test('game codes are 4 unambiguous letters', () => {
  for (let i = 0; i < 200; i++) assert.match(makeGameCode(), /^[A-HJ-NP-Z]{4}$/);
  assert.equal(normalizeCode(' ab-c d9 '), 'ABCD');
});

test('struck squares block every line through them', () => {
  // 3x3: struck 3 kills the middle row and the left column
  assert.equal(squaresToWin([5], 3, 'line', [3]), 2); // best open line (right column 2,5,8) still needs 2 and 8
  assert.equal(squaresToWin([], 3, 'blackout', [0]), Infinity);
  assert.equal(squaresToWin([0, 4, 20], 5, 'corners', [24]), Infinity);
});

test('struckFromVotes keeps squares flagged by at least half of the no voters', () => {
  assert.deepEqual(struckFromVotes({ a: { legit: false, flagged: [3, 5] } }), [3, 5]);
  assert.deepEqual(
    struckFromVotes({
      a: { legit: false, flagged: [3] },
      b: { legit: false, flagged: [3, 5] },
      c: { legit: false, flagged: [7] },
      d: { legit: true, flagged: [] },
    }),
    [3],
  );
  assert.deepEqual(struckFromVotes({ a: { legit: true, flagged: [] } }), []);
});

test('hidden predictions: you see your own, and everything once it has been played', () => {
  const mine = { id: 'a', by: 'me', round: 0 };
  const theirs = { id: 'b', by: 'you', round: 0 };
  const pack = { id: 'c', by: 'pack:holiday', round: 0 };
  assert.equal(promptVisible(theirs, 'me', true, 0), true);
  assert.equal(promptVisible(mine, 'me', false, 0), true);
  assert.equal(promptVisible(theirs, 'me', false, 0), false);
  assert.equal(promptVisible(pack, 'me', false, 0), false);
  assert.equal(promptVisible(theirs, 'me', false, 1), true); // played in round 1
  assert.equal(promptVisible({ ...theirs, round: 1 }, 'me', false, 1), false); // added after round 1
});

test('hidden mode deals only other players\' predictions', () => {
  const prompts = [
    ...Array.from({ length: 8 }, (_, i) => ({ id: `a${i}`, by: 'A' })),
    ...Array.from({ length: 10 }, (_, i) => ({ id: `b${i}`, by: 'B' })),
  ];
  assert.equal(eligiblePrompts(prompts, 'A', true).length, 10);
  assert.equal(eligiblePrompts(prompts, 'A', false).length, 18);
  assert.deepEqual(dealShortfall(prompts, ['A', 'B'], 3, true), []); // A sees 10, B sees 8: both enough for 3x3
  assert.deepEqual(dealShortfall(prompts, ['A', 'B'], 5, true), [
    { playerId: 'A', have: 10 },
    { playerId: 'B', have: 8 },
  ]);
  assert.deepEqual(dealShortfall(prompts, ['A', 'B'], 5, false), [{ playerId: 'A', have: 18 }]);
  assert.deepEqual(dealShortfall(prompts, ['A', 'B'], 3, false), []);
});
