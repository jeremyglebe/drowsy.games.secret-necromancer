// Imports
const Role = require("./Role");

class Grandmaster extends Role {
     
    name = "Grandmaster";
    description = "You must takeout both\nthe wizards and the\nnecromancer";

    constructor(){
        super(Grandmaster.name,Grandmaster.description);
    }
}

// exports the class so it may be imported/required elsewhere
module.exports = Grandmaster;