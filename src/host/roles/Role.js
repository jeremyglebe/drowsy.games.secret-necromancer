/** Stores the name and description of a role on the host's end */
export default class Role {
    constructor(name, description) {
        /** Used both as the name of the card and as the card graphic key for the client */
        this.name = name;
        /** Holds a string description of the role's objective */
        this.description = description;
    }
}
