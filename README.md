# Secret Necromancer

A secret identity card game about sorcery and the dark arts, for 4-5 players.

**[Play it in your browser](https://jeremyglebe.github.io/game_jam_cardgame/)**

## About this project

Back in April 2020, Gracie, Zach and I made this for a game jam... and didn't finish it. It sat on my GitHub half-working ever since: a Node/socket.io server you had to run yourself, an Electron client that couldn't really finish a game, and no release.

Six years later I got a little nostalgic and decided to "finish" it, just once, for a laugh. That means **playable, nothing deeper**. The rules are still our jam-weekend rules, the balance is whatever it is, and the art is the art we drew back then. I don't plan to update it again, so consider it done (enough).

What changed in the 2026 update:

- **No server to host anymore.** Games run peer-to-peer in the browser. One player hosts, and their browser runs the game. Everyone else joins with a 4-letter room code. Matchmaking goes through the free public [PeerJS](https://peerjs.com/) server, so there's nothing to deploy.
- **It's trust based.** The host's browser is the referee, so the host could cheat if they really wanted to. Don't play with people who would do that.
- **It's a website now** instead of an Electron app.
- **An interactive tutorial** where you play a game against a few (not very smart) bots.
- A pile of bug fixes so a game can actually be played from start to finish.

## How to play

1. Everyone opens the game. One person clicks **Host a Game** and shares the room code (or the invite link from the lobby).
2. Everyone else types the code and clicks **Join**.
3. When 4 or 5 sorcerers have gathered, the host clicks **Start The Game**.

If you've never played, click **How to Play (Tutorial)** on the title screen.

### Rules

Every player secretly gets a role:

| Role | Who knows? | Goal |
| --- | --- | --- |
| **Grandmaster** | Everyone | Destroy the Necromancer |
| **Sorcerer** | Only you | Protect the Grandmaster, destroy the Necromancer |
| **Necromancer** | Only you | Kill the Grandmaster |

If the Necromancer dies, everyone else wins. If the Grandmaster dies, the Necromancer wins.

On your turn you draw a card, play as many cards as you like, then click **End Turn**. Drag a card to play it:

- **Bolt**: drop it on a player. Deals 10-20 damage.
- **Fireball**: drop it in the middle of the table. Deals 10 damage to *every* other player, including the Grandmaster.
- **Shield**: drop it on your own character card. Blocks 15% of incoming damage (stacks up to 60%).

The Necromancer also secretly draws **Witch Brew** cards. They can queue one per turn on a victim, and it takes effect during the **Necromancy phase** at the end of each round, making the victim lose a random card. So keep an eye on who is attacking the Grandmaster.

Hover over any card to read it, or right-click to enlarge it.

## Running it locally

You'll need Node.js 18 or newer.

```bash
npm install
npm run dev      # dev server at http://localhost:5173
npm test         # plays a batch of bot-vs-bot games headlessly
npm run build    # static build in dist/
```

The build is just static files, so it can go on any static host. It does need to be *served* (e.g. `npx vite preview` or `npx serve dist`); opening `index.html` straight from disk won't work.

## How it's put together

- `src/host/`: the game rules. This used to be the Node server. Now it runs in the host player's browser tab.
- `src/net/`: PeerJS networking. It keeps the socket.io-style `emit`/`on` API that the original code was written against, which meant most of the old game code survived.
- `src/scenes/`: the Phaser 3 scenes (title, lobby, game, ending).
- `src/bots/`: the simple bot players used by the tutorial and the tests.
- `public/assets/`: the card art and backgrounds from the jam. `assets/art_dump/` has the original art files.

## Credits

Made by Jeremy Glebe, Gracie Glebe and Zachary Kingcade.

MIT licensed.
