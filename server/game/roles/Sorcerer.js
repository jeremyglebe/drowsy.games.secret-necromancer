const Role = require("./Role");

class Sorcerer extends Role {

    constructor() {
        super("Sorcerer", ""
            + "Protect the\n"
            + "Grandmaster at all\n"
            + "costs!"
        );
    }
}

// exports the class so it may be imported/required elsewhere
module.exports = Sorcerer;