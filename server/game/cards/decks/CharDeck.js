const tools = require('../../../Tools');
const Bacon = require('../characters/Bacon');
const Lilium = require('../characters/Lilium');
const Tiny = require('../characters/Tiny');

/**
 * Generates a deck of character cards.
 */
function Deck() {
    let deck = [];
    for (let i = 0; i < 3; i++) {
        deck.push(new Bacon());
        deck.push(new Lilium());
        deck.push(new Tiny());
        tools.shuffle(deck);
    }
    return deck;
}

module.exports = Deck();