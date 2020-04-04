/** holds all the server's data on each character */

class Character {
    
    constructor(name, ablilty){
        this.name = name;
        this.description = ablilty;
    }

    /** Activates the cards effect */
    activate(){}
}

// exports the class so it may be imported/required elsewhere
module.exports = Character;
