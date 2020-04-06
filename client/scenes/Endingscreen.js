const Phaser = require('phaser');
const client = require('../SocketClient');

class Endingscreen extends Phaser.Scene {

    constructor() {
        super("Endingscreen");
    }

    init(data) {
        console.log("game over", data);
        this.status = data.status;
        this.winners = data.winners;
    }

    create() {
        //add background
        let bg = this.add.sprite(0, 0, "connectscreen_graphic").setOrigin(0, 0);
        //add title
        let title = this.add.sprite(0, 0, "title_graphic").setOrigin(0, 0);

        //determine win or lose
        if (this.status == "won") {
            let text = this.add.text(640, 360, "You've won!", { color: "green" }).setOrigin(.5, .5);
            text.setFontSize(60);
        } else {
            let text = this.add.text(640, 360,
                "You Lost!\n\n" +
                "The winner was: ",
                { color: "red", align: 'center' }).setOrigin(.5, .5);
            text.setFontSize(60);
            for (let winner of this.winners) {
                text.text += winner + ' ';
            }
        }
    }

}

module.exports = Endingscreen;