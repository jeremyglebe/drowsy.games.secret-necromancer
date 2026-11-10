/** Small UI helpers shared by the scenes */

/** Tints for the button variants (the default green ones use the plaque as drawn) */
const BUTTON_TINTS = { 0x88FF88: null, 0xb36bff: 0xd8b8ff, 0x888888: 0xb8b8b8, 0x8899aa: 0xc8d8e8 };

/**
 * Creates a clickable button: the wooden plaque from the jam art, stretched
 * to fit (its rope border and corners stay crisp), with a label on top.
 * @returns {{ rect: Phaser.GameObjects.NineSlice, text: Phaser.GameObjects.Text, setEnabled: (b: boolean) => void, setVisible: (b: boolean) => void }}
 */
export function makeButton(scene, x, y, width, height, label, onClick, color = 0x88FF88) {
    const text = scene.add.text(x, y, label, {
        fontSize: Math.min(32, Math.floor(height * 0.55)) + 'px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
    }).setOrigin(0.5);
    // Grow to fit the label so text never touches the edges
    const paddedWidth = Math.max(width, text.width + 48);
    // The plaque art is 41x18 with a ~6px border. Drawn at 2x so the rope
    // border and corner vines read at the same chunky size as the cards.
    const PIXEL = 2;
    const rect = scene.add.nineslice(x, y, 'plaque', undefined, paddedWidth / PIXEL, height / PIXEL, 6, 6, 6, 6)
        .setOrigin(0.5)
        .setScale(PIXEL)
        .setInteractive({ useHandCursor: true });
    const tint = BUTTON_TINTS[color] ?? null;
    if (tint) rect.setTint(tint);
    // Draw the label above its box
    text.setDepth(rect.depth + 1);
    let enabled = true;
    rect.on('pointerover', () => { if (enabled) { rect.setScale(PIXEL * 1.04); text.setScale(1.04); } });
    rect.on('pointerout', () => { rect.setScale(PIXEL); text.setScale(1); });
    rect.on('pointerdown', (pointer) => {
        if (enabled && pointer.leftButtonDown()) onClick();
    });
    return {
        rect,
        text,
        setEnabled(b) {
            enabled = b;
            rect.setAlpha(b ? 1 : 0.45);
            text.setAlpha(b ? 1 : 0.5);
            if (!b) { rect.setScale(PIXEL); text.setScale(1); }
        },
        setVisible(b) {
            rect.setVisible(b);
            text.setVisible(b);
            if (b) rect.setInteractive({ useHandCursor: true });
            else rect.disableInteractive();
        },
        setDepth(d) {
            rect.setDepth(d);
            text.setDepth(d + 1);
        },
    };
}

/**
 * Creates an HTML text input positioned in the game canvas.
 * @returns {HTMLInputElement}
 */
export function makeInput(scene, x, y, width, { value = '', placeholder = '', maxLength = 16 } = {}) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.placeholder = placeholder;
    input.maxLength = maxLength;
    input.spellcheck = false;
    input.autocomplete = 'off';
    Object.assign(input.style, {
        width: width + 'px',
        fontSize: '30px',
        padding: '6px 12px',
        textAlign: 'center',
        fontFamily: 'monospace',
        color: '#fff',
        background: 'rgba(40, 0, 60, 0.75)',
        border: '2px solid #b36bff',
        borderRadius: '8px',
        outline: 'none',
    });
    scene.add.dom(x, y, input);
    return input;
}

export function textStyle(size = 24, color = '#ffffff') {
    return {
        fontSize: size + 'px',
        color,
        stroke: '#000000',
        strokeThickness: Math.max(3, Math.round(size / 7)),
        align: 'center',
    };
}

/** localStorage wrapper that never throws */
export const store = {
    get(key, fallback = '') {
        try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
    },
    set(key, value) {
        try { localStorage.setItem(key, value); } catch { /* ignore */ }
    },
};
