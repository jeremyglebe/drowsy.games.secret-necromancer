# Secret Necromancer

Play it here: https://necromancer.drowsy.games/

Gracie, Zach and I made this for a game jam in April 2020. We didn't finish it. You needed to run a Node server yourself to play, the client was an Electron app, and as far as I remember nobody ever got through a full game.

In 2026 I got nostalgic and fixed it up enough to actually play. It's a website now, it runs peer to peer so there's no server to keep alive, and there's a tutorial with some bots. The rules and art are the same stuff we threw together back then, except Bolt is limited to one per turn like we meant it to be. Unlimited Bolts was because we ran out of time.

I don't plan on touching it again after this.

## Playing

You need 4 or 5 people. One person clicks Host a Game and sends everyone the room code (or the invite link in the lobby). Everyone else types in the code and clicks Join. The host starts the game once everyone's in. If you're short on people, the host can fill empty seats with bots. They're not geniuses, but they do try to figure out who the Necromancer is. The host can also slow the bots down, or make played cards hang around in the middle of the table longer, if people need more time to see what's going on.

If you've never played, there's a tutorial on the title screen, and a Browse Cards button if you just want to look through everything first.

## Rules

It's kind of Bang! mixed with a little MTG. Everyone gets a secret role.

The Grandmaster is revealed to everyone at the start. Their goal is to kill the Necromancer.

The Necromancer is secret. They win if the Grandmaster dies.

Everyone else is a Sorcerer. Sorcerers are on the Grandmaster's side, but nobody knows who they are, so from the outside a Sorcerer looks exactly like the Necromancer.

You also get a random character, and like in Bang! each one has an ability:

- Lord Bacon: draws 2 cards a turn.
- Lilium: can cast 2 Bolts a turn.
- Tiny: takes 3 less damage from everything.
- Professor Mittens: survives the first time they'd die, with 1 HP.
- Ember: Fireballs don't hurt them.

Before any cards get dealt, everyone gets to look at their role and character (and everyone else's character) and click Ready.

On your turn you get 1 mana and draw a card, play whatever you can afford, and end your turn. Mana you don't spend carries over. Every card has its cost in the top corner. Your mana is secret, so nobody knows if you're saving up for something or if you're the Necromancer and already spent it.

You play cards by dragging them:

- Bolt (1): drag it onto a player for 10-20 damage. One per turn (two for Lilium).
- Fireball (2): drag it into the middle of the table. 10 damage to every other player, Grandmaster included, so be careful.
- Shield (1): drag it onto your own character card. Blocks 15% of damage, stacks up to 60%.
- Robe (1): same deal, gives you a 20% chance to dodge Bolts. Stacks up to 60%.
- Wand (1): same deal, your Bolts and Fireballs do 5 more damage. Stacks.
- Healing Potion (2): drag it onto yourself or anyone else to heal 15 HP.
- Freeze (3): drag it onto a player and they skip their next turn.
- Mana Crystal (free): you get 1 more mana every turn for the rest of the game. Everyone can see how many crystals you have.
- Loot (1): drag it onto a player to steal a random card from them.

The Necromancer also secretly gets dark arts. They pay for one on their turn and it goes off in the Necromancy phase at the end of the round, with nobody's name on it:

- Witch Brew (1): the victim loses all their banked mana and 2 random cards.
- Eldritch Horror (3): a monster crawls onto the middle of the table and mauls someone at random for 20-30 every round, the Necromancer included, until somebody kills it. You can Bolt it, and Fireballs hit it too.
- Raise Dead (2): brings a dead player back with half their HP as the Necromancer's Thrall. Thralls win if the Necromancer wins. They aren't allowed to Bolt the Necromancer, but nothing stops a Thrall with a grudge from throwing a Fireball.

And the Necromancer's Bolts are free. Since nobody can see anyone's mana, nobody can tell.

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

If you're poking around the code: the game rules are in `src/host` (this used to be the server), the networking is in `src/net`, the Phaser scenes are in `src/scenes`, and the bots are in `src/bots`. Art the game uses is in `public/assets`. As of 2026 every piece of art we drew for the jam is in the game somewhere. The raw drawings and blank card frames are in `public/design` in case anyone ever wants to make more cards.

## Credits

Jeremy Glebe, Gracie Glebe and Zachary Kingcade.
