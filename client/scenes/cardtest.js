/** 
 * Temporary Phaser scene to help test the card and construction of the group of cards 
 * just waiting on access to phaser
 */

 class CardTest extends Phaser.Scene {

    fireball;

    constructor(){
        super("cardtest")
    }

    preload(){
        this.load.image("fireball", "../assets/images/cards/fireball_card.png");
        this.load.image("lightning", "../assets/images/cards/lightning_card.png");
    }

    init(){}

    create(){
        this.fireball = this.add.sprite(400,300,"lightning").setInteractive();
        this.fireball.on("pointerover", function(){
            this.setTint(0x00ff00);
        })
        this.fireball.on('pointerout', function () {
            this.clearTint();
        });
        this.fireball.setInteractive();
        this.input.setDraggable(this.fireball);

    this.input.on('dragstart', function (pointer, gameObject) {
        gameObject.setTint(0xff0000);
    });

    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
        gameObject.x = dragX;
        gameObject.y = dragY;
    });

    this.input.on('dragend', function (pointer, gameObject) {
        gameObject.clearTint();
    });
    }

 }

 // exports the class so it may be imported/required elsewhere
module.exports = CardTest;