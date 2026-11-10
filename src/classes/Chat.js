import { textStyle } from './UI.js';

const LINES = 6;
const FONT = 15;
/** Old messages fade out after this long, in ms */
const FADE_AFTER = 15000;

/**
 * The table chat: a few recent lines in the corner of the play area, and a
 * text box that pops up when you press Enter (or click "chat").
 */
export default class Chat {

    /**
     * @param {Phaser.Scene} scene
     * @param {object} opts { x, bottom, width, me, onSend, colorFor }
     */
    constructor(scene, { x, bottom, width, onSend, colorFor }) {
        this.scene = scene;
        this.x = x;
        this.bottom = bottom;
        this.width = width;
        this.onSend = onSend;
        this.colorFor = colorFor || (() => '#ffffff');
        /** Text objects, oldest first */
        this.lines = [];

        this.hint = scene.add.text(x, bottom + 14, "press Enter to chat", textStyle(13, '#ffffff77'))
            .setOrigin(0, 0).setDepth(30).setInteractive({ useHandCursor: true });
        this.hint.on('pointerdown', () => this.open());

        const input = this.input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 120;
        input.placeholder = 'say something (Enter to send, Esc to cancel)';
        input.spellcheck = false;
        input.autocomplete = 'off';
        Object.assign(input.style, {
            width: width + 'px',
            fontSize: '15px',
            padding: '4px 8px',
            fontFamily: 'monospace',
            color: '#fff',
            background: 'rgba(26, 0, 38, 0.9)',
            border: '2px solid #b36bff',
            borderRadius: '6px',
            outline: 'none',
        });
        // Phaser owns the element's display style, so show/hide through it
        this.box = scene.add.dom(x, bottom + 10, input).setOrigin(0, 0).setDepth(30).setVisible(false);
        input.addEventListener('keydown', (e) => {
            e.stopPropagation();
            if (e.key == 'Enter') {
                const text = input.value.trim();
                if (text) this.onSend(text);
                this.close();
            } else if (e.key == 'Escape') {
                this.close();
            }
        });
        input.addEventListener('blur', () => this.close());

        this.onKey = (e) => {
            if (e.key == 'Enter' && document.activeElement != input) this.open();
        };
        window.addEventListener('keydown', this.onKey);
        scene.events.once('shutdown', () => window.removeEventListener('keydown', this.onKey));
    }

    open() {
        this.hint.setVisible(false);
        this.box.setVisible(true);
        this.input.value = '';
        // Wait a tick so the Enter that opened it doesn't also send it
        setTimeout(() => this.input.focus(), 0);
    }

    close() {
        this.box.setVisible(false);
        this.input.blur();
        this.hint.setVisible(true);
    }

    /** Adds a message: { from, text, dead } */
    add({ from, text, dead }) {
        const s = this.scene;
        const color = dead ? '#9a8aa8' : this.colorFor(from);
        const line = s.add.text(this.x, 0, `${dead ? '(dead) ' : ''}${from}: ${text}`, {
            ...textStyle(FONT, color),
            wordWrap: { width: this.width },
            backgroundColor: '#1a002699',
            padding: { x: 4, y: 1 },
        }).setOrigin(0, 1).setDepth(30);
        this.lines.push(line);
        while (this.lines.length > LINES) this.lines.shift().destroy();
        // Stack upward from the bottom, newest at the bottom
        let y = this.bottom;
        for (let i = this.lines.length - 1; i >= 0; i--) {
            this.lines[i].setY(y);
            y -= this.lines[i].height + 2;
        }
        s.time.delayedCall(FADE_AFTER, () => {
            if (line.active) s.tweens.add({ targets: line, alpha: 0.35, duration: 800 });
        });
    }
}
