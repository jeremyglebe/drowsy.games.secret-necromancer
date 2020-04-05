const Card = require('./Card');

class Item extends Card {

    constructor(name, description) {
        super(name, description)
    }

    /**
     * Activates the cards effects. Modifies user's stats. Activated any time
     * user's stats are calculated.
     */
    activate(user) { };

}

module.exports = Item;