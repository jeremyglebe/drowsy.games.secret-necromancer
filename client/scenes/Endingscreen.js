const Phaser = require('phaser');
const client = require('../SocketClient');

class Endingscreen extends Phaser.Scene {

    constructor() {
        super("Endingscreen");
    }

    init(data){
        let status = data.status;
        let username = data.username;
    }

    create() {
        //add background
        let bg = this.add.sprite(0,0,"connectscreen_graphic").setOrigin(0,0);
        //add title
        let title = this.add.sprite(0,0,"title_graphic").setOrigin(0,0);

        //determine win or lose
        if (status == "win"){
            let text = this.add.text(640,360,"You've won!",{color: "green"}).setOrigin(.5,.5);
            text.setFontSize(80);
        } else {
            let text = this.add.text(640,360,
                "You Lost!\n\n" +
                "The winner was: " + username,
                {color: "red"}).setOrigin(.5,.5);
            text.setFontSize(80);
        }
    }

}

module.exports = Endingscreen;