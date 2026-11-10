import { shuffle } from '../../Tools.js';
import Fireball from '../spells/Fireball.js';
import Bolt from '../spells/Bolt.js';
import Shield from '../items/Shield.js';
import Robe from '../items/Robe.js';
import Wand from '../items/Wand.js';

/** Generates a shuffled main deck of spells and items. */
export default function MainDeck() {
    const deck = [];
    for (let i = 0; i < 45; i++) deck.push(new Bolt());
    for (let i = 0; i < 15; i++) deck.push(new Fireball());
    for (let i = 0; i < 8; i++) deck.push(new Shield());
    for (let i = 0; i < 6; i++) deck.push(new Robe());
    for (let i = 0; i < 6; i++) deck.push(new Wand());
    return shuffle(deck);
}
