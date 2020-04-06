const Role = require("./Role");

class Necromancer extends Role {
    constructor() {
        super("Necromancer", ""
            + "You must kill the\n"
            + "Grandmaster...\n"
        );
    }
}

// exports the class so it may be imported/required elsewhere
module.exports = Necromancer;