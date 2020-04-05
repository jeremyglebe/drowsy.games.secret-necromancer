//imports
const Phaser = require("phaser");
const CardSprite = require("../classes/CardSprite");

class MainGame extends Phaser.Scene {


    constructor() {
        super("MainGame");
    }

    /** stores an array of the card sprites */
    hand = [];

    init() {
        //create players deck
        this.placePlayerSprites();

        // this client's player object
        this.mainPlayer = {}

        //set up an array of they other players
        this.otherPlayers = [];

        this.placeOtherPlayersSprites();
    }

    create() { }

    placePlayerSprites() {
        //place all the cards that are in the players hand
        for (let i = 0; i < this.mainPlayer.hand.length; i++) {
            let tempCard = new CardSprite(200, 650, this.mainPlayer.hand[i], this.mainPlayer.hand.length - i, this);
            this.hand.push(tempCard);
        }
        //sort them at the bottom are of the screen with 200px padding on both sides of the hand
        this.placeHand();

        //place the character card
        this.mainPlayer.characterSprite = new CardSprite(50, 650, this.mainPlayer.character, 0, this);
        //place the role card
        this.mainPlayer.RoleSprite = new CardSprite(50, 500, this.mainPlayer.role, 0, this);
    }

    placeOtherPlayersSprites() {
        this.otherPlayers.charSprites = [];
        this.otherPlayers.healthText = [];
        this.otherPlayers.cardCountIcons = [];
        this.otherPlayers.cardCountText = [];
        let textStyle = {
            Font: "20px",
            color: "white"
        }
        //We assume atleast 3 players since that is the server set minimum, we place them first, then add more if there is more
        //First Other Player
        this.otherPlayers.charSprites[0] = new CardSprite(50, 70, this.otherPlayers[0].character, 0, this);
        this.otherPlayers.healthText[0] = this.add.text(100, 15, String(this.otherPlayers[0].health) + "/100", textStyle);
        this.otherPlayers.cardCountIcons[0] = this.add.sprite(120, 70, "backofspell_graphic").setScale(.7);
        this.otherPlayers.cardCountText[0] = this.add.text(150, 60, String(this.otherPlayers[0].hand.length), textStyle);
        //Second Other Player
        this.otherPlayers.charSprites[1] = new CardSprite(1230, 70, this.otherPlayers[1].character, 0, this);
        this.otherPlayers.healthText[1] = this.add.text(1110, 15, String(this.otherPlayers[1].health) + "/100", textStyle);
        this.otherPlayers.cardCountIcons[1] = this.add.sprite(1160, 70, "backofspell_graphic").setScale(.7);
        this.otherPlayers.cardCountText[1] = this.add.text(1120, 60, String(this.otherPlayers[1].hand.length), textStyle);
        //Third Other Player if there is one
        if (this.otherPlayers.length >= 3) {
            this.otherPlayers.charSprites[2] = new CardSprite(50, 250, this.otherPlayers[2].character, 0, this);
            this.otherPlayers.healthText[2] = this.add.text(100, 195, String(this.otherPlayers[2].health) + "/100", textStyle);
            this.otherPlayers.cardCountIcons[2] = this.add.sprite(120, 250, "backofspell_graphic").setScale(.7);
            this.otherPlayers.cardCountText[2] = this.add.text(150, 240, String(this.otherPlayers[2].hand.length), textStyle);
        }
        //Fourth Other Player if there is one
        if (this.otherPlayers.length == 4) {
            this.otherPlayers.charSprites[3] = new CardSprite(1230, 250, this.otherPlayers[3].character, 0, this);
            this.otherPlayers.healthText[3] = this.add.text(1110, 195, String(this.otherPlayers[3].health) + "/100", textStyle);
            this.otherPlayers.cardCountIcons[3] = this.add.sprite(1160, 250, "backofspell_graphic").setScale(.7);
            this.otherPlayers.cardCountText[3] = this.add.text(1120, 240, String(this.otherPlayers[3].hand.length), textStyle);
        }
    }

    placeHand() {
        let increment = 880 / this.mainPlayer.hand.length;
        let pos = 200;
        for (let i = 0; i < this.mainPlayer.hand.length; i++) {
            this.hand[i].move(pos, 650);
            this.hand[i].setDepth(this.mainPlayer.hand.length - i);
            pos += increment;
        }
    }
}

// exports the class so it may be imported/required elsewhere
module.exports = MainGame;