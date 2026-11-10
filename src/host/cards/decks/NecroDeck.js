import { shuffle } from '../../Tools.js';
import ForgetfulPotion from '../necromancy/ForgetfulPotion.js';
import RaiseDead from '../necromancy/RaiseDead.js';
import EldritchHorror from '../necromancy/EldritchHorror.js';

/** Generates a deck of necromancy cards. */
export default function NecroDeck() {
    const deck = [];
    for (let i = 0; i < 110; i++) deck.push(new ForgetfulPotion());
    for (let i = 0; i < 40; i++) deck.push(new RaiseDead());
    for (let i = 0; i < 30; i++) deck.push(new EldritchHorror());
    return shuffle(deck);
}
