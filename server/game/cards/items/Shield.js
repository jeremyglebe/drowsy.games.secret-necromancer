const Item = require('../abstract/Item');

class Shield extends Item {

    name = "Shield";
    description = "Basic defense\nBlocks 20 damage";

    constructor() {
        super("Shield", "+15% Defense");
    }

    activate(user) {
        user.defense += .15;
    }
}

// exports the class so it may be imported/required elsewhere
module.exports = Shield;