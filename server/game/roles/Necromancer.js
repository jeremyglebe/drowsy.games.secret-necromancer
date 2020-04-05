// Imports
const Role = require("./Role");

class Necromancer extends Role {
     
    name = "Necromancer";
    description = "You must takeout all\nthe Wizards first and\nthen the Grandmaster";

    constructor(){
        super(Necromancer.name,Necromancer.description);
    }
}

// exports the class so it may be imported/required elsewhere
module.exports = Necromancer;