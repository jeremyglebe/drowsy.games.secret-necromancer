// Imports
const Role = require("./Role");

class Wizard extends Role {
     
    name = "Wizard";
    description = "You must takeout the\nGrandmaster";

    constructor(){
        super(Wizard.name,Wizard.description);
    }
}

// exports the class so it may be imported/required elsewhere
module.exports = Wizard;