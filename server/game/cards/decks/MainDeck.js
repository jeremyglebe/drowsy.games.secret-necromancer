const tools = require('../../../Tools');
const Fireball = require('../spells/Fireball');
const Bolt = require('../spells/Bolt');


/**
 * Generates a deck of character cards.
 */
function Deck() {
    let deck = [];
    // Add bolts to the deck
    for (let i = 0; i < 45; i++) deck.push(new Bolt());
    // Add fireballs to the deck
    for (let i = 0; i < 15; i++) deck.push(new Fireball());
    // Shuffle 5 times
    for (let i = 0; i < 5; i++) tools.shuffle(deck);
    return deck;
}

module.exports = Deck();