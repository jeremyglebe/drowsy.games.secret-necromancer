import { shuffle } from '../../Tools.js';
import { buildDeck } from '../cards.js';

/** A shuffled deck of character cards (counts are in cards.js) */
export default function CharDeck() {
    return shuffle(buildDeck(['character']));
}
