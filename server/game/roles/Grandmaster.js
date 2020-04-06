const Role = require("./Role");

class Grandmaster extends Role {

    constructor() {
        super("Grandmaster", ""
            + "You must destroy the\n"
            + "Necromancer!");
    }
}

// exports the class so it may be imported/required elsewhere
module.exports = Grandmaster;