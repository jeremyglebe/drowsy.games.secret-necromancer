const Role = require("./Role");

class Grandmaster extends Role {

    constructor() {
        super("Grandmaster", ""
            + "You must takeout both\n"
            + "the wizards and the\n"
            + "necromancer");
    }
}

// exports the class so it may be imported/required elsewhere
module.exports = Grandmaster;