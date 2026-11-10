import { shuffle } from '../../Tools.js';
import Fireball from '../spells/Fireball.js';
import Bolt from '../spells/Bolt.js';
import HealingPotion from '../spells/HealingPotion.js';
import Freeze from '../spells/Freeze.js';
import ManaCrystal from '../spells/ManaCrystal.js';
import Loot from '../spells/Loot.js';
import Shield from '../items/Shield.js';
import Robe from '../items/Robe.js';
import Wand from '../items/Wand.js';

/** Generates a shuffled main deck of spells and items. */
export default function MainDeck() {
    const deck = [];
    const add = (count, Card) => { for (let i = 0; i < count; i++) deck.push(new Card()); };
    add(45, Bolt);
    add(15, Fireball);
    add(4, HealingPotion);
    add(3, Freeze);
    add(5, ManaCrystal);
    add(4, Loot);
    add(8, Shield);
    add(6, Robe);
    add(6, Wand);
    return shuffle(deck);
}
