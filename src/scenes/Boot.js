//imports
import Phaser from "phaser";

/** Loads all of the game's images, then moves on to the Connect screen */

class Boot extends Phaser.Scene {

    constructor() {
        super("Boot")
    }

    preload() {
        this.load.image("Fireball_graphic", "assets/cards/fireball_card.png");
        this.load.image("Bolt_graphic", "assets/cards/lightning_card.png");
        this.load.image("Shield_graphic", "assets/cards/shield_card.png");
        this.load.image("Witch Brew_graphic", "assets/cards/cauldron_card.png");
        this.load.image("Grandmaster_graphic", "assets/cards/grandmaster_card.png");
        this.load.image("Necromancer_graphic", "assets/cards/necromancer_card.png");
        this.load.image("Sorcerer_graphic", "assets/cards/wizard_card.png");
        this.load.image("Tiny_graphic", "assets/cards/tiny_card.png");
        this.load.image("Lord Bacon_graphic", "assets/cards/bacon_card.png");
        this.load.image("Lilium_graphic", "assets/cards/lilium_card.png");
        this.load.image("backofspell_graphic", "assets/cards/light_card_back.png");
        this.load.image("lobby_graphic","assets/backgrounds/lobby.png")
        this.load.image("gamebackground_graphic","assets/backgrounds/main_screen_2.png")
        this.load.image("connectscreen_graphic","assets/backgrounds/portal_2.png")
        this.load.image("title_graphic","assets/backgrounds/title.png")
        this.load.image("endingscreen_graphic","assets/backgrounds/main_screen.png")
    }

    init() { }

    create() {
        this.scene.start("Connect");
    }
}

// exports the class so it may be imported/required elsewhere
export default Boot;