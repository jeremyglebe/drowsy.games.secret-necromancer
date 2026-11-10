import { shuffle } from '../../Tools.js';
import Bacon from '../characters/Bacon.js';
import Lilium from '../characters/Lilium.js';
import Tiny from '../characters/Tiny.js';
import Mittens from '../characters/Mittens.js';
import Ember from '../characters/Ember.js';

/** Generates a shuffled deck of character cards. */
export default function CharDeck() {
    const deck = [];
    for (let i = 0; i < 3; i++) {
        deck.push(new Bacon(), new Lilium(), new Tiny(), new Mittens(), new Ember());
    }
    return shuffle(deck);
}
