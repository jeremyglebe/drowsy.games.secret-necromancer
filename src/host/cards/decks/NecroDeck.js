import { shuffle } from '../../Tools.js';
import ForgetfulPotion from '../necromancy/ForgetfulPotion.js';

/** Generates a deck of necromancy cards. */
export default function NecroDeck() {
    const deck = [];
    for (let i = 0; i < 180; i++) deck.push(new ForgetfulPotion());
    return shuffle(deck);
}
