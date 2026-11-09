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

### Demo mode vs. Firebase

With no configuration, the app runs in **demo mode**. Games are stored in the browser, and each tab is a separate player. Open a few tabs to try it alone.

To play across phones, connect Firebase:

1. In the [Firebase console](https://console.firebase.google.com/), open the project (currently `dadbingo-4079f`, see `.firebaserc`) or create one.
2. Turn on **Authentication → Sign-in method → Anonymous**.
3. Create a **Firestore** database.
4. Copy `.env.example` to `.env.local` and fill in the web app config (Project settings → Your apps).
5. Deploy the security rules and the site:
   ```bash
   npm run build
   npx firebase-tools deploy --only firestore:rules,hosting
   ```

The app is a fully static export, so `out/` can also be hosted on Vercel, Netlify or GitHub Pages. Set the same `NEXT_PUBLIC_FIREBASE_*` variables there.

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
