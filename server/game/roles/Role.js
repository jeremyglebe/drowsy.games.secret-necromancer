/** used to store the name and description of a role on the server's end */

class Role {

    constructor(name,description){
        /** Used both as the name of the card and as the card graghic key for the client */
        this.name = name;
        /** Holds a string Description of the roles objective and job */
        this.description = description;
    }
}

// exports the class so it may be imported/required elsewhere
module.exports = Role;