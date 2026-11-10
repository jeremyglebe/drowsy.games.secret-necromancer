import Phaser from 'phaser';
import Boot from './scenes/Boot.js';
import Connect from './scenes/Connect.js';
import Lobby from './scenes/Lobby.js';
import MainGame from './scenes/MainGame.js';
import Endingscreen from './scenes/Endingscreen.js';
import Gallery from './scenes/Gallery.js';

/** Configuration object for the main Phaser game object */
const gameConfig = {
    title: 'Secret Necromancer',
    type: Phaser.AUTO,
    parent: 'game',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720,
    },
    pixelArt: true,
    // Right click enlarges cards, so don't show the browser's menu
    disableContextMenu: true,
    dom: {
        createContainer: true,
    },
    backgroundColor: '#000000',
    scene: [Boot, Connect, Lobby, MainGame, Endingscreen, Gallery],
};

const game = new Phaser.Game(gameConfig);
// Handy for debugging from the console
window.game = game;
