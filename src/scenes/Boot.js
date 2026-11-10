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
        this.load.image("Robe_graphic", "assets/cards/robe_card.png");
        this.load.image("Wand_graphic", "assets/cards/wand_card.png");
        this.load.image("Raise Dead_graphic", "assets/cards/raise_dead_card.png");
        this.load.image("Thrall_graphic", "assets/cards/thrall_card.png");
        this.load.image("Healing Potion_graphic", "assets/cards/healing_potion_card.png");
        this.load.image("Freeze_graphic", "assets/cards/freeze_card.png");
        this.load.image("Mana Crystal_graphic", "assets/cards/mana_crystal_card.png");
        this.load.image("Loot_graphic", "assets/cards/loot_card.png");
        this.load.image("Eldritch Horror_graphic", "assets/cards/eldritch_horror_card.png");
        this.load.image("charback_graphic", "assets/cards/character_card_back.png");
        this.load.image("gallery_graphic", "assets/backgrounds/portal.png");
        this.load.image("icon_sword", "assets/ui/sword.png");
        this.load.image("icon_shield", "assets/ui/shield.png");
        this.load.image("icon_rook", "assets/ui/rook.png");
        this.load.image("icon_ice", "assets/ui/ice.png");
        this.load.image("icon_crystal", "assets/ui/crystal.png");
        this.load.image("horror", "assets/ui/horror.png");
        this.load.image("plaque", "assets/ui/plaque.png");
        this.load.image("roleback_graphic", "assets/cards/role_card_back.png");
        this.load.image("darkback_graphic", "assets/cards/dark_card_back.png");
        this.load.image("Witch Brew_graphic", "assets/cards/cauldron_card.png");
        this.load.image("Grandmaster_graphic", "assets/cards/grandmaster_card.png");
        this.load.image("Necromancer_graphic", "assets/cards/necromancer_card.png");
        this.load.image("Sorcerer_graphic", "assets/cards/wizard_card.png");
        this.load.image("Tiny_graphic", "assets/cards/tiny_card.png");
        this.load.image("Lord Bacon_graphic", "assets/cards/bacon_card.png");
        this.load.image("Lilium_graphic", "assets/cards/lilium_card.png");
        this.load.image("Professor Mittens_graphic", "assets/cards/mittens_card.png");
        this.load.image("Ember_graphic", "assets/cards/ember_card.png");
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