const tools = require('../../../Tools');
const ForgetfulPotion = require('../necromancy/ForgetfulPotion');


/**
 * Generates a deck of necro cards.
 */
function Deck() {
    let deck = [];
    // Add bolts to the deck
    for (let i = 0; i < 180; i++) deck.push(new ForgetfulPotion());
    // Shuffle 5 times
    for (let i = 0; i < 5; i++) tools.shuffle(deck);
    return deck;
}

module.exports = Deck();