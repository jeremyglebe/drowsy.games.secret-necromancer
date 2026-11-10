import { shuffle } from '../../Tools.js';
import { buildDeck } from '../cards.js';

/** A shuffled main deck of spells and items (counts are in cards.js) */
export default function MainDeck() {
    return shuffle(buildDeck(['spell', 'item']));
}
