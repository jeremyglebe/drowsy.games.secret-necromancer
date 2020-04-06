//imports
const Phaser = require("phaser");
const Boot = require("./scenes/Boot");
// const CardTest = require("./scenes/Cardtest");
const Connect = require('./scenes/Connect');
const Lobby = require('./scenes/Lobby');
const MainGame = require("./scenes/Maingame");
const Endingscreen = require("./scenes/Endingscreen");

/** Start of the Phaser game object*/

/** configuartion object for the main Phaser game object */
const gameConfig = {
    title: 'Circle of Fate - Client',

    type: Phaser.AUTO,

    scale: {
        parent: 'game',
        mode: Phaser.Scale.FIT,
        width: 1280,
        height: 720
    },

    pixelArt: true,

    dom: {
        createContainer: true
    },

    backgroundColor: '#000000',

    scene: [
        Boot,
        Connect,
        // CardTest,
        Lobby,
        MainGame,
        Endingscreen
    ]
};

//create the primary game object
const game = new Phaser.Game(gameConfig);

// Starts the first scene, for now is a test
// game.scene.start("boot");