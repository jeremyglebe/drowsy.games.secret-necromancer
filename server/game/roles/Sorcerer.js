const Role = require("./Role");

class Sorcerer extends Role {

    constructor() {
        super("Sorcerer", ""
            + "You must takeout the\n"
            + "Grandmaster");
    }
}

// exports the class so it may be imported/required elsewhere
module.exports = Sorcerer;