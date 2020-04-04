//imports
const Phaser = require("phaser");

/** 
 * Used to store the client side version of the card, hold all the same
 * data as the server-side version of the card but tacks on the added Phaser
 * objects.
 */

class CardSprite {

    /** Stores the Card passed to it from the server */
    card;
    /** Stores the group of sprites used to visually represent the card class on the client-side */
    graghic;
    /** Stores the text for the name of the card */
    nameText;
    /** Stores the text for the descrition of the card */
    descripText;
    /** Stores the scene the card is being link/created in */
    scene;

    /** used to create an instance of the card */
    constructor(card, scene){
        this.card = card;
        this.link(scene);
        this.constructGraghic();
    }

    link(scene){
        this.scene = scene;
    }

    /** Used to construct the graghic object or phaser group object upon getting the internal this.card */
    constructGraghic(){
        this.graghic = this.scene.add.sprite(200,200,"fireball");
        this.nameText = this.scene.add.text(300, 300, 'Hello World')
    }

    /** calls to the global socket to emit to the server to active this card */
    active(){

    }
}

// exports the class so it may be imported/required elsewhere
module.exports = CardSprite;

// this.fireball = this.add.sprite(400,300,"lightning").setInteractive();
// this.fireball.on("pointerover", function(){
//     this.setTint(0x00ff00);
// })
// this.fireball.on('pointerout', function () {
//     this.clearTint();
// });
// this.fireball.setInteractive();
// this.input.setDraggable(this.fireball);

// this.input.on('dragstart', function (pointer, gameObject) {
// gameObject.setTint(0xff0000);
// });

// this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
// gameObject.x = dragX;
// gameObject.y = dragY;
// });

// this.input.on('dragend', function (pointer, gameObject) {
// gameObject.clearTint();
// });
// }