# kaBINGO!

**Predict the party. Call it first.**

kaBINGO! is bingo for any get-together. Instead of numbers, the squares are things the group predicts will happen: someone spills a drink, the speech runs long, the dog steals food. Everyone plays on their own phone.

(Formerly *Dad Bingo*. The original lives on as the "Dad Bingo" starter pack.)

## How a game works

1. **Start a game.** You get a 4-letter code and a QR code to share.
2. **Make predictions together.** Anyone can add them, and the host can drop in a starter pack. Cards are 3×3 (8 predictions), 5×5 (24) or 7×7 (48).
3. **Deal the cards.** Everyone gets a different shuffle, with a free space in the middle.
4. **Mark squares** as things happen in real life. The table shows how close everyone is.
5. **Call kaBINGO!** once you complete the pattern (any line, four corners, big X or blackout). Your card pops up on every screen with the winning squares lit, and everyone else has 45 seconds to vote. Majority of votes wins, and the vote ends the moment the result is certain; ties and no-shows go to the caller.
6. **Rejected?** "No" voters tap the squares that didn't really happen, and those are struck out of the caller's card for the rest of the round. **Approved?** Everyone goes to the score screen. There, players can add or remove predictions and say whether they're in for another round, and the host deals the next one.

### Host options

- **Show everyone's predictions** (on by default). Off is *secret mode*: you only see your own predictions until they've been played, and you never get your own on your card.
- **Show called squares** (on by default). A shared list under the board shows every square anyone marks, like a caller shouting "B-16!", with a one-tap **Mark it!** when it's on your card too.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # game-logic unit tests
npm run build      # static site in out/
```

### Where it runs

The live game is at **https://kabingo-72b5b.web.app**, on the `kabingo-72b5b` Firebase project. It uses Firestore for game data and anonymous sign-in for player IDs.

- **Publishing is automatic.** `.github/workflows/deploy.yml` runs the tests and builds the site on every push and pull request.
  - Merges to `master` go live.
  - Each pull request gets its own preview link, posted as a comment and valid for 14 days.
  - Deploying needs the `FIREBASE_SERVICE_ACCOUNT` repository secret: the service-account JSON from Firebase → Project settings → Service accounts. Without it, the tests still run and the deploy step is skipped.
- **The web settings** live in `.env`. They aren't secrets, since every visitor's browser receives them. The data is protected by `firestore.rules`.
- **Changing `firestore.rules`?** Paste the new rules into Firebase console → Firestore Database → Rules and click **Publish**, or run `npx firebase-tools deploy --only firestore:rules`. The workflow only publishes the website.

### Demo mode

`npm run dev` uses the real Firebase project too. To work offline instead, create `.env.local` containing `NEXT_PUBLIC_FIREBASE_PROJECT_ID=`. The app then runs in demo mode: games are stored in the browser, and each tab is a separate player.

## Skins (seasonal looks)

The game's look is a swappable **skin**. The live one is set by one line in `skin.config.ts`:

```ts
export const ACTIVE_SKIN: SkinId = 'fall'; // or 'classic', 'twilight'
```

Change it, push or merge to `master`, and the live site switches about a minute later.

**To preview a skin without switching:** add `?skin=<id>` to any page address, for example `https://kabingo-72b5b.web.app/?skin=classic`. The preview sticks for that browser tab, and `?skin=default` turns it off.

| Skin | Look |
| --- | --- |
| `classic` | The original comic book: halftone dots, black ink, red, yellow and blue |
| `fall` | Autumn valley at sunset: maple leaves, pumpkins, wood signs, parchment cards, cranberry buttons |
| `twilight` | Moonlit Pacific Northwest forest: misty pines, a howling wolf, crimson lilies, gothic serif lettering, dark slate panels, red-apple stamps, a moon free square, drifting fog |

**To add a skin:**
1. Add it to `skins/index.ts` with its name, phone toolbar color, confetti colors and shape choices: logo (starburst or gothic), call-out shape (starburst or moon), stamp (circle or apple), free space, and background motion (leaves, fog or none).
2. Create `styles/skins/<id>.css` with every rule scoped to `html[data-skin='<id>']`. Usually that means overriding the color settings (`--color-ink`, `--color-paper`, `--color-pow`…) and the font, plus any extra touches. Import it at the top of `styles/globals.css`.
3. Put artwork in `public/skins/<id>/`.

## Code map

| Path | What's there |
| --- | --- |
| `lib/bingo.ts` | Pure game rules: dealing cards, win patterns, vote outcome, game codes (tested in `lib/bingo.test.ts`) |
| `lib/actions.ts` | Everything a player can do: create/join, add predictions, deal, mark, call, vote |
| `lib/backend/` | Storage behind one interface: `firebase.ts` (Firestore + anonymous auth) and `local.ts` (demo mode) |
| `lib/packs.ts` | Starter prediction packs |
| `skin.config.ts`, `skins/`, `styles/skins/`, `public/skins/` | The live skin and the skin library |
| `pages/` | Home, game (`/game?code=ABCD`), rules |
| `components/phases/` | The four game screens: setup, playing, voting, won |
| `firestore.rules` | Database security rules |

## Ideas for next time

- Custom free-space photo (the guest of honor)
- Sound effects
- TV / shared-screen mode
- A live feed of who marked what and when
- AI-suggested predictions for a theme
- Upvoting predictions so the best ones make the cards
