/** Small UI helpers shared by the scenes */

/**
 * Creates a clickable button (translucent rectangle + label), in the same
 * style the original jam build used.
 * @returns {{ rect: Phaser.GameObjects.Rectangle, text: Phaser.GameObjects.Text, setEnabled: (b: boolean) => void, setVisible: (b: boolean) => void }}
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
    const rect = scene.add.rectangle(x, y, paddedWidth, height, color, 0.5)
        .setOrigin(0.5)
        .setStrokeStyle(2, 0xffffff, 0.6)
        .setInteractive({ useHandCursor: true });
    // Draw the label above its box
    text.setDepth(rect.depth + 1);
    let enabled = true;
    rect.on('pointerover', () => enabled && rect.setFillStyle(color, 0.75));
    rect.on('pointerout', () => rect.setFillStyle(color, enabled ? 0.5 : 0.2));
    rect.on('pointerdown', (pointer) => {
        if (enabled && pointer.leftButtonDown()) onClick();
    });
    return {
        rect,
        text,
        setEnabled(b) {
            enabled = b;
            rect.setFillStyle(color, b ? 0.5 : 0.2);
            text.setAlpha(b ? 1 : 0.5);
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
