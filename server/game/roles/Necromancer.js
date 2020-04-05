const Role = require("./Role");

class Necromancer extends Role {
    constructor() {
        super("Necromancer", ""
            + "You must takeout all\n"
            + "the Wizards first and\n"
            + "then the Grandmaster"
        );
    }
}

// exports the class so it may be imported/required elsewhere
module.exports = Necromancer;