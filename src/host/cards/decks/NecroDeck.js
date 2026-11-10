import { shuffle } from '../../Tools.js';
import ForgetfulPotion from '../necromancy/ForgetfulPotion.js';
import RaiseDead from '../necromancy/RaiseDead.js';

/** Generates a deck of necromancy cards. */
export default function NecroDeck() {
    const deck = [];
    for (let i = 0; i < 135; i++) deck.push(new ForgetfulPotion());
    for (let i = 0; i < 45; i++) deck.push(new RaiseDead());
    return shuffle(deck);
}
