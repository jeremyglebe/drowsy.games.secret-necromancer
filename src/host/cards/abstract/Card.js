/** Keeps track of basic data about a card on the host's end */
export default class Card {
    constructor(name, description) {
        /** Used both as the name of the card and as the card graphic key for the client */
        this.name = name;
        /** Holds a string description of what the card does */
        this.description = description;
    }

    /** Activates the card's effect */
    activate() { }
}
