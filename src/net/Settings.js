import { store } from '../classes/UI.js';

/** Bot "thinking" time between plays, in ms */
export const BOT_SPEEDS = { Fast: 900, Normal: 1800, Slow: 3000 };
/** How long a played card sits in the middle of the table, in ms */
export const CARD_PAUSES = { Short: 500, Normal: 1300, Long: 2400 };

/**
 * The host's table settings. Remembered between visits on the host's
 * machine, and sent to every player when the game starts.
 */
export const settings = {
    botSpeed: store.get('sn-bot-speed', 'Normal'),
    cardPause: store.get('sn-card-pause', 'Normal'),
    get botDelay() { return BOT_SPEEDS[this.botSpeed] ?? BOT_SPEEDS.Normal; },
    get cardHold() { return CARD_PAUSES[this.cardPause] ?? CARD_PAUSES.Normal; },
};

/** Moves a setting to its next option and returns the new value */
export function cycle(key) {
    const options = Object.keys(key == 'botSpeed' ? BOT_SPEEDS : CARD_PAUSES);
    settings[key] = options[(options.indexOf(settings[key]) + 1) % options.length];
    store.set(key == 'botSpeed' ? 'sn-bot-speed' : 'sn-card-pause', settings[key]);
    return settings[key];
}
