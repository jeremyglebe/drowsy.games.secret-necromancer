# Secret Necromancer

Play it here: https://necromancer.drowsy.games/

Gracie, Zach and I made this for a game jam in April 2020. We didn't finish it. You needed to run a Node server yourself to play, the client was an Electron app, and as far as I remember nobody ever got through a full game.

In 2026 I got nostalgic and fixed it up enough to actually play. It's a website now, it runs peer to peer so there's no server to keep alive, and there's a tutorial with some bots. The rules and art are the same stuff we threw together back then, except Bolt is limited to one per turn like we meant it to be. Unlimited Bolts was because we ran out of time.

I don't plan on touching it again after this.

## Playing

You need 4 or 5 people. One person clicks Host a Game and sends everyone the room code (or the invite link in the lobby). Everyone else types in the code and clicks Join. The host starts the game once everyone's in. If you're short on people, the host can fill empty seats with bots. They're not geniuses, but they do try to figure out who the Necromancer is. The host can also slow the bots down, or make played cards hang around in the middle of the table longer, if people need more time to see what's going on.

If you've never played, there's a tutorial on the title screen.

## Rules

It's kind of Bang! mixed with a little MTG. Everyone gets a secret role.

The Grandmaster is revealed to everyone at the start. Their goal is to kill the Necromancer.

The Necromancer is secret. They win if the Grandmaster dies.

Everyone else is a Sorcerer. Sorcerers are on the Grandmaster's side, but nobody knows who they are, so from the outside a Sorcerer looks exactly like the Necromancer.

On your turn you draw a card, play whatever you want, and end your turn. You play cards by dragging them:

- Bolt: drag it onto a player for 10-20 damage. One per turn.
- Fireball: drag it into the middle of the table. 10 damage to every other player, Grandmaster included, so be careful.
- Shield: drag it onto your own character card. Blocks 15% of damage, stacks up to 60%.
- Robe: same deal, gives you a 20% chance to dodge Bolts. Stacks up to 60%.
- Wand: same deal, your Bolts and Fireballs do 5 more damage. Stacks.

The Necromancer also secretly gets Witch Brew cards. They can set one up on their turn, and at the end of the round it hits the victim for 30 damage and makes them discard a random card. That's the Necromancer's real weapon, since Bolting the Grandmaster out in the open is a good way to get caught.

They also get Rise From the Dead, which brings a dead player back with half their HP as the Necromancer's Thrall. Thralls win if the Necromancer wins. They aren't allowed to Bolt the Necromancer, but nothing stops a Thrall with a grudge from throwing a Fireball.

You can hover a card to read it or right-click to make it big.

## About the multiplayer

It uses [PeerJS](https://peerjs.com/). The host's browser runs the game and everyone else connects straight to them. PeerJS's free public server is only used to connect people to each other. That means the host could cheat if they really wanted to. Play with friends.

Also, if the host closes their tab, the game's over for everyone.

## Running it yourself

```bash
npm install
npm run dev
```

`npm test` runs a bunch of bot-only games to make sure nothing's broken, and `npm run build` spits out a static site in `dist/`. You have to serve that folder with something (`npx vite preview` works); opening the HTML file directly won't load.

If you're poking around the code: the game rules are in `src/host` (this used to be the server), the networking is in `src/net`, the Phaser scenes are in `src/scenes`, and the bots are in `src/bots`. The original art files from the jam are in `assets/art_dump`.

## Credits

Jeremy Glebe, Gracie Glebe and Zachary Kingcade.
