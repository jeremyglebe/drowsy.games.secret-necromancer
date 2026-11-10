import { shuffle } from '../../Tools.js';
import { buildDeck } from '../cards.js';

/** A shuffled deck of the Necromancer's dark arts (counts are in cards.js) */
export default function NecroDeck() {
    return shuffle(buildDeck(['necromancy']));
}
