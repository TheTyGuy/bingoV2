# kaBINGO!

**Predict the party. Call it first.**

kaBINGO! is bingo for any get-together. Instead of numbers, the squares are things the group predicts will happen: someone spills a drink, the speech runs long, the dog steals food. Everyone plays on their own phone.

(Formerly *Dad Bingo*. The original lives on as the "Dad Bingo" starter pack.)

## How a game works

1. **Start a game.** You get a 4-letter code and a QR code to share.
2. **Make predictions together.** Anyone can add them, and the host can drop in a starter pack. Cards are 3×3 (8 predictions), 5×5 (24) or 7×7 (48).
3. **Deal the cards.** Each player gets the same predictions in a different shuffled order, with a free space in the middle.
4. **Mark squares** as things happen in real life. The table shows how close everyone is.
5. **Call kaBINGO!** once you complete the pattern (any line, four corners, big X or blackout). Everyone else has 30 seconds to vote on whether it really happened. Majority rules; ties and no-shows go to the caller.
6. **BUSTED** if rejected, and play goes on. If approved, the round is yours. The host can deal a new round or edit the predictions.

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

## Code map

| Path | What's there |
| --- | --- |
| `lib/bingo.ts` | Pure game rules: dealing cards, win patterns, vote outcome, game codes (tested in `lib/bingo.test.ts`) |
| `lib/actions.ts` | Everything a player can do: create/join, add predictions, deal, mark, call, vote |
| `lib/backend/` | Storage behind one interface: `firebase.ts` (Firestore + anonymous auth) and `local.ts` (demo mode) |
| `lib/packs.ts` | Starter prediction packs |
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
