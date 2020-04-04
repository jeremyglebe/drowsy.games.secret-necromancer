class Card {
    /** @type {string} unique name/id of the card */
    name;
    /**
     * @type {string} a string representing the type of target this card
     * affects.
     * Possible values:
     *     'self': Affects the user of the card
     *   'player': Affects another player within the user's focus
     *   'others': Affects all other players besides the user
     *      'all': Affects all players
     */
    targetType;

    /**
     * Method that runs the cards effect. Should be overridden for most
     * unique cards.
     * @param field The object containing all information associated with the
     * current game field and status of the game.
     * @param targets A list of targets which should be affected by this
     * activated ability. This should be their unique socket id, not username.
     * (When the client sends a username to attack, it should first be
     * processed by another function to produce a socket id)
     */
    activate(field, targets) {
        for (let target of targets) {
            let ply = field['players'][target];
            console.log(ply, " was affected by a card!");
        }
    }
}

class AttackCard extends Card {
    /**
     * Calculates the attack card's damage.
     * @return number, damage that the attack inflicts
     */
    damage() {
        // Damage is between 1 and 10
        return Math.floor(Math.random() * 10 + 1);
    }
    /**
     * Attacks the target, inflicting the appropriate amount of damage.
     * @param field The object containing all information associated with the
     * current game field and status of the game.
     * @param targets A list of targets which should be affected by this
     * activated ability. This should be their unique socket id, not username.
     * (When the client sends a username to attack, it should first be
     * processed by another function to produce a socket id)
     */
    activate(field, targets) {
        for (let target of targets) {
            let ply = field['players'][target];
            // Calculate the player's defense, subtract it from the damage
            // percent. Change the percent into a decimal. (ex. 30%->.3)
            let damageFactor = ((100 - ply.getDef()) / 100);
            // Reduce players health, accounting for defense
            let dmg = damageFactor * this.damage();
            ply.hp -= dmg;
            // Log what happened
            console.log(ply, " was attacked for ", dmg, '! ', ply.hp, ' remaining!');
        }
    }
}