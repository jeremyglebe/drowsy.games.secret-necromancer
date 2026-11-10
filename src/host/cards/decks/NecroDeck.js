import { shuffle } from '../../Tools.js';
import ForgetfulPotion from '../necromancy/ForgetfulPotion.js';
import RiseFromTheDead from '../necromancy/RiseFromTheDead.js';

/** Generates a deck of necromancy cards. */
export default function NecroDeck() {
    const deck = [];
    for (let i = 0; i < 135; i++) deck.push(new ForgetfulPotion());
    for (let i = 0; i < 45; i++) deck.push(new RiseFromTheDead());
    return shuffle(deck);
}
