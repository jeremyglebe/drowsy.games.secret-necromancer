const Necromancy = require('../abstract/Necromancy');

class ForgetfulPotion extends Necromancy {

    constructor() {
        super("Witch Brew", ""
            + "Player loses a\n"
            + "random card\n", 'player');
    }

    activate(field) {
        let hand = field.players[this.target].hand;
        let card = hand.splice(0, 1);
        field.discard.push(card[0]);
    }

}

module.exports = ForgetfulPotion;